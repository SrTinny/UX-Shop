import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';

/* ========= Schemas ========= */
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().finite(),
  stock: z.number().int().nonnegative().default(0),
});

// ⚠️ Update SEM defaults para não injetar valores quando a chave não vem
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().finite().optional(),
  stock: z.number().int().nonnegative().optional(),
});

/* ========= Handlers ========= */

export async function listProducts(req: Request, res: Response) {
  const pageRaw = Number(req.query.page ?? 1);
  const perPageRaw = Number(req.query.perPage ?? 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const perPage = Math.min(Number.isFinite(perPageRaw) && perPageRaw > 0 ? perPageRaw : 10, 50);
  const search = String(req.query.search ?? '').trim();

  const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ page, perPage, total, items });
}

export async function getProduct(req: Request, res: Response) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: String(id) },
  });

  if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
  res.json(product);
}

export async function createProduct(req: Request, res: Response) {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
  }

  const data = parsed.data;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock ?? 0,
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
  });

  res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;

  const current = await prisma.product.findUnique({ where: { id: String(id) } });
  if (!current) return res.status(404).json({ message: 'Produto não encontrado' });

  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
  }

  const patch = parsed.data;

  // Envia apenas campos presentes (evita undefined tocar em campos obrigatórios)
  const data: {
    name?: string;
    price?: number;
    stock?: number;
    description?: string | null;
  } = {};

  if (patch.name !== undefined) data.name = patch.name;
  if (patch.price !== undefined) data.price = patch.price;
  if (patch.stock !== undefined) data.stock = patch.stock;
  if (patch.description !== undefined) data.description = patch.description;

  const updated = await prisma.product.update({
    where: { id: String(id) },
    data,
  });

  res.json(updated);
}

export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;

  const current = await prisma.product.findUnique({ where: { id: String(id) } });
  if (!current) return res.status(404).json({ message: 'Produto não encontrado' });

  await prisma.product.delete({ where: { id: String(id) } });
  res.status(204).send();
}
