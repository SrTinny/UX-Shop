"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import axios from "axios";
import { isAuthenticated, isAdmin, clearToken } from "@/lib/auth";
import { toast } from "sonner";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
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

/** Validação: z.coerce.number transforma string -> number automaticamente */
const productSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative("Preço inválido"),
  stock: z.coerce.number().int("Estoque deve ser inteiro").nonnegative("Estoque inválido"),
});
type ProductFormData = z.infer<typeof productSchema>;

/* ===== Helpers ===== */
const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
};

export default function AdminProductsPage() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormData>,
    defaultValues: { name: "", description: "", price: 0, stock: 0 },
  });

  // Debounce da busca
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [search]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get("/products", {
        params: { page: 1, perPage: 50, search: debouncedSearch || undefined },
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
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  const isEditMode = useMemo(() => !!editing, [editing]);

  function startCreate() {
    setEditing(null);
    reset({ name: "", description: "", price: 0, stock: 0 });
    document.getElementById("product-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startEdit(p: Product) {
    setEditing(p);
    reset({
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      stock: p.stock,
    });
    document.getElementById("product-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
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
  };

  async function remove(id: string) {
    if (!confirm("Remover produto?")) return;
    try {
      setRemovingId(id);
      await api.delete(`/products/${id}`);
      toast.success("Produto removido");
      // otimista: remove local antes do reload para resposta visual rápida
      setItems((prev) => prev.filter((p) => p.id !== id));
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
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand">Admin • Produtos</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Gerencie catálogo, preços e estoque.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a className="btn border border-black/10 dark:border-white/10" href="/products">
            Loja
          </a>
          <button onClick={handleLogout} className="btn btn-accent">
            Sair
          </button>
        </div>
      </header>

      {/* Toolbar de busca */}
      <section className="card p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label htmlFor="search" className="sr-only">
            Buscar por nome
          </label>
          <input
            id="search"
            className="input-base flex-1"
            placeholder="Buscar por nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar produtos por nome"
          />
          <button onClick={load} className="btn btn-primary whitespace-nowrap">
            {loading ? "Buscando…" : "Buscar"}
          </button>
          <button onClick={startCreate} className="btn border border-black/10 dark:border-white/10">
            Novo produto
          </button>
        </div>
        <div
          className="mt-2 text-sm text-red-600 min-h-5"
          role="status"
          aria-live="polite"
        >
          {errorMsg ?? ""}
        </div>
      </section>

      {/* Lista/Tabela */}
      <section className="card overflow-hidden">
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
              <tr className="[&>th]:text-left [&>th]:p-3 [&>th]:font-semibold text-slate-700 dark:text-slate-200">
                <th>Nome</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th className="hidden lg:table-cell">Atualizado</th>
                <th>Descrição</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-t [&>tr]:border-black/5 dark:[&>tr]:border-white/10">
              {/* estados */}
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3"><div className="h-4 w-48 bg-black/10 dark:bg-white/10 rounded" /></td>
                    <td className="p-3"><div className="h-4 w-20 bg-black/10 dark:bg-white/10 rounded" /></td>
                    <td className="p-3"><div className="h-4 w-14 bg-black/10 dark:bg-white/10 rounded" /></td>
                    <td className="p-3 hidden lg:table-cell"><div className="h-4 w-40 bg-black/10 dark:bg-white/10 rounded" /></td>
                    <td className="p-3"><div className="h-4 w-64 bg-black/10 dark:bg-white/10 rounded" /></td>
                    <td className="p-3"><div className="h-8 w-28 bg-black/10 dark:bg-white/10 rounded ml-auto" /></td>
                  </tr>
                ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td className="p-6 text-slate-600 dark:text-slate-300 text-center" colSpan={6}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((p) => (
                  <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{formatBRL(p.price)}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3 hidden lg:table-cell text-slate-600 dark:text-slate-300">
                      {formatDate(p.updatedAt ?? p.createdAt)}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {p.description ?? "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button className="btn border border-black/10 dark:border-white/10" onClick={() => startEdit(p)}>
                          Editar
                        </button>
                        <button
                          className="btn border border-red-600 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                          disabled={removingId === p.id}
                          onClick={() => remove(p.id)}
                        >
                          {removingId === p.id ? "Removendo…" : "Remover"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Form de Create/Update */}
      <section id="product-form" className="card p-5">
        <h2 className="text-lg font-semibold mb-4">
          {isEditMode ? "Editar produto" : "Novo produto"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1" htmlFor="name">Nome</label>
            <input id="name" className="input-base" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="price">Preço</label>
            <input id="price" className="input-base" type="number" step="0.01" {...register("price")} />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="stock">Estoque</label>
            <input id="stock" className="input-base" type="number" {...register("stock")} />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm mb-1" htmlFor="description">Descrição</label>
            <textarea id="description" className="input-base" rows={3} {...register("description")} />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <button
              disabled={isSubmitting || saving}
              className="btn btn-primary"
              aria-disabled={isSubmitting || saving}
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
                className="btn border border-black/10 dark:border-white/10"
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
