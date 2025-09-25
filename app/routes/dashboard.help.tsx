import type { MetaFunction } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const meta: MetaFunction = () => {
  return [
    { title: "ʙússoʟa - Domine, Crie e Conquiste." },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export const loader = () => {
  return {};
};

export default function Index() {
  const news = [
    {
      date: "2025-08-18 00:00:00",
      title: "Busca de ações na página do parceiro",
      description:
        "Nova funcionalidade de busca por título de ações na página do parceiro. A busca é ativada automaticamente quando você digita mais de 2 caracteres.",
      image: null,
    },
    {
      date: "2025-08-18 00:00:00",
      title: "Atalhos Alt para categorias",
      description:
        "Novos atalhos Alt+tecla para mudança rápida de categorias. Use Alt+P para Post, Alt+R para Reels, Alt+C para Carrossel, Alt+S para Stories, e muito mais.",
      image: null,
    },
    {
      date: "2024-08-25 00:00:00",
      title: "Página dos parceiros",
      description:
        "A página dos parceiros ganhou atalhos para agilizar os processos de conferência e ajustar as ações.",
      image: null,
    },
    {
      date: "2024-08-15 00:00:00",
      title: "Página de ajuda online",
      description:
        "A página de ajuda com as novidades do sistema e os atalhos disponíveis está disponível.",
      image: null,
    },
    {
      date: "2024-08-15 00:00:00",
      title: "Temas definidos por padrão",
      description:
        "Agora, quando atualizar o tema de sua preferência na parte superior direta do app, ele será sincronizado com a sua conta.",
      image: null,
    },
  ];

  const areas = [
    {
      title: "Geral",
      description: "Pode ser realizada a qualquer momento.",
      shortcuts: [
        {
          title: "Home page ⭐︎",
          description: "Volta para a página inicial.",
          shortcut: "⌘/Ctrl + ⇧ + H",
        },
        {
          title: "Busca Global",
          description: "Abre a barra de pesquisa.",
          shortcut: "⌘/Ctrl + K",
        },
        {
          title: "Criar nova ação",
          description: "Abre o modal para criar uma nova ação.",
          shortcut: "⌘/Ctrl + ⇧ + A",
        },
        {
          title: "Salvar ação",
          description: "Salva a ação no modal de criação.",
          shortcut: "⌘/Ctrl + Enter",
        },
      ],
    },
    {
      title: "Parceiro",
      description: "Pode ser quando está na página do parceiro.",
      shortcuts: [
        {
          title: "Conteúdo/Lista",
          description:
            "Alterna entre mostrar ou não o conteúdo de postagens do instagram.",
          shortcut: "⇧ + ⌥ + C",
        },
        {
          title: "Responsáveis",
          description: "Mostrar ou ocultar todos os resposáveis das ações.",
          shortcut: "⇧ + ⌥ + R",
        },
        {
          title: "Feed do Instagram",
          description: "Exibir o Feed do Instagram ao lado do calendário.",
          shortcut: "⇧ + ⌥ + I",
        },
        {
          title: "Visualização compacta",
          description: "Alterna entre visualização normal e compacta.",
          shortcut: "⇧ + ⌥ + S",
        },
        {
          title: "Selecionar todas",
          description: "Seleciona todas as ações visíveis na página.",
          shortcut: "⌘/Ctrl + A",
        },
      ],
    },
    {
      title: "Ação",
      description: `É necessário que o ponteiro do mouse esteja sobre a ação.`,
      shortcuts: [
        {
          title: "Editar",
          description: "Leva à página de edição da ação.",
          shortcut: "⇧ + E",
        },
        {
          title: "Duplicar",
          description: "Duplica a ação criando uma cópia com novo ID.",
          shortcut: "⇧ + D",
        },
        {
          title: "Excluir",
          description: "Exclui a ação (com confirmação).",
          shortcut: "⇧ + X",
        },
        {
          title: "Toggle Sprint",
          description: "Adiciona ou remove a ação do sprint.",
          shortcut: "⇧ + U",
        },
        {
          title: "Para hoje (30min)",
          description: "Move a ação para hoje com 30 minutos de atraso.",
          shortcut: "⇧ + H",
        },
        {
          title: "Para amanhã",
          description: "Move a ação para amanhã no mesmo horário.",
          shortcut: "⇧ + A",
        },
        {
          title: "Adiar 1 semana",
          description: "Adia a ação em 1 semana.",
          shortcut: "⇧ + S",
        },
        {
          title: "Adiar 1 mês",
          description: "Adia a ação em 1 mês.",
          shortcut: "⇧ + M",
        },
        {
          title: "Adiar em 1 hora",
          description: "Adia a ação em 1 hora.",
          shortcut: "⇧ + 1",
        },
        {
          title: "Adiar em 2 horas",
          description: "Adia a ação em 2 horas.",
          shortcut: "⇧ + 2",
        },
        {
          title: "Adiar em 3 horas",
          description: "Adia a ação em 3 horas.",
          shortcut: "⇧ + 3",
        },
        {
          title: "Sair da edição",
          description: "Cancela a edição inline do título ou descrição.",
          shortcut: "Escape",
        },
        {
          title: "Salvar edição",
          description: "Salva as alterações na edição inline.",
          shortcut: "Enter",
        },
        {
          title: "Adiar 1 semana (Ctrl)",
          description: "Adia a ação em 1 semana usando apenas Ctrl.",
          shortcut: "Ctrl + S",
        },
      ],
    },
    {
      title: "Categorias",
      description: "Alterar categoria da ação (ponteiro sobre a ação).",
      shortcuts: [
        {
          title: "Post",
          description: "Altera para categoria Post.",
          shortcut: "⌥ + P",
        },
        {
          title: "Reels",
          description: "Altera para categoria Reels.",
          shortcut: "⌥ + R",
        },
        {
          title: "Carrossel",
          description: "Altera para categoria Carrossel.",
          shortcut: "⌥ + C",
        },
        {
          title: "Stories",
          description: "Altera para categoria Stories.",
          shortcut: "⌥ + S",
        },
        {
          title: "Texto",
          description: "Altera para categoria Texto.",
          shortcut: "⌥ + T",
        },
        {
          title: "Vídeo",
          description: "Altera para categoria Vídeo.",
          shortcut: "⌥ + V",
        },
        {
          title: "Imagem",
          description: "Altera para categoria Imagem.",
          shortcut: "⌥ + I",
        },
        {
          title: "Evento",
          description: "Altera para categoria Evento.",
          shortcut: "⌥ + E",
        },
      ],
    },
    {
      title: "Estados e Prioridades",
      description: "Alterar estado ou prioridade (ponteiro sobre a ação).",
      shortcuts: [
        {
          title: "Estados",
          description:
            "Use F (Fazer), Z (Fazendo), P (Aprovado), T (Feito), etc.",
          shortcut: "Tecla simples",
        },
        {
          title: "Prioridades",
          description:
            "Use teclas definidas no banco de dados para cada prioridade.",
          shortcut: "Tecla simples",
        },
      ],
    },
  ];

  return (
    <div className="scrollbars">
      <div className="container mx-auto mt-16 max-w-xl px-8 pb-16">
        <div className="mb-16">
          <h2 className="text-4xl font-bold tracking-tighter">Atalhos</h2>
          <div className="mb-4 text-sm opacity-50">
            Atalhos de teclado ao usar ações
          </div>
          <div className="space-y-8">
            {areas.map((area, i) => (
              <div key={i}>
                <div className="mb-2 flex justify-between gap-8 text-right">
                  <div className="text-lg font-bold tracking-wider uppercase">
                    {area.title}
                  </div>
                  <div className="mb-4 text-xs opacity-50">
                    {area.description}
                  </div>
                </div>
                {area.shortcuts.map((s, i) => (
                  <div
                    key={i}
                    className="mb-2 grid grid-cols-4 items-center gap-2"
                  >
                    <div className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap">
                      {s.title}
                    </div>
                    <div className="col-span-2 overflow-hidden text-sm opacity-75">
                      {s.description}
                    </div>
                    <div className="text-right text-sm font-bold">
                      {s.shortcut}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-4xl font-bold tracking-tighter">Novidades</h2>
          <div className="mb-4 text-sm opacity-50">
            Novidades e atualizações de ferramentas do sistema.
          </div>

          <div className="space-y-8">
            {news.map((n, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="text-sm opacity-50">
                  {format(new Date(n.date), "d 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </div>
                <div className="text-xl font-semibold">{n.title}</div>
                {n.image && (
                  <div>
                    <img src={n.image} title={n.title} />
                  </div>
                )}
                <div>{n.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
