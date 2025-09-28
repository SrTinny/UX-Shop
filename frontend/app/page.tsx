import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6 py-12 text-center
                 bg-gradient-to-b from-brand/5 to-accent/10 dark:from-brand/10 dark:to-accent/5"
    >
      {/* Logo decorativo no fundo (opcional) */}
      <Image
        src="/next.svg"
        alt=""
        width={280}
        height={60}
        priority
        aria-hidden
        className="pointer-events-none select-none absolute top-24 left-1/2 -translate-x-1/2
                   opacity-20 blur-[1px] dark:invert"
      />

      <main className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-8">
        {/* Logo da marca (pode trocar para o seu) */}
        <Image
          src="/next.svg"
          alt="Logo UX Software"
          width={180}
          height={38}
          priority
          className="mx-auto dark:invert"
        />

        <header className="space-y-3">
          <h1
            className="text-3xl md:text-5xl font-extrabold tracking-tight
                       bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent"
          >
            Bem-vindo à UX Software
          </h1>
          <p className="mx-auto max-w-2xl text-base md:text-lg leading-relaxed
                        text-slate-700 dark:text-slate-300">
            Plataforma moderna para gerenciar produtos, carrinho e autenticação —{" "}
            elegante, rápida e simples.
          </p>
        </header>

        <section aria-label="Tecnologias" className="card w-full max-w-xl p-4 md:p-5">
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300">
            Construída com <strong>Next.js</strong>, <strong>Express</strong> e{" "}
            <strong>Prisma</strong>.
          </p>
        </section>

        <div className="flex w-full max-w-xl flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/products"
            className="btn btn-primary w-full sm:w-auto px-6 py-3"
            aria-label="Ver produtos"
          >
            Ver produtos
          </Link>

          <Link
            href="/login"
            className="btn w-full sm:w-auto px-6 py-3 border border-black/10 dark:border-white/10
                       hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Fazer login"
          >
            Fazer login
          </Link>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Explore o menu acima para começar 🚀
        </p>
      </main>
    </div>
  );
}
