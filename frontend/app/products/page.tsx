'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';
import { isAuthenticated, clearToken } from '@/lib/auth';

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
};

export default function ProductsPage() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
    } else {
      setReady(true);
    }
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/products', {
        params: { page: 1, perPage: 20, search: search || undefined },
      });
      const data = res.data as { items?: Product[] };
      setItems(data.items ?? []);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as { message?: string } | undefined)?.message;
        setError(msg ?? e.message ?? 'Erro ao carregar produtos');
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Erro ao carregar produtos');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  async function addToCart(productId: string) {
    try {
      setAddingId(productId);
      await api.post('/cart/items', { productId, quantity: 1 });
      alert('Item adicionado ao carrinho!');
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as { message?: string } | undefined)?.message;
        alert(msg ?? e.message ?? 'Erro ao adicionar ao carrinho');
      } else if (e instanceof Error) {
        alert(e.message);
      } else {
        alert('Erro ao adicionar ao carrinho');
      }
    } finally {
      setAddingId(null);
    }
  }

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <div className="flex items-center gap-2">
          <a href="/cart" className="text-sm underline">Meu carrinho</a>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-800 text-white px-3 py-1 rounded"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="flex gap-2 pt-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="Buscar por nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={load} className="bg-black text-white px-4 py-2 rounded">
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!error && items.length === 0 && !loading && (
        <p className="text-sm text-gray-600">Nenhum produto encontrado.</p>
      )}

      <ul className="grid gap-3">
        {items.map((p) => (
          <li key={p.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              {p.description && <div className="text-sm text-gray-600">{p.description}</div>}
              <div className="text-sm mt-1">R$ {p.price.toFixed(2)} · estoque: {p.stock}</div>
            </div>
            <button
              disabled={p.stock <= 0 || addingId === p.id}
              onClick={() => addToCart(p.id)}
              className="bg-black text-white px-3 py-2 rounded disabled:opacity-50"
              title={p.stock <= 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
            >
              {addingId === p.id ? 'Adicionando…' : 'Adicionar'}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
