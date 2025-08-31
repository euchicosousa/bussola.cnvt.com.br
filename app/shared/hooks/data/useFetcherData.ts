import { useFetchers } from "react-router";
import { INTENTS } from "~/lib/constants";

export function useIDsToRemove(): {
  actions: string[];
  sprints: { action_id: string; user_id: string }[];
} {
  return {
    actions: useFetchers()
      .filter((fetcher) => {
        if (!fetcher.formData) {
          return false;
        }
        return fetcher.formData.get("intent") === INTENTS.deleteAction;
      })
      .map((fetcher) => {
        return String(fetcher.formData?.get("id"));
      }),
    sprints: useFetchers()
      .filter((fetcher) => {
        if (!fetcher.formData) {
          return false;
        }
        return fetcher.formData.get("intent") === INTENTS.unsetSprint;
      })
      .map((fetcher) => {
        return {
          action_id: String(fetcher.formData?.get("action_id")),
          user_id: String(fetcher.formData?.get("user_id")),
        };
      }),
  };
}

export function usePendingData(): { actions: Action[]; sprints: Sprint[] } {
  return {
    actions: useFetchers()
      .filter((fetcher) => {
        if (!fetcher.formData) {
          return false;
        }
        return (
          fetcher.formData.get("intent") === INTENTS.createAction ||
          fetcher.formData.get("intent") === INTENTS.updateAction
        );
      })
      .map((fetcher) => {
        const action: Action = {
          id: String(fetcher.formData?.get("id")),
          title: String(fetcher.formData?.get("title")),
          description: String(fetcher.formData?.get("description")),
          user_id: String(fetcher.formData?.get("user_id")),
          date: String(fetcher.formData?.get("date")),
          instagram_date: String(fetcher.formData?.get("instagram_date")),
          responsibles: String(fetcher.formData?.getAll("responsibles")).split(
            ",",
          ),
          time: Number(fetcher.formData?.get("time")),
          created_at: String(fetcher.formData?.get("created_at")),
          updated_at: String(fetcher.formData?.get("updated_at")),
          category: String(fetcher.formData?.get("category")),
          state: String(fetcher.formData?.get("state")),
          priority: String(fetcher.formData?.get("priority")),
          instagram_caption: String(fetcher.formData?.get("instagram_caption")),
          color: String(fetcher.formData?.get("color")),
          files: String(fetcher.formData?.get("files")).split(","),
          archived: fetcher.formData?.has("archived") 
            ? Boolean(fetcher.formData.get("archived")) 
            : null,
          partners: String(fetcher.formData?.get("partners")).split(","),
          topics: String(fetcher.formData?.get("topics"))
            .split(",")
            .map(Number),
          caption: String(fetcher.formData?.get("caption")) || null,
          instagram_content: String(fetcher.formData?.get("instagram_content")) || null,
        };

        return { ...action };
      }) as Action[],
    sprints: useFetchers()
      .filter((fetcher) => {
        if (!fetcher.formData) {
          return false;
        }
        return fetcher.formData.get("intent") === INTENTS.setSprint;
      })
      .map((fetcher) => {
        const sprint: Sprint = {
          id: String(fetcher.formData?.get("id")),
          action_id: String(fetcher.formData?.get("action_id")),
          user_id: String(fetcher.formData?.get("user_id")),
          created_at: String(fetcher.formData?.get("created_at")),
        };

        return { ...sprint };
      }) as Sprint[],
  };
}