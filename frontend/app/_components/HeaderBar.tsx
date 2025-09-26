"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAuthenticated, isAdmin, clearToken } from "@/lib/auth";

export default function HeaderBar() {
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // roda só no client
    setAuthed(isAuthenticated());
    setAdmin(isAdmin());
    setReady(true);
  }, []);

  const onLogout = () => {
    clearToken();
    window.location.href = "/login";
  };

  if (!ready) return null;

  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="font-semibold">
          UX Software
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/products" className="underline-offset-4 hover:underline">
            Produtos
          </Link>

          {authed && (
            <Link href="/cart" className="underline-offset-4 hover:underline">
              Carrinho
            </Link>
          )}

          {authed && admin && (
            <Link
              href="/admin/products"
              className="underline-offset-4 hover:underline"
            >
              Admin
            </Link>
          )}

          {!authed ? (
            <>
              <Link
                href="/login"
                className="underline-offset-4 hover:underline"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="underline-offset-4 hover:underline"
              >
                Cadastro
              </Link>
            </>
          ) : (
            <button
              onClick={onLogout}
              className="px-3 py-1 rounded bg-gray-800 text-white"
              title="Sair"
            >
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
