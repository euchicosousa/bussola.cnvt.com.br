import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "database";
import type { DateRange } from "react-day-picker";
import type { Tables } from "types";
// Theme types now handled by remix-themes

declare global {
  type Partner = Tables<"partners">;
  type Person = Tables<"people">;
  type Category = Tables<"categories">;
  type State = Tables<"states">;
  type Priority = Tables<"priorities">;
  type Action = Tables<"actions">;
  type Area = Tables<"areas">;
  type Sprint = Tables<"sprints">;
  type Celebration = Tables<"celebrations">;
  type Topic = Tables<"topics">;
  type Sow = Tables<"sow">;

  type HandleActionsDataType = {
    [key: string]: string | number | null | string[] | boolean | number[];
  };

  type ORDER_ACTIONS_BY = "date" | "title" | "state" | "priority";

  type ActionFull = Action & {
    state: State;
    category: Category;
    priority: Priority;
    partner: Partner;
  };

  type RootType = {
    theme: string | null;
    env: {
      SUPABASE_URL: string;
      SUPABASE_KEY: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_UPLOAD_PRESET: string;
    };
  };

  type DashboardRootType = {
    url: URL;
    partners: Partner[];
    people: Person[];
    categories: Category[];
    states: State[];
    person: Person;
    user: User;
    priorities: Priority[];
    areas: Area[];
    sprints: Sprint[];
    celebrations: Celebration[];
    topics: Topic[];
  };

  type ActionChart = { category: string; date: string; state: string };

  type DashboardIndexType = {
    actions: Action[];
    lateActions: Action[];
    actionsChart: ActionChart[];
  };

  type DashboardPartnerType = {
    actions: Action[];
    actionsChart: ActionChart[];
    partner: Partner;
    person: Person;
  };

  type RawAction = {
    title: string;
    description: string | null;
    // partner?: string;
    category: string;
    state: string;
    date: Date;
    instagram_date: Date;
    user_id: string;
    responsibles: string[];
    color: string;
    time: number;
    partners: string[];
    topics?: number[] | null;
  };

  type GenericItem = {
    id: string;
    slug: string;
    title: string;
    href?: string;
    onSelect?: () => void;
  };

  type ORDER = "state" | "priority" | "time";
  type PRIORITIES = "low" | "mid" | "high";

  type THEME = "dark" | "light";

  type ContextType = {
    showFeed: boolean;
    setShowFeed: React.Dispatch<React.SetStateAction<boolean>>;
    editingAction: string | null;
    setEditingAction: React.Dispatch<React.SetStateAction<string | null>>;
    handleFeedToggle?: (show: boolean) => void;
    isTransitioning: boolean;
    setTransitioning: React.Dispatch<React.SetStateAction<boolean>>;
    stateFilter: State;
    setStateFilter: React.Dispatch<React.SetStateAction<State | undefined>>;
    categoryFilter: Category[];
    setCategoryFilter: React.Dispatch<
      React.SetStateAction<Category[] | undefined>
    >;
  };

  type Size = "xs" | "sm" | "md" | "lg" | "xl";

  type dateTimeFormat = { dateFormat?: 0 | 1 | 2 | 3 | 4; timeFormat?: 0 | 1 };
}
