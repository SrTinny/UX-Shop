"use client";

import { clearToken } from "@/lib/auth";

export default function Header() {
  const handleLogout = () => {
    clearToken();
    window.location.href = "/login";
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <a href="/products" className="font-semibold">UX Shop</a>
      <button
        onClick={handleLogout}
        className="text-sm bg-gray-800 text-white px-3 py-1 rounded"
      >
        Sair
      </button>
    </header>
  );
}
