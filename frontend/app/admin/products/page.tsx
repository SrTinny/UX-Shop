"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import axios from "axios";
import { isAuthenticated, isAdmin, clearToken } from "@/lib/auth";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
};

const productSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),

  price: z
    .number()
    .refine((v) => !Number.isNaN(v), { message: 'Informe um número' })
    .nonnegative('Preço inválido'),

  stock: z
    .number()
    .refine((v) => !Number.isNaN(v), { message: 'Informe um número' })
    .int('Estoque deve ser inteiro')
    .nonnegative('Estoque inválido'),
});


type ProductFormData = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Guard (auth + role)
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    if (!isAdmin()) {
      toast.error("Acesso restrito a administradores.");
      window.location.href = "/products";
      return;
    }
    setReady(true);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0, stock: 0 },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/products", {
        params: { page: 1, perPage: 50, search: search || undefined },
      });
      setItems((res.data?.items ?? []) as Product[]);
    } catch (e: unknown) {
      let msg = "Erro ao carregar produtos";
      if (axios.isAxiosError(e)) {
        msg =
          (e.response?.data as { message?: string } | undefined)?.message ??
          e.message ??
          msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  const isEditMode = useMemo(() => !!editing, [editing]);

  function startCreate() {
    setEditing(null);
    reset({ name: "", description: "", price: 0, stock: 0 });
    // rola a página até o form
    document
      .getElementById("product-form")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function startEdit(p: Product) {
    setEditing(p);
    reset({
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      stock: p.stock,
    });
    document
      .getElementById("product-form")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  async function onSubmit(data: ProductFormData) {
    try {
      setSaving(true);
      if (isEditMode && editing) {
        await api.put(`/products/${editing.id}`, data);
        toast.success("Produto atualizado");
      } else {
        await api.post("/products", data);
        toast.success("Produto criado");
      }
      setEditing(null);
      reset({ name: "", description: "", price: 0, stock: 0 });
      await load();
    } catch (e: unknown) {
      let msg = isEditMode ? "Erro ao atualizar" : "Erro ao criar";
      if (axios.isAxiosError(e)) {
        msg =
          (e.response?.data as { message?: string } | undefined)?.message ??
          e.message ??
          msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remover produto?")) return;
    try {
      setRemovingId(id);
      await api.delete(`/products/${id}`);
      toast.success("Produto removido");
      await load();
    } catch (e: unknown) {
      let msg = "Erro ao remover";
      if (axios.isAxiosError(e)) {
        msg =
          (e.response?.data as { message?: string } | undefined)?.message ??
          e.message ??
          msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      toast.error(msg);
    } finally {
      setRemovingId(null);
    }
  }

  const handleLogout = () => {
    clearToken();
    window.location.href = "/login";
  };

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-semibold">Admin • Produtos</h1>
        <div className="flex items-center gap-3">
          <a className="text-sm underline" href="/products">
            Loja
          </a>
          <button
            className="text-sm bg-gray-800 text-white px-3 py-1 rounded"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Busca */}
      <div className="flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="Buscar por nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={load}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
        <button onClick={startCreate} className="border px-4 py-2 rounded">
          Novo produto
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Preço</th>
              <th className="text-left p-3">Estoque</th>
              <th className="text-left p-3">Descrição</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr>
                <td className="p-3 text-gray-600" colSpan={5}>
                  Nenhum produto.
                </td>
              </tr>
            )}
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-3">
                    <div className="h-4 w-48 bg-gray-200 rounded" />
                  </td>
                  <td className="p-3">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="p-3">
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </td>
                  <td className="p-3">
                    <div className="h-4 w-64 bg-gray-200 rounded" />
                  </td>
                  <td className="p-3 text-right">
                    <div className="h-8 w-28 bg-gray-200 rounded ml-auto" />
                  </td>
                </tr>
              ))}
            {!loading &&
              items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">R$ {p.price.toFixed(2)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 text-gray-600">{p.description ?? "—"}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      className="px-3 py-1 border rounded"
                      onClick={() => startEdit(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-3 py-1 border rounded text-red-600 border-red-600 disabled:opacity-50"
                      disabled={removingId === p.id}
                      onClick={() => remove(p.id)}
                    >
                      {removingId === p.id ? "Removendo…" : "Remover"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Form de Create/Update */}
      <section id="product-form" className="border rounded p-4 space-y-3">
        <h2 className="text-lg font-semibold">
          {isEditMode ? "Editar produto" : "Novo produto"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Nome</label>
            <input
              className="w-full border rounded p-2"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Preço</label>
            <input
              className="w-full border rounded p-2"
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Estoque</label>
            <input
              className="w-full border rounded p-2"
              type="number"
              {...register("stock", { valueAsNumber: true })}
            />
            {errors.stock && (
              <p className="text-sm text-red-600">{errors.stock.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Descrição</label>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <button
              disabled={isSubmitting || saving}
              className="bg-black text-white px-4 py-2 rounded"
            >
              {isSubmitting || saving
                ? isEditMode
                  ? "Salvando…"
                  : "Criando…"
                : isEditMode
                ? "Salvar alterações"
                : "Criar"}
            </button>

            {isEditMode && (
              <button
                type="button"
                className="border px-4 py-2 rounded"
                onClick={() => {
                  setEditing(null);
                  reset({ name: "", description: "", price: 0, stock: 0 });
                }}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
