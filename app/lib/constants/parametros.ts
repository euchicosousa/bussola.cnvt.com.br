export const parametersOptimized = [
  {
    id: 1,
    title: "Impacto Emocional",
    description: "Combina intensidade emocional + sensacionalismo",
    values: [
      { id: 1, value: "Tom neutro e objetivo" },
      { id: 2, value: "Levemente envolvente" },
      { id: 3, value: "Moderadamente impactante" },
      { id: 4, value: "Forte apelo emocional" },
      { id: 5, value: "Extremamente dramático e sensacionalista" },
    ],
  },
  {
    id: 2,
    title: "Nível de Pressão",
    description: "Combina ansiedade gerada + urgência comunicada",
    values: [
      { id: 1, value: "Completamente tranquilo" },
      { id: 2, value: "Importância sem pressa" },
      { id: 3, value: "Urgência saudável e motivadora" },
      { id: 4, value: "Pressão significativa por ação" },
      { id: 5, value: "Alarmante e angustiante" },
    ],
  },
  {
    id: 3,
    title: "Proximidade Conversacional",
    description: "Tom de relacionamento com o público",
    values: [
      { id: 1, value: "Muito formal e distante" },
      { id: 2, value: "Formal mas acessível" },
      { id: 3, value: "Equilibrado e profissional" },
      { id: 4, value: "Conversação natural e próxima" },
      { id: 5, value: "Muito íntimo e descontraído" },
    ],
  },
  {
    id: 4,
    title: "Complexidade Técnica",
    description: "Nível técnico vs acessibilidade",
    values: [
      { id: 1, value: "Linguagem extremamente simples" },
      { id: 2, value: "Simples com explicações básicas" },
      { id: 3, value: "Moderadamente técnico mas explicado" },
      { id: 4, value: "Técnico com termos especializados" },
      { id: 5, value: "Altamente especializado" },
    ],
  },
  {
    id: 5,
    title: "Orientação para Solução",
    description: "Foco em problemas vs soluções",
    values: [
      { id: 1, value: "Apenas aponta problemas" },
      { id: 2, value: "Mais problemas que soluções" },
      { id: 3, value: "Equilibra problemas e soluções" },
      { id: 4, value: "Focado em soluções práticas" },
      { id: 5, value: "Exclusivamente orientado a ações" },
    ],
  },
  {
    id: 6,
    title: "Suporte Emocional",
    description: "Validação e acolhimento dos sentimentos",
    values: [
      { id: 1, value: "Ignora aspectos emocionais" },
      { id: 2, value: "Reconhece sutilmente" },
      { id: 3, value: "Moderadamente empático" },
      { id: 4, value: "Alta validação e acolhimento" },
      { id: 5, value: "Extremamente focado no emocional" },
    ],
  },
];

export const suggestionsParameters = [
  // SAÚDE E MEDICINA
  {
    title: "Conteúdo Saúde Geral",
    values: [2, 2, 4, 2, 4, 4],
  },
  {
    title: "Emergência Médica",
    values: [3, 4, 3, 2, 5, 3],
  },
  { title: "Saúde Mental", values: [2, 1, 5, 1, 4, 5] },
  { title: "Prevenção", values: [2, 2, 4, 2, 5, 3] },

  // NEGÓCIOS E EMPREENDEDORISMO
  {
    title: "Marketing Agressivo",
    values: [4, 4, 3, 2, 4, 2],
  },
  {
    title: "Consultoria Empresarial",
    values: [2, 2, 3, 4, 4, 2],
  },
  { title: "Startup Pitch", values: [4, 3, 4, 3, 5, 2] },

  // EDUCAÇÃO
  { title: "Ensino Básico", values: [2, 1, 5, 1, 3, 4] },
  {
    title: "Ensino Superior",
    values: [2, 2, 3, 4, 3, 2],
  },
  {
    title: "Educação Adultos",
    values: [2, 2, 4, 2, 4, 3],
  },

  // FINANÇAS
  {
    title: "Investimentos Conservadores",
    values: [1, 1, 2, 3, 4, 2],
  },
  {
    title: "Trading Criptomoedas",
    values: [3, 3, 4, 3, 3, 2],
  },
  {
    title: "Educação Financeira",
    values: [2, 2, 4, 1, 4, 3],
  },

  // TECNOLOGIA
  {
    title: "Segurança Cibernética",
    values: [3, 4, 3, 3, 4, 2],
  },
  {
    title: "Tutoriais Técnicos",
    values: [1, 1, 2, 4, 4, 1],
  },
  { title: "Inovação Tech", values: [3, 2, 4, 3, 4, 2] },

  // ALIMENTAÇÃO E NUTRIÇÃO
  {
    title: "Dietas Emagrecimento",
    values: [2, 1, 4, 2, 4, 4],
  },
  {
    title: "Nutrição Esportiva",
    values: [2, 2, 3, 3, 4, 2],
  },
  {
    title: "Alimentação Infantil",
    values: [1, 1, 4, 2, 4, 4],
  },

  // RELACIONAMENTOS
  { title: "Autoajuda", values: [3, 1, 5, 1, 4, 5] },
  {
    title: "Relacionamentos Amorosos",
    values: [2, 1, 5, 1, 3, 5],
  },

  // MODA E BELEZA
  { title: "Skincare", values: [2, 1, 4, 2, 4, 3] },
  {
    title: "Makeup Profissional",
    values: [2, 2, 3, 3, 4, 2],
  },

  // VIAGENS
  {
    title: "Turismo Aventura",
    values: [4, 2, 4, 2, 4, 2],
  },
  {
    title: "Viagens Econômicas",
    values: [2, 2, 4, 1, 5, 3],
  },

  // SUSTENTABILIDADE
  {
    title: "Mudanças Climáticas",
    values: [3, 3, 4, 2, 4, 3],
  },
  {
    title: "Dicas Ecológicas",
    values: [2, 1, 4, 1, 5, 3],
  },

  // ESPORTES E FITNESS
  {
    title: "Treinamento Intensivo",
    values: [3, 3, 3, 3, 4, 2],
  },
  {
    title: "Iniciantes Fitness",
    values: [2, 1, 4, 2, 4, 4],
  },

  // CASOS ESPECIAIS
  {
    title: "Crise Comunicação",
    values: [2, 2, 3, 2, 5, 4],
  },
  { title: "Conteúdo Viral", values: [4, 3, 5, 1, 3, 2] },
  { title: "Público Idoso", values: [1, 1, 2, 1, 4, 3] },
  { title: "Público Jovem", values: [3, 2, 5, 1, 3, 3] },

  // COMPARAÇÃO DE EXEMPLOS
  {
    title: "Exemplo Original Agressivo",
    values: [5, 5, 1, 3, 2, 3],
  },
  {
    title: "Exemplo Revisado Conversacional",
    values: [2, 2, 4, 2, 4, 4],
  },
];
