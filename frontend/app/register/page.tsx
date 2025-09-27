"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { api } from "@/lib/api";
import { toast } from "sonner";

/* ===================== Helpers (CPF) ===================== */
const onlyDigits = (v: string) => (v || "").replace(/\D/g, "");

function isValidCPF(raw: string) {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i], 10) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(cpf[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i], 10) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;

  return d2 === parseInt(cpf[10], 10);
}

/* ===================== Schema (Zod) ===================== */
const schema = z
  .object({
    name: z.string().min(2, "Informe seu nome"),
    email: z.string().email("E-mail inválido"),
    cpf: z.string().min(11, "CPF inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirm: z.string().min(6, "Confirme a senha"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Senhas não conferem",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

/* Mock de CPF duplicado em localStorage */
function isCpfDuplicatedMock(cpfMasked: string) {
  const key = "cpfs_mock";
  const list: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
  const digits = onlyDigits(cpfMasked);
  return list.includes(digits);
}
function addCpfMock(cpfMasked: string) {
  const key = "cpfs_mock";
  const list: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
  const digits = onlyDigits(cpfMasked);
  if (!list.includes(digits)) {
    localStorage.setItem(key, JSON.stringify([...list, digits]));
  }
}

/* ===================== Página ===================== */
export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      phone: "",
      password: "",
      confirm: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);

    if (!isValidCPF(data.cpf)) {
      const msg = "CPF inválido";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (isCpfDuplicatedMock(data.cpf)) {
      const msg = "CPF já cadastrado (simulado)";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      addCpfMock(data.cpf);

      toast.success("Cadastro criado! Verifique o link de ativação no console do backend.");
      window.location.href = "/login";
    } catch (e: unknown) {
      let msg = "Erro ao registrar";
      if (axios.isAxiosError(e)) {
        msg = e.response?.data?.message ?? e.message ?? msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-brand">Cadastro</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Crie sua conta para continuar.
          </p>
        </header>

        {error && (
          <p
            className="text-red-600 text-sm text-center"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label htmlFor="name" className="block text-sm mb-1">
              Nome
            </label>
            <input
              id="name"
              className="input-base"
              {...register("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-err" : undefined}
            />
            {errors.name && (
              <p id="name-err" className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="input-base"
              {...register("email")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-err" : undefined}
            />
            {errors.email && (
              <p id="email-err" className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm mb-1">
              CPF
            </label>
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => (
                <IMaskInput
                  id="cpf"
                  mask="000.000.000-00"
                  value={field.value}
                  onAccept={(val) => field.onChange(val)}
                  inputRef={field.ref}
                  onBlur={field.onBlur}
                  className="input-base"
                  placeholder="000.000.000-00"
                  aria-invalid={!!errors.cpf}
                  aria-describedby={errors.cpf ? "cpf-err" : undefined}
                />
              )}
            />
            {errors.cpf && (
              <p id="cpf-err" className="text-sm text-red-600">{errors.cpf.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm mb-1">
              Telefone
            </label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <IMaskInput
                  id="phone"
                  mask="(00) 0 0000-0000"
                  value={field.value}
                  onAccept={(val) => field.onChange(val)}
                  inputRef={field.ref}
                  onBlur={field.onBlur}
                  className="input-base"
                  placeholder="(00) 0 0000-0000"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-err" : undefined}
                />
              )}
            />
            {errors.phone && (
              <p id="phone-err" className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1">
              Senha
            </label>
            <input
              id="password"
              className="input-base"
              type="password"
              {...register("password")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-err" : undefined}
              autoComplete="new-password"
            />
            {errors.password && (
              <p id="password-err" className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm mb-1">
              Confirmar senha
            </label>
            <input
              id="confirm"
              className="input-base"
              type="password"
              {...register("confirm")}
              aria-invalid={!!errors.confirm}
              aria-describedby={errors.confirm ? "confirm-err" : undefined}
              autoComplete="new-password"
            />
            {errors.confirm && (
              <p id="confirm-err" className="text-sm text-red-600">{errors.confirm.message}</p>
            )}
          </div>

          <button
            disabled={isSubmitting}
            className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Cadastrar"}
          </button>
        </form>

        <p className="text-sm text-center text-slate-600 dark:text-slate-300">
          Já tem conta?{" "}
          <a className="underline text-accent hover:text-brand" href="/login">
            Entrar
          </a>
        </p>
      </div>
    </main>
  );
}
