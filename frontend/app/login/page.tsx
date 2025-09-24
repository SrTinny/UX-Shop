// frontend/app/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await api.post("/auth/login", data);
      const token = res.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        alert("Login OK!");
        // redirecionar para /products
        window.location.href = "/products";
      } else {
        setError("Token não recebido.");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else if (typeof e === "object" && e !== null && "response" in e) {
        // erro do axios (ou similar)
        const axiosError = e as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message ?? "Erro ao logar");
      } else {
        setError("Erro inesperado");
      }
    }
  };

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">E-mail</label>
          <input
            className="w-full border rounded p-2"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input
            className="w-full border rounded p-2"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        <button
          disabled={isSubmitting}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="text-sm">
        Não tem conta?{" "}
        <a className="underline" href="/register">
          Cadastre-se
        </a>
      </p>
    </main>
  );
}
