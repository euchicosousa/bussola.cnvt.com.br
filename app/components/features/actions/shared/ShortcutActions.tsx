import React, { useCallback, useEffect } from "react";
import {
  useNavigate,
  useSubmit,
  useMatches,
  useSearchParams,
} from "react-router";
import { format } from "date-fns";
import { INTENTS } from "~/lib/constants";
import {
  handleCategoryShortcut,
  handleCustomShortcut,
  handlePriorityShortcut,
  handleStateShortcut,
} from "~/lib/helpers/actions-processor";
import { findShortcut } from "~/lib/helpers/shortcuts";

const DEFAULT_UPDATE_TIMESTAMP = () =>
  format(new Date(), "yyyy-MM-dd HH:mm:ss");

/**
 * Componente responsável por gerenciar atalhos de teclado para ações
 *
 * 🚀 SISTEMA DE ATALHOS MODERNO - BASEADO EM MAPA
 *
 * ✨ ARQUITETURA ELEGANTE:
 * - Sistema centralizados em SHORTCUTS_MAP
 * - Funções especializadas para cada tipo de atalho
 * - Prioridade: Mapa → Categorias → Estados/Prioridades
 * - Tipagem forte e fácil expansão
 *
 * 🎯 CATEGORIAS (ALT + tecla):
 * - Sistema híbrido: BD primeiro, depois atalhos fixos
 * - Alt+P = Post, Alt+R = Reels, Alt+C = Carrossel, Alt+S = Stories
 * - Alt+T = Texto, Alt+V = Video, Alt+I = Imagem
 * - Alt+A = Anúncio, Alt+E = Evento, Alt+F = Frontend, etc.
 *
 * ⏰ TEMPO (SHIFT + tecla):
 * - Shift+1/2/3 = +1h/2h/3h, Shift+H = hoje, Shift+A = amanhã
 * - Shift+S = +1 semana, Shift+M = +1 mês
 *
 * 🔧 AÇÕES (SHIFT + tecla):
 * - Shift+E = Editar, Shift+D = Duplicar, Shift+X = Excluir
 * - Shift+U = Toggle Sprint
 *
 * 📊 ESTADOS/PRIORIDADES (tecla simples):
 * - F = Fazer, P = Aprovado, T = Feito, A = Análise
 * - Z = Fazendo, C = Concluído, I = Ideia
 *
 * 🕐 HORÁRIOS ABSOLUTOS (ALT + número):
 * - Alt+1/2/3 = Define horário fixo para 1h/2h/3h do dia atual
 *
 * 🎖️ VANTAGENS DO NOVO SISTEMA:
 * - Centralizado e fácil de manter
 * - Tipagem forte e TypeScript
 * - Extensível via SHORTCUTS_MAP
 * - Separação clara de responsabilidades
 * - Zero conflitos entre atalhos
 */
export const ShortcutActions = React.memo(function ShortcutActions({
  action,
  onDeleteAction,
}: {
  action: Action;
  onDeleteAction: (action: Action) => void;
}) {
  const navigate = useNavigate();
  const submit = useSubmit();
  const matches = useMatches();
  const [searchParams] = useSearchParams();
  const isInstagramDate = !!searchParams.get("instagram_date");

  const { states, categories, priorities, person } = matches[1]
    .data as DashboardRootType;

  const handleActions = useCallback(
    (data: HandleActionsDataType) => {
      submit(
        { ...data, updated_at: DEFAULT_UPDATE_TIMESTAMP() },
        {
          action: "/handle-actions",
          method: "post",
          navigate: false,
        },
      );
    },
    [submit],
  );

  const keyDownHandler = useCallback(
    async (event: KeyboardEvent) => {
      // Para atalhos Alt e Shift, usar event.code em vez de event.key para evitar caracteres especiais
      const key =
        event.altKey || event.shiftKey
          ? event.code.replace("Key", "").replace("Digit", "").toLowerCase()
          : event.key.toLowerCase();

      /**
       * SISTEMA DE ATALHOS MODERNO - Baseado em Mapa
       *
       * 1. Primeiro: Verifica atalhos do mapa (SHORTCUTS_MAP)
       * 2. Segundo: Verifica atalhos de categorias (Alt + tecla)
       * 3. Terceiro: Verifica atalhos de estados/prioridades (tecla simples)
       *
       * Este sistema é mais elegante, escalável e fácil de manter
       */

      // PASSO 1: Verificar atalhos definidos no mapa
      const shortcut = findShortcut(key, event);
      if (shortcut) {
        event.preventDefault();
        event.stopPropagation();

        switch (shortcut.action.type) {
          case "updateAction":
            handleActions({
              ...action,
              ...shortcut.action.data,
              updated_at: DEFAULT_UPDATE_TIMESTAMP(),
            });
            break;

          case "navigate":
            navigate(shortcut.action.path);
            break;

          case "custom":
            // Executar handlers personalizados
            await handleCustomShortcut(shortcut, action, event, {
              navigate,
              handleActions,
              isInstagramDate,
              person,
              confirmDelete: () => {
                onDeleteAction(action);
              },
            });
            break;
        }
        return;
      }

      // PASSO 2: Verificar atalhos de categorias (Alt + tecla)
      if (event.altKey && !event.shiftKey && !event.ctrlKey) {
        event.preventDefault(); // Prevenir ação padrão do sistema operacional
        if (handleCategoryShortcut(key, action, categories, handleActions)) {
          return;
        }
      }

      // PASSO 3: Verificar atalhos de estados e prioridades (tecla simples)
      if (!event.altKey && !event.shiftKey && !event.ctrlKey) {
        if (
          handleStateShortcut(key, action, states, handleActions) ||
          handlePriorityShortcut(key, action, priorities, handleActions)
        ) {
          event.preventDefault();
          return;
        }
      }
    },
    [
      action,
      navigate,
      handleActions,
      isInstagramDate,
      categories,
      states,
      priorities,
      person,
      onDeleteAction,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", keyDownHandler);
    return () => window.removeEventListener("keydown", keyDownHandler);
  }, [keyDownHandler]);

  return null;
});
