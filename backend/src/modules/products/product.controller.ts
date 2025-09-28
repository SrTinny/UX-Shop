import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/prisma'
import { Prisma } from '@prisma/client'

/* ========= helpers ========= */
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function isPrismaKnownError(e: unknown): e is Prisma.PrismaClientKnownRequestError {
  return e instanceof Prisma.PrismaClientKnownRequestError
}

/* ========= Schemas ========= */
// use z.coerce para aceitar strings vindas do front
const createProductSchema = z.object({
  name: z.string().min(1, 'nome obrigatório'),
  description: z.string().optional(),
  price: z.coerce.number().finite('preço inválido'),
  stock: z.coerce.number().int().nonnegative().default(0),
  imageUrl: z.string().url('URL inválida').optional()
})

// Update sem defaults, só aplica o que vier
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.coerce.number().finite().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  imageUrl: z.string().url('URL inválida').nullable().optional()
})

/* ========= Handlers ========= */

export async function listProducts(req: Request, res: Response) {
  const pageRaw = Number(req.query.page ?? 1)
  const perPageRaw = Number(req.query.perPage ?? 10)
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1
  const perPage = Math.min(Number.isFinite(perPageRaw) && perPageRaw > 0 ? perPageRaw : 10, 50)
  const search = String(req.query.search ?? '').trim()

  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : {}

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' }
      // sem select => já devolve imageUrl/slug se existirem no schema
    }),
    prisma.product.count({ where })
  ])

  res.json({ page, perPage, total, items })
}

export async function getProduct(req: Request, res: Response) {
  const { id } = req.params

  const product = await prisma.product.findUnique({
    where: { id: String(id) }
  })

  if (!product) return res.status(404).json({ message: 'Produto não encontrado' })
  res.json(product)
}

export async function createProduct(req: Request, res: Response) {
  const parsed = createProductSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() })
  }

  const data = parsed.data

  try {
    const created = await prisma.product.create({
      data: {
        name: data.name,
        slug: slugify(data.name), // se tiver coluna slug
        price: data.price,
        stock: data.stock ?? 0,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null
      }
    })
    res.status(201).json(created)
  } catch (e: unknown) {
    if (isPrismaKnownError(e) && e.code === 'P2002') {
      return res.status(409).json({ message: 'Produto já existe (slug/nome duplicado)' })
    }
    throw e
  }
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params

  const current = await prisma.product.findUnique({ where: { id: String(id) } })
  if (!current) return res.status(404).json({ message: 'Produto não encontrado' })

  const parsed = updateProductSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() })
  }
  const patch = parsed.data

  // aplica somente campos presentes
  const data: {
    name?: string
    price?: number
    stock?: number
    description?: string | null
    imageUrl?: string | null
    slug?: string
  } = {}

  if (patch.name !== undefined) {
    data.name = patch.name
    // se quiser atualizar o slug quando o nome mudar:
    data.slug = slugify(patch.name)
  }
  if (patch.price !== undefined) data.price = patch.price
  if (patch.stock !== undefined) data.stock = patch.stock
  if (patch.description !== undefined) data.description = patch.description ?? null
  if (patch.imageUrl !== undefined) data.imageUrl = patch.imageUrl ?? null

  try {
    const updated = await prisma.product.update({
      where: { id: String(id) },
      data
    })
    res.json(updated)
  } catch (e: unknown) {
    if (isPrismaKnownError(e) && e.code === 'P2002') {
      return res.status(409).json({ message: 'Conflito de dados (slug/nome duplicado)' })
    }
    throw e
  }
}

export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params

  const current = await prisma.product.findUnique({ where: { id: String(id) } })
  if (!current) return res.status(404).json({ message: 'Produto não encontrado' })

  await prisma.product.delete({ where: { id: String(id) } })
  res.status(204).send()
}
