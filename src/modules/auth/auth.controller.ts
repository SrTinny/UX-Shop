import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { registerSchema, loginSchema } from './auth.schemas';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// gera um JWT com subject = userId
function signToken(userId: string, role: 'USER' | 'ADMIN') {
  return jwt.sign({ role }, JWT_SECRET, { subject: userId, expiresIn: '1d' });
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

  const passwordHash = await bcrypt.hash(password, 10);
  const activationToken = randomUUID();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: 'USER',
      isActive: false,
      activationToken,
    },
    select: { id: true, name: true, email: true, role: true, isActive: true, activationToken: true },
  });

  // “envio de e-mail” simulado
  const activationUrl = `http://localhost:${process.env.PORT || 3000}/auth/activate/${user.activationToken}`;
  console.log('📧 Ativação simulada:', activationUrl);

  return res.status(201).json({
    message: 'Usuário registrado. Verifique o link de ativação no console.',
    user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
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

  const token = signToken(user.id, user.role);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

// GET /auth/activate/:token
export async function activate(req: Request, res: Response) {
  const token = String(req.params.token || '');

  const user = await prisma.user.findUnique({ where: { activationToken: token } });
  if (!user) return res.status(400).json({ message: 'Token inválido ou expirado' });

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: true, activationToken: null },
  });

  return res.json({ message: 'Conta ativada com sucesso. Você já pode fazer login.' });
}
