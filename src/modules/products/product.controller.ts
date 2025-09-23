import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';

type ProductMem = {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
};

const mem: ProductMem[] = [];

/* ========= Schemas ========= */
const createProductSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().finite(),
    stock: z.number().int().nonnegative().default(0),
});

const updateProductSchema = createProductSchema.partial();

/* ========= Handlers ========= */

export async function listProducts(_req: Request, res: Response) {
    res.json(mem);
}

export async function getProduct(req: Request, res: Response) {
    const p = mem.find((x) => x.id === req.params.id);
    if (!p) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(p);
}

export async function createProduct(req: Request, res: Response) {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
        return res
            .status(400)
            .json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
    }

    const data = parsed.data;

    // description só entra se vier definida (compatível com exactOptionalPropertyTypes)
    const prod: ProductMem = {
        id: randomUUID(),
        name: data.name,
        price: data.price,
        stock: data.stock ?? 0,
        ...(data.description !== undefined ? { description: data.description } : {}),
    };

    mem.push(prod);
    res.status(201).json(prod);
}

export async function updateProduct(req: Request, res: Response) {
    const idx = mem.findIndex((x) => x.id === req.params.id);
    if (idx === -1) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
        return res
            .status(400)
            .json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
    }

    // TS agora sabe que `mem[idx]` existe
    const current = mem[idx] as ProductMem;
    const patch = parsed.data;

    // Garante campos obrigatórios sempre definidos
    const next: ProductMem = {
        id: current.id,
        name: patch.name ?? current.name,
        price: patch.price ?? current.price,
        stock: patch.stock ?? current.stock,
        ...(patch.description !== undefined
            ? { description: patch.description }
            : current.description !== undefined
                ? { description: current.description }
                : {}),
    };

    mem[idx] = next;
    res.json(mem[idx]);
}

export async function deleteProduct(req: Request, res: Response) {
    const idx = mem.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Produto não encontrado' });
    mem.splice(idx, 1);
    res.status(204).send();
}
