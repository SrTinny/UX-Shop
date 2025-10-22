"use client";

export default function AccountPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Minha Conta</h1>
        <p className="text-gray-600 mt-2">Gerencie suas informações pessoais, veja seus pedidos e ajuste preferências.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <nav className="lg:col-span-1">
          <div className="card p-4 flex flex-col items-center gap-4 text-center">
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center" style={{ borderColor: 'var(--color-border)' }}>
              <svg className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
            </div>
            <div className="text-sm font-medium">João Exemplo</div>
            <div className="text-xs text-gray-600">joao@example.com</div>
            <ul className="w-full mt-3 text-sm">
              <li><a href="#identity" className="block w-full p-2 rounded hover:bg-[var(--color-hover)]">Identidade & Segurança</a></li>
              <li><a href="#history" className="block w-full p-2 rounded hover:bg-[var(--color-hover)]">Histórico & Atividade</a></li>
              <li><a href="#settings" className="block w-full p-2 rounded hover:bg-[var(--color-hover)]">Configurações & Preferências</a></li>
            </ul>
            <div className="w-full mt-3">
              <a href="#" className="btn btn-outline w-full">Sair</a>
            </div>
          </div>
        </nav>

        <section className="lg:col-span-3 space-y-6">
          <div id="identity" className="card p-6">
            <h2 className="text-xl font-semibold mb-3">Identidade e Segurança</h2>
            <p className="text-sm text-gray-700 mb-4">Informações básicas do usuário e opções de segurança.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Nome</label>
                <div className="mt-1 text-gray-800">João Exemplo</div>
                <div className="mt-2"><a className="text-sm text-brand hover:underline">Editar</a></div>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <div className="mt-1 text-gray-800">joao@example.com</div>
                <div className="mt-2"><a className="text-sm text-brand hover:underline">Alterar email</a></div>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Senha</label>
                <div className="mt-1 text-gray-800">••••••••</div>
                <div className="mt-2"><a className="text-sm text-brand hover:underline">Alterar senha</a></div>
              </div>
            </div>
          </div>

          <div id="history" className="card p-6">
            <h2 className="text-xl font-semibold mb-3">Histórico e Atividade</h2>
            <p className="text-sm text-gray-700 mb-4">Pedidos recentes e itens salvos.</p>
            <div className="space-y-3">
              <div className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">Pedido #12345</div>
                  <div className="text-sm text-gray-600">Enviado em 2025-09-01 — Entregue</div>
                </div>
                <div className="text-sm">R$ 199,90</div>
              </div>
              <div className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">Pedido #12312</div>
                  <div className="text-sm text-gray-600">Em processamento</div>
                </div>
                <div className="text-sm">R$ 49,90</div>
              </div>
            </div>
            <div className="mt-4">
              <a href="#" className="btn btn-outline">Ver histórico completo</a>
            </div>
          </div>

          <div id="settings" className="card p-6">
            <h2 className="text-xl font-semibold mb-3">Configurações e Preferências</h2>
            <p className="text-sm text-gray-700 mb-4">Ajuste como você quer que o site funcione para você.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded">
                <div className="font-medium">Endereços</div>
                <div className="text-sm text-gray-600">Rua Exemplo, 123 — Centro</div>
                <div className="mt-2"><a href="#" className="text-sm text-brand hover:underline">Gerenciar endereços</a></div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Pagamentos</div>
                <div className="text-sm text-gray-600">Cartão final 4242</div>
                <div className="mt-2"><a href="#" className="text-sm text-brand hover:underline">Gerenciar métodos</a></div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Notificações</div>
                <div className="text-sm text-gray-600">Email: Ativado</div>
                <div className="mt-2"><a href="#" className="text-sm text-brand hover:underline">Configurar notificações</a></div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Preferências de UI</div>
                <div className="text-sm text-gray-600">Densidade: Confortável</div>
                <div className="mt-2"><a href="#" className="text-sm text-brand hover:underline">Alterar</a></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
