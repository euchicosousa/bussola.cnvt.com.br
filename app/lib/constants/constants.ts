export const PRIORITIES = {
  low: "low",
  medium: "mid",
  high: "high",
};

export const ORDER_ACTIONS_BY = {
  date: "date",
  title: "title",
  state: "state",
  priority: "priority",
} as const;

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
  updateTopic: "topic-update",
  updateCategory: "category-update",
  updateState: "state-update",
  updatePriority: "priority-update",
  uploadFiles: "files-upload",
};

export const AI_INTENTS = {
  generateTitle: "title",
  generateIdeas: "ideas",
  generateCarousel: "carousel",
  generateStories: "stories",
  generateCaption: "instagram_caption",
  executePrompt: "prompt",
  expandText: "expand",
  shrinkText: "shrink",
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

export const VARIANTS = {
  LINE: "line",
  BLOCK: "block",
  HAIR: "hair",
  GRID: "grid",
  CONTENT: "content",
  HOUR: "hour",
  FINANCE: "finance",
};

export const DATE_FORMAT = {
  NONE: 0, // Sem data, só tempo
  RELATIVE: 1, // "há 2 horas"
  SHORT: 2, // "15/12"
  MEDIUM: 3, // "15 de dez"
  FULL: 4, // "seg, 15 de dezembro"
} as const;

export const TIME_FORMAT = {
  NONE: 0, // Sem horário
  WITH_TIME: 1, // "15h30"
} as const;

export type DateDisplay = {
  dateFormat?: (typeof DATE_FORMAT)[keyof typeof DATE_FORMAT];
  timeFormat?: (typeof TIME_FORMAT)[keyof typeof TIME_FORMAT];
};

export const STATE = {
  Ideia: "ideia",
  Fazer: "do",
  Fazendo: "doing",
  Análise: "review",
  Aprovado: "approved",
  Feito: "done",
  Concluído: "finished",
};
