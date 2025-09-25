'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';
import { isAuthenticated, clearToken } from '@/lib/auth';

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
};

type Cart = {
  id: string;
  items: CartItem[];
};

export default function CartPage() {
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const res = await api.get('/cart');
      setCart(res.data as Cart);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as { message?: string } | undefined)?.message;
        setError(msg ?? e.message ?? 'Erro ao carregar carrinho');
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Erro ao carregar carrinho');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready) void load();
  }, [ready]);

  const total = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  }, [cart]);

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  async function updateQty(item: CartItem, nextQty: number) {
    if (nextQty < 1) return; // seu backend exige min 1
    if (nextQty > item.product.stock) {
      alert('Quantidade acima do estoque disponível.');
      return;
    }
    try {
      setSavingId(item.id);
      await api.patch(`/cart/items/${item.id}`, { quantity: nextQty });
      await load();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as { message?: string } | undefined)?.message;
        alert(msg ?? e.message ?? 'Erro ao atualizar item');
      } else if (e instanceof Error) {
        alert(e.message);
      } else {
        alert('Erro ao atualizar item');
      }
    } finally {
      setSavingId(null);
    }
  }

  async function clearCart() {
    try {
      if (!confirm('Deseja limpar o carrinho?')) return;
      await api.delete('/cart');
      await load();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as { message?: string } | undefined)?.message;
        alert(msg ?? e.message ?? 'Erro ao limpar carrinho');
      } else if (e instanceof Error) {
        alert(e.message);
      } else {
        alert('Erro ao limpar carrinho');
      }
    }
  }

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-semibold">Meu carrinho</h1>
        <div className="flex items-center gap-2">
          <a className="text-sm underline" href="/products">Voltar aos produtos</a>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-800 text-white px-3 py-1 rounded"
          >
            Sair
          </button>
        </div>
      </header>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {loading && <p className="text-sm text-gray-600">Carregando…</p>}

      {!loading && cart && cart.items.length === 0 && (
        <p className="text-sm text-gray-600">Seu carrinho está vazio.</p>
      )}

      <ul className="grid gap-3">
        {cart?.items.map((it) => (
          <li key={it.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{it.product.name}</div>
              <div className="text-sm text-gray-600">
                Preço: R$ {it.product.price.toFixed(2)} ·
                {' '}Estoque: {it.product.stock}
              </div>
              <div className="text-sm mt-1">
                Subtotal: R$ {(it.product.price * it.quantity).toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(it, it.quantity - 1)}
                disabled={savingId === it.id || it.quantity <= 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
                title="Diminuir"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={it.product.stock}
                value={it.quantity}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) updateQty(it, next);
                }}
                className="w-16 text-center border rounded p-1"
                disabled={savingId === it.id}
              />
              <button
                onClick={() => updateQty(it, it.quantity + 1)}
                disabled={savingId === it.id || it.quantity >= it.product.stock}
                className="px-2 py-1 border rounded disabled:opacity-50"
                title="Aumentar"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      {cart && cart.items.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-lg font-semibold">
            Total: R$ {total.toFixed(2)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearCart}
              className="border px-4 py-2 rounded"
            >
              Limpar carrinho
            </button>
            <button
              onClick={() => alert('Fluxo de checkout (futuro)')}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Finalizar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
