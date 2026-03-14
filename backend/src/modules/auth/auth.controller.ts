import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { registerSchema, loginSchema } from './auth.schemas';
import {
  addDays,
  addHours,
  clearAuthCookies,
  createActivationToken,
  createCsrfToken,
  createOpaqueToken,
  getClientMetadata,
  getRefreshTokenFromRequest,
  hashToken,
  setAuthCookies,
  signAccessToken,
  toPublicUser,
} from './auth.security';

type RequestWithUser = Request & { user: { id: string; role: 'USER' | 'ADMIN' } };

function requireUser(req: Request): asserts req is RequestWithUser {
  if (!req.user) {
    throw new Error('authMiddleware not applied: req.user is missing');
  }
}

async function revokeRefreshFamily(family: string, reason: string, now: Date) {
  await prisma.refreshTokenSession.updateMany({
    where: { family, revokedAt: null },
    data: { revokedAt: now, revokedReason: reason },
  });
}

// POST /auth/register
export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
  }
  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'E-mail já registrado' });

  const passwordHash = await bcrypt.hash(password, 12);
  const activationToken = createActivationToken();
  const activationTokenExpiresAt = addHours(new Date(), env.activationTokenHours);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: 'USER',
      isActive: false,
      activationToken,
      activationTokenExpiresAt,
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  // “envio de e-mail” simulado
  const activationUrl = `http://localhost:${env.port}/auth/activate/${activationToken}`;
  console.log('📧 Ativação simulada:', activationUrl);

  return res.status(201).json({
    message: 'Usuário registrado. Verifique o link de ativação no console.',
    user: toPublicUser(user),
  });
}

// POST /auth/login
export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });

  if (!user.isActive) return res.status(403).json({ message: 'Conta não ativada' });

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = createOpaqueToken();
  const csrfToken = createCsrfToken();
  const metadata = getClientMetadata(req);

  await prisma.refreshTokenSession.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      family: randomUUID(),
      tokenHash: hashToken(refreshToken),
      expiresAt: addDays(new Date(), env.refreshTokenDays),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    },
  });

  setAuthCookies(res, { accessToken, refreshToken, csrfToken });

  return res.json({
    message: 'Login realizado com sucesso',
    user: toPublicUser(user),
  });
}

// GET /auth/me
export async function me(req: Request, res: Response) {
  requireUser(req);

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user) {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Sessão inválida' });
  }

  return res.json({ user: toPublicUser(user) });
}

// POST /auth/refresh
export async function refreshSession(req: Request, res: Response) {
  const refreshToken = getRefreshTokenFromRequest(req);
  if (!refreshToken) {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Sessão inválida' });
  }

  const now = new Date();
  const session = await prisma.refreshTokenSession.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, isActive: true },
      },
    },
  });

  if (!session) {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Sessão inválida' });
  }

  if (session.revokedAt) {
    await revokeRefreshFamily(session.family, 'reuse-detected', now);
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Sessão inválida' });
  }

  if (session.expiresAt <= now) {
    await prisma.refreshTokenSession.update({
      where: { id: session.id },
      data: { revokedAt: now, revokedReason: 'expired' },
    });
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Sessão expirada' });
  }

  if (!session.user.isActive) {
    await revokeRefreshFamily(session.family, 'user-inactive', now);
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Sessão inválida' });
  }

  const nextRefreshToken = createOpaqueToken();
  const nextRefreshTokenHash = hashToken(nextRefreshToken);
  const accessToken = signAccessToken(session.user.id, session.user.role);
  const csrfToken = createCsrfToken();
  const metadata = getClientMetadata(req);

  await prisma.$transaction([
    prisma.refreshTokenSession.update({
      where: { id: session.id },
      data: {
        revokedAt: now,
        revokedReason: 'rotated',
        replacedByTokenHash: nextRefreshTokenHash,
      },
    }),
    prisma.refreshTokenSession.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        family: session.family,
        tokenHash: nextRefreshTokenHash,
        expiresAt: addDays(now, env.refreshTokenDays),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
      },
    }),
  ]);

  setAuthCookies(res, { accessToken, refreshToken: nextRefreshToken, csrfToken });

  return res.json({ user: toPublicUser(session.user) });
}

// POST /auth/logout
export async function logout(req: Request, res: Response) {
  const refreshToken = getRefreshTokenFromRequest(req);
  const now = new Date();

  if (refreshToken) {
    await prisma.refreshTokenSession.updateMany({
      where: { tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: now, revokedReason: 'logout' },
    });
  }

  clearAuthCookies(res);
  return res.status(204).send();
}

// GET /auth/activate/:token
export async function activate(req: Request, res: Response) {
  const token = String(req.params.token || '');

  const user = await prisma.user.findUnique({ where: { activationToken: token } });
  if (!user) return res.status(400).json({ message: 'Token inválido ou expirado' });

  if (!user.activationTokenExpiresAt || user.activationTokenExpiresAt <= new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { activationToken: null, activationTokenExpiresAt: null },
    });
    return res.status(400).json({ message: 'Token inválido ou expirado' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: true, activationToken: null, activationTokenExpiresAt: null },
  });

  return res.json({ message: 'Conta ativada com sucesso. Você já pode fazer login.' });
}
