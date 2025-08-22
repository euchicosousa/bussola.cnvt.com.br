// Tipos e utilitários para o sistema de atalhos

// Tipos para o sistema de atalhos
export type ShortcutModifiers = {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export type ShortcutAction =
  | { type: "updateAction"; data: any }
  | { type: "navigate"; path: string }
  | { type: "custom"; handler: (action: Action) => void };

export type ShortcutDefinition = {
  key: string;
  modifiers: ShortcutModifiers;
  action: ShortcutAction;
  description: string;
};

// Mapa centralizado de todos os atalhos
export const SHORTCUTS_MAP: ShortcutDefinition[] = [
  // ===== AÇÕES PRINCIPAIS =====
  {
    key: "e",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // Será preenchido no handler
    description: "Editar ação",
  },
  {
    key: "d",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // Duplicação
    description: "Duplicar ação",
  },
  {
    key: "x",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // Confirmação de exclusão
    description: "Excluir ação",
  },
  {
    key: "u",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // Toggle sprint
    description: "Toggle Sprint",
  },

  // ===== TEMPO RELATIVO (SHIFT) =====
  {
    key: "1",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // +1h
    description: "+1 hora",
  },
  {
    key: "2",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // +2h
    description: "+2 horas",
  },
  {
    key: "3",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // +3h
    description: "+3 horas",
  },
  {
    key: "h",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // hoje
    description: "Para hoje",
  },
  {
    key: "a",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // amanhã
    description: "Para amanhã",
  },
  {
    key: "s",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // +1 semana
    description: "+1 semana",
  },
  {
    key: "m",
    modifiers: { shift: true },
    action: { type: "custom", handler: (action) => {} }, // +1 mês
    description: "+1 mês",
  },

  // ===== TEMPO ABSOLUTO (ALT + NÚMEROS) =====
  {
    key: "1",
    modifiers: { alt: true },
    action: { type: "custom", handler: (action) => {} }, // 1h hoje
    description: "Definir para 1h hoje",
  },
  {
    key: "2",
    modifiers: { alt: true },
    action: { type: "custom", handler: (action) => {} }, // 2h hoje
    description: "Definir para 2h hoje",
  },
  {
    key: "3",
    modifiers: { alt: true },
    action: { type: "custom", handler: (action) => {} }, // 3h hoje
    description: "Definir para 3h hoje",
  },

  // ===== CTRL + TEMPO =====
  {
    key: "s",
    modifiers: { ctrl: true },
    action: { type: "custom", handler: (action) => {} }, // +1 semana
    description: "Adiar 1 semana",
  },
];

// Atalhos fixos para categorias (fallback quando não há no BD)
export const CATEGORY_SHORTCUTS_FALLBACK = {
  p: "post",
  r: "reels",
  c: "carousel",
  s: "stories",
  t: "texto",
  v: "video",
  i: "imagem",
  e: "evento",
  n: "newsletter",
  w: "website",
  l: "live",
  m: "email",
  j: "anuncio",
  d: "design",
  f: "frontend",
  b: "backend",
  g: "growth",
  h: "pesquisa",
  o: "outros",
} as const;

/**
 * Verifica se um evento de teclado corresponde aos modificadores esperados
 */
export function matchesModifiers(
  event: KeyboardEvent,
  modifiers: ShortcutModifiers,
): boolean {
  return (
    !!event.ctrlKey === !!modifiers.ctrl &&
    !!event.shiftKey === !!modifiers.shift &&
    !!event.altKey === !!modifiers.alt
  );
}

/**
 * Encontra o atalho correspondente no mapa baseado na tecla e modificadores
 */
export function findShortcut(
  key: string,
  event: KeyboardEvent,
): ShortcutDefinition | null {
  return (
    SHORTCUTS_MAP.find(
      (shortcut) =>
        shortcut.key === key && matchesModifiers(event, shortcut.modifiers),
    ) || null
  );
}

/**
 * Combina os atalhos do banco de dados com os atalhos fixos para categorias
 */
export function getCategoryShortcuts(categories: Category[]): Record<string, string> {
  const shortcuts: Record<string, string> = {};

  // Prioridade 1: Atalhos definidos no banco de dados
  categories.forEach((category) => {
    if (category.shortcut && category.shortcut.length === 1) {
      shortcuts[category.shortcut.toLowerCase()] = category.slug;
    }
  });

  // Prioridade 2: Atalhos fixos (fallback)
  Object.entries(CATEGORY_SHORTCUTS_FALLBACK).forEach(([key, slug]) => {
    if (!shortcuts[key] && categories.find((c) => c.slug === slug)) {
      shortcuts[key] = slug;
    }
  });

  return shortcuts;
}