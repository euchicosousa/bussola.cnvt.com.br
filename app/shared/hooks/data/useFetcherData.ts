import { useFetchers } from "react-router";
import { INTENTS } from "~/lib/constants";

export function useIDsToRemove(): {
  actions: string[];
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
  };
}

export function usePendingData(): { actions: Action[] } {
  const actions = useFetchers()
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
        content_files: fetcher.formData?.get("content_files")
          ? String(fetcher.formData.get("content_files")).split(",")
          : null,
        work_files: fetcher.formData?.get("work_files")
          ? String(fetcher.formData.get("work_files")).split(",")
          : null,
        archived: fetcher.formData?.has("archived")
          ? Boolean(fetcher.formData.get("archived"))
          : false,
        partners: String(fetcher.formData?.get("partners")).split(","),
        topics: String(fetcher.formData?.get("topics")).split(",").map(Number),
        instagram_content:
          String(fetcher.formData?.get("instagram_content")) || null,
        sprints: String(fetcher.formData?.get("sprints"))
          ? String(fetcher.formData?.get("sprints")).split(",")
          : null,
      };

      return { ...action };
    });
  console.log({ actions });

  return { actions };
}
