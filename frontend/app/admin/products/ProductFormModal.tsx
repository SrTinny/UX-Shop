"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string | null;
  tag?: string | null;
  category?: { id: string; name: string } | null;
};

const productSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative("Preço inválido"),
  stock: z.coerce.number().int("Estoque deve ser inteiro").nonnegative("Estoque inválido"),
  imageUrl: z.string().url("URL inválida").optional(),
  tag: z.enum(["PROMOCAO", "NOVO"]).optional(),
  categoryName: z.string().optional().nullable(),
});
type ProductFormData = z.infer<typeof productSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  editingProduct: Product | null;
};

export default function ProductFormModal({ open, onClose, onSaveSuccess, editingProduct }: Props) {
  const [saving, setSaving] = useState(false);
  

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormData>,
    defaultValues: { name: "", description: "", price: 0, stock: 0, imageUrl: "" },
  });

  useEffect(() => {
    if (editingProduct) {
      reset({
        name: editingProduct.name,
        description: editingProduct.description ?? "",
        price: editingProduct.price,
        stock: editingProduct.stock,
        imageUrl: editingProduct.imageUrl ?? "",
  tag: editingProduct.tag === 'Promoção' ? 'PROMOCAO' : editingProduct.tag === 'Novo' ? 'NOVO' : undefined,
  categoryName: editingProduct.category?.name ?? null,
      });
    } else {
      reset({ name: "", description: "", price: 0, stock: 0, imageUrl: "", categoryName: "" });
    }
  }, [editingProduct, reset]);

  // no categories fetch needed for free-text category input

  async function onSubmit(data: ProductFormData) {
    try {
      setSaving(true);
      if (editingProduct) {
        // send categoryName field expected by the backend
        await api.put(`/products/${editingProduct.id}`, data);
        toast.success("Produto atualizado");
      } else {
        await api.post("/products", data);
        toast.success("Produto criado");
      }
      onSaveSuccess();
    } catch (e: unknown) {
      let msg = editingProduct ? "Erro ao atualizar" : "Erro ao criar";
      if (axios.isAxiosError(e)) {
        msg = (e.response?.data as { message?: string } | undefined)?.message ?? e.message ?? msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl">
        <div className="card p-5">
          <h2 className="mb-4 text-lg font-semibold">{editingProduct ? "Editar produto" : "Novo produto"}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm" htmlFor="name">Nome</label>
              <input id="name" className="input-base" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm" htmlFor="price">Preço</label>
              <input id="price" className="input-base" type="number" step="0.01" {...register("price")} />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm" htmlFor="stock">Estoque</label>
              <input id="stock" className="input-base" type="number" {...register("stock")} />
              {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm" htmlFor="description">Descrição</label>
              <textarea id="description" className="input-base" rows={3} {...register("description")} />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm" htmlFor="imageUrl">Link da imagem</label>
              <input id="imageUrl" className="input-base" type="url" placeholder="https://exemplo.com/imagem.jpg" {...register("imageUrl")} />
              {errors.imageUrl && <p className="mt-1 text-xs text-red-600">{errors.imageUrl.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm" htmlFor="tag">Tag</label>
              <select id="tag" className="input-base" {...register('tag')}>
                <option value="">Nenhuma</option>
                <option value="PROMOCAO">Promoção</option>
                <option value="NOVO">Novo</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm" htmlFor="categoryName">Categoria</label>
              <input id="categoryName" className="input-base" {...register('categoryName')} placeholder="ex: roupas, eletronicos" />
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
              <button disabled={isSubmitting || saving} className="btn btn-primary" aria-disabled={isSubmitting || saving}>
                {isSubmitting || saving ? (editingProduct ? "Salvando…" : "Criando…") : editingProduct ? "Salvar alterações" : "Criar"}
              </button>

              <button type="button" className="btn border border-black/10 dark:border-white/10" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
