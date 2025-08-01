// export const CATEGORIES = {
//   capture: "capture",
//   todo: "todo",
//   post: "post",

//   carousel: "carousel",
//   reels: "reels",
//   stories: "stories",

//   dev: "dev",
//   print: "print",
//   meeting: "meeting",

//   finance: "finance",
//   design: "design",
//   ads: "ads",

//   sm: "sm",
//   plan: "plan",
// };

export const PRIORITIES = {
  low: "low",
  medium: "mid",
  high: "high",
};

export const INTENTS = {
  createAction: "actions-create",
  updateAction: "action-update",
  updateActions: "actions-update",
  deleteAction: "action-delete",
  recoverAction: "action-recover",
  destroyAction: "action-destroy",
  setSprint: "sprint-set",
  unsetSprint: "sprint-unset",
  duplicateAction: "action-duplicate",
  updatePerson: "person-update",
  updatePartner: "partner-update",
  createTopic: "topic-create",
};

export const BASE_COLOR = "rgba(120,140,150,.2)";

export const SOW = {
  marketing: "marketing",
  socialmedia: "socialmedia",
  demand: "demand",
};

export const TIMES = {
  capture: 60,
  todo: 5,
  post: 10,

  carousel: 30,
  reels: 20,
  stories: 5,

  dev: 30,
  print: 30,
  meeting: 60,

  finance: 5,
  design: 30,
  ads: 15,

  sm: 15,
  plan: 50,
};

export const TRIGGERS = [
  {
    value: "Antecipação",
  },
  {
    value: "Autoridade",
  },
  {
    value: "Curiosidade",
  },
  {
    value: "Escassez",
  },
  {
    value: "Esclusividade",
  },
  {
    value: "Humanização",
  },
  {
    value: "Inimigo Comum",
  },
  {
    value: "Novidade",
  },
  {
    value: "Pertencimento",
  },
  {
    value: "Prova Social",
  },
  {
    value: "Reciprocidade",
  },
  {
    value: "Urgência",
  },
];

export const FRAMEWORKS = {
  aida: {
    title: "aida",
    prompt: `AIDA: Atenção - Use emojis, perguntas diretas ou estatísticas chocantes Interesse - Faça o público se identificar com o problema ou a situação Desejo - Gere expectativa sobre a solução. Ação - Finalize com um convite claro e uma CTA estratégica.`,
  },
  slap: {
    title: "slap",
    prompt: `SLAP: Stop - Uma frase impactante ou provocativa para interromper o "scroll" do usuário. Look - Explique o problema de forma que o público se identifique. Act - Mostre uma ação específica que o público pode tomar para resolver o problema. Purchase - Finalize com uma chamada para a ação clara e forte.`,
  },
  pas: {
    title: "pas",
    prompt: `PAS: Problem - Introduza o problema de forma direta, para que o público se identifique rapidamente. Agitate - Aprofunde a dor, fazendo com que o público sinta a necessidade urgente de resolver o problema. Solution - Mostre como você pode resolver esse problema com uma solução clara e atrativa. CTA - Finalize com um convite claro para agir.`,
  },
  fab: {
    title: "fab",
    prompt: `FAB: Features - Mostre as especificidades do produto/serviço. Advantages - Explique por que essas características são importantes. Benefits - Relacione como essas vantagens resolvem os problemas ou melhoram a vida da audiência. CTA - Finalize com um convite claro para agir de acordo com o CONTEXTO.`,
  },
  bab: {
    title: "bab",
    prompt: `BAB: Before (Antes): Descreva a situação atual ou o problema que a audiência enfrenta.
After (Depois): Mostre como a vida deles poderia ser melhor com a solução.
Bridge (Ponte): Apresente sua oferta como o caminho para ir "do antes ao depois". CTA - Finalize com um convite claro para agir de acordo com o CONTEXTO.`,
  },
  "4ps": {
    title: "4ps",
    prompt: `4Ps: Promise (Promessa): Faça uma afirmação clara sobre o que você oferecerá.
Picture (Imagem): Ajude a visualizar os resultados ou o impacto.
Proof (Prova): Apresente evidências (testemunhos, números, fatos).
Push (Impulso): Finalize com um convite ou motivação clara para agir. CTA - Finalize com um convite claro para agir de acordo com o CONTEXTO.`,
  },
  star: {
    title: "star",
    prompt: `STAR: Situation (Situação): Descreva a situação atual.
Task (Tarefa): Identifique os objetivos e desafios.
Action (Ação): Mostre como você ou sua solução entrou em ação.
Result (Resultado): Explique os resultados alcançados. CTA - Finalize com um convite claro para agir de acordo com o CONTEXTO.`,
  },
  adia: {
    title: "adia",
    prompt: `ADIA: Attention (Situação): Descreva a situação atual.
Desire (Tarefa): Identifique os objetivos e desafios.
Information (Ação): Mostre como você ou sua solução entrou em ação.
Action (Resultado): Explique os resultados alcançados. CTA - Finalize com um convite claro para agir de acordo com o CONTEXTO.`,
  },
};

export const MODELS = {
  short: { slug: "short", title: "Curta", prompt: "" },
  medium: { slug: "medium", title: "Média", prompt: "" },
  long: { slug: "long", title: "Longa", prompt: "" },
  "long-tip": { slug: "long-tip", title: "Longa com Dicas", prompt: "" },
};

export const SOULS = {
  technique: {
    slug: "technique",
    title: "Técnica",
    prompt:
      "O conteúdo deve ser objetivo, prático e focado em entregar informações úteis ou conhecimento claro. Evite narrativas pessoais ou opiniões subjetivas; concentre-se em fornecer uma solução, dica ou dado específico que o público possa aplicar diretamente. Use um tom educativo e direto, como se estivesse ensinando ou informando algo essencial sobre o [CONTEXTO]. O resultado deve sempre priorizar a clareza e a utilidade.",
  },
  positioning: {
    slug: "positioning",
    title: "Posicionamento",
    prompt:
      "O conteúdo deve transmitir uma opinião, crença ou filosofia clara relacionada ao [CONTEXTO], com o objetivo de inspirar o público ou mudar sua percepção. Evite focar em passos práticos ou histórias pessoais detalhadas; em vez disso, destaque uma ideia central que desafie visões comuns ou proponha uma nova perspectiva sobre o [CONTEXTO]. Use um tom assertivo e motivacional.",
    // "O conteúdo deve posicionar a marca, o produto ou o serviço como uma solução valiosa e relevante para o público. Destaque os benefícios, diferenciais e vantagens competitivas de forma clara e objetiva. Use um tom confiante, assertivo e persuasivo, como se estivesse convencendo o público de que sua oferta é a melhor opção para resolver um problema ou atender a uma necessidade específica. O resultado deve sempre priorizar a credibilidade e a persuasão."
  },
  storytelling: {
    slug: "storytelling",
    title: "Storytelling",
    prompt:
      "O conteúdo deve ser uma narrativa envolvente e relacionada que conecte o [CONTEXTO] a uma experiência pessoal ou história fictícia. Foque em criar uma jornada com começo, desafio e resolução, usando detalhes que gerem emoção ou identificação no público. Evite ser excessivamente técnico ou opinativo; o objetivo é engajar por meio da história ligada ao [CONTEXTO]. ",
  },
  update: {
    slug: "update",
    title: "Atualização",
    prompt:
      "O conteúdo deve trazer uma novidade, fato recente ou informação atualizada sobre o [CONTEXTO], com foco em captar a atenção por ser algo novo ou relevante agora. Evite narrativas longas ou opiniões pessoais; apresente o fato ou descoberta de forma clara e intrigante, como uma notícia breve. Use um tom informativo e direto, ideal para formatos como frase, gráfico ou carrossel que destaquem a atualização sobre o [CONTEXTO].",
    // "O conteúdo deve ser uma atualização relevante, informativa ou noticiosa sobre o [CONTEXTO], com o objetivo de manter o público informado e engajado. Foque em novidades, tendências ou mudanças recentes, evitando informações desatualizadas ou irrelevantes. Use um tom objetivo, claro e conciso, como se estivesse reportando uma informação importante ou interessante sobre o [CONTEXTO]. O resultado deve sempre priorizar a relevância e a atualidade."
  },
};

export const archetypes = [
  {
    name: "Criador",
    voice: [1, 4, 3, 4, 2, 4, 5, 3, 5, 4, 2, 5, 1, 3, 5],
  },
  {
    name: "Prestativo",
    voice: [2, 5, 2, 1, 1, 5, 4, 1, 1, 2, 2, 5, 3, 1, 5],
  },
  {
    name: "Governante",
    voice: [5, 1, 1, 5, 5, 1, 2, 5, 1, 5, 4, 2, 5, 5, 1],
  },
  {
    name: "Bobo da Corte",
    voice: [1, 4, 5, 1, 1, 5, 5, 1, 5, 3, 3, 4, 1, 2, 4],
  },
  {
    name: "Cara Comum",
    voice: [2, 3, 3, 2, 2, 5, 3, 2, 2, 2, 2, 5, 3, 2, 4],
  },
  {
    name: "Amante",
    voice: [1, 5, 4, 1, 2, 5, 5, 2, 3, 5, 3, 4, 2, 2, 5],
  },
  {
    name: "Herói",
    voice: [3, 5, 2, 4, 4, 3, 5, 3, 3, 5, 5, 4, 2, 5, 4],
  },
  {
    name: "Fora da Lei",
    voice: [1, 3, 4, 2, 1, 2, 4, 2, 5, 4, 4, 3, 1, 4, 2],
  },
  {
    name: "Mago",
    voice: [4, 3, 2, 5, 5, 2, 4, 5, 4, 4, 3, 3, 1, 4, 3],
  },
  {
    name: "Inocente",
    voice: [1, 4, 4, 1, 1, 4, 5, 1, 2, 2, 1, 5, 3, 1, 4],
  },
  {
    name: "Explorador",
    voice: [1, 4, 3, 3, 2, 3, 5, 2, 4, 3, 4, 3, 1, 3, 3],
  },
  {
    name: "Sábio",
    voice: [4, 2, 1, 5, 5, 2, 2, 5, 2, 3, 2, 4, 4, 4, 3],
  },
];
