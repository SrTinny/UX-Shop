"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import axios from "axios";
import { isAuthenticated, isAdmin } from "@/lib/auth";
import { toast } from "sonner";
import { EditIcon, TrashIcon } from '@/app/components/Icons';
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
  imageUrl?: string | null;
};

/** Validação: z.coerce.number transforma string -> number automaticamente */
const productSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative("Preço inválido"),
  stock: z.coerce.number().int("Estoque deve ser inteiro").nonnegative("Estoque inválido"),
  imageUrl: z.string().url("URL inválida").optional(),
});
type ProductFormData = z.infer<typeof productSchema>;

/* ===== Helpers ===== */
const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);
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
    defaultValues: { name: "", description: "", price: 0, stock: 0, imageUrl: "" },
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
        msg = (e.response?.data as { message?: string } | undefined)?.message ?? e.message ?? msg;
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
      imageUrl: p.imageUrl ?? "",
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
        msg = (e.response?.data as { message?: string } | undefined)?.message ?? e.message ?? msg;
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
        msg = (e.response?.data as { message?: string } | undefined)?.message ?? e.message ?? msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      toast.error(msg);
    } finally {
      setRemovingId(null);
    }
  }

  // logout gerenciado pelo HeaderBar global

  if (!ready) return null;

  return (
    <main className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header (apenas título/descritivo); ações globais no HeaderBar */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-brand">Admin • Produtos</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Gerencie catálogo, preços e estoque.
          </p>
        </div>
      </header>

      {/* Toolbar de busca */}
      <section className="card p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
          <div className="flex gap-2">
            <button onClick={load} className="btn btn-primary whitespace-nowrap">
              {loading ? "Buscando…" : "Buscar"}
            </button>
            <button
              onClick={startCreate}
              className="btn border border-black/10 dark:border-white/10 whitespace-nowrap"
            >
              Novo produto
            </button>
          </div>
        </div>
        <div className="mt-2 min-h-5 text-sm text-red-600" role="status" aria-live="polite">
          {errorMsg ?? ""}
        </div>
      </section>

      {/* Lista mobile (cards) */}
      {!loading && items.length > 0 && (
        <section className="grid gap-3 md:hidden">
          {items.map((p) => (
            <article
              key={p.id}
              className="card p-4 space-y-2"
              aria-label={`Produto ${p.name}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-tight">{p.name}</h3>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {formatDate(p.updatedAt ?? p.createdAt)}
                </span>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                {p.description ?? "—"}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-brand font-semibold">{formatBRL(p.price)}</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">Estoque: {p.stock}</span>
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  className="btn border border-black/10 dark:border-white/10"
                  onClick={() => startEdit(p)}
                >
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
            </article>
          ))}
        </section>
      )}

      {/* Lista desktop (tabela) */}
      <section className="card overflow-hidden hidden md:block">
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
              <tr className="[&>th]:p-3 [&>th]:text-left [&>th]:font-semibold text-slate-700 dark:text-slate-200">
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
                    <td className="p-3">
                      <div className="h-4 w-48 rounded bg-black/10 dark:bg-white/10" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 w-20 rounded bg-black/10 dark:bg-white/10" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 w-14 rounded bg-black/10 dark:bg-white/10" />
                    </td>
                    <td className="hidden p-3 lg:table-cell">
                      <div className="h-4 w-40 rounded bg-black/10 dark:bg-white/10" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 w-64 rounded bg-black/10 dark:bg-white/10" />
                    </td>
                    <td className="p-3">
                      <div className="ml-auto h-8 w-28 rounded bg-black/10 dark:bg-white/10" />
                    </td>
                  </tr>
                ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-slate-600 dark:text-slate-300" colSpan={6}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{formatBRL(p.price)}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="hidden p-3 text-slate-600 dark:text-slate-300 lg:table-cell">
                      {formatDate(p.updatedAt ?? p.createdAt)}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{p.description ?? "—"}</td>
                    <td className="p-3">
                              <div className="flex justify-end gap-2">
                              <button
                                className="inline-flex items-center gap-2 px-2 py-1 border border-black/10 rounded"
                                onClick={() => startEdit(p)}
                              >
                                <EditIcon />
                                <span className="sr-only">Editar</span>
                              </button>
                              <button
                                className="inline-flex items-center gap-2 px-2 py-1 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white disabled:opacity-50"
                                disabled={removingId === p.id}
                                onClick={() => remove(p.id)}
                              >
                                {removingId === p.id ? 'Removendo…' : <><TrashIcon /><span className="sr-only">Remover</span></>}
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
        <h2 className="mb-4 text-lg font-semibold">
          {isEditMode ? "Editar produto" : "Novo produto"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm" htmlFor="name">
              Nome
            </label>
            <input id="name" className="input-base" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm" htmlFor="price">
              Preço
            </label>
            <input id="price" className="input-base" type="number" step="0.01" {...register("price")} />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm" htmlFor="stock">
              Estoque
            </label>
            <input id="stock" className="input-base" type="number" {...register("stock")} />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm" htmlFor="description">
              Descrição
            </label>
            <textarea id="description" className="input-base" rows={3} {...register("description")} />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm" htmlFor="imageUrl">
              Link da imagem
            </label>
            <input
              id="imageUrl"
              className="input-base"
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              {...register("imageUrl")}
            />
            {errors.imageUrl && <p className="mt-1 text-xs text-red-600">{errors.imageUrl.message}</p>}
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
            <button
              disabled={isSubmitting || saving}
              className="btn btn-primary"
              aria-disabled={isSubmitting || saving}
            >
              {isSubmitting || saving ? (isEditMode ? "Salvando…" : "Criando…") : isEditMode ? "Salvar alterações" : "Criar"}
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
