import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "database";
import type { DateRange } from "react-day-picker";
import type { Theme, ThemeColor } from "~/lib/theme-provider";

declare global {
  type Partner = Database["public"]["Tables"]["partners"]["Row"];
  type Person = Database["public"]["Tables"]["people"]["Row"];
  type Category = Database["public"]["Tables"]["categories"]["Row"];
  type State = Database["public"]["Tables"]["states"]["Row"];
  type Priority = Database["public"]["Tables"]["priorities"]["Row"];
  type Action = Database["public"]["Tables"]["actions"]["Row"];
  type Area = Database["public"]["Tables"]["areas"]["Row"];
  type Sprint = Database["public"]["Tables"]["sprints"]["Row"];
  type Celebration = Database["public"]["Tables"]["celebrations"]["Row"];
  type Config = Database["public"]["Tables"]["config"]["Row"];
  type Topic = Database["public"]["Tables"]["topics"]["Row"];

  type Sow = Database["public"]["Enums"]["sow"];

  type HandleActionsDataType = {
    [key: string]: string | number | null | string[] | boolean | number[];
  };

  type ActionFull = Action & {
    state: State;
    category: Category;
    priority: Priority;
    partner: Partner;
  };

  type RootType = {
    theme: Theme | null;
    themeColor: ThemeColor | null;
    env: {
      SUPABASE_URL: string;
      SUPABASE_KEY: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_UPLOAD_PRESET: string;
      OPENAI_API_KEY: string;
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
    config: Config;
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
    partner?: string;
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

  user_id: string;

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
    isTransitioning: boolean;
    setTransitioning: React.Dispatch<React.SetStateAction<boolean>>;
    stateFilter: State;
    setStateFilter: React.Dispatch<React.SetStateAction<State | undefined>>;
  };

  type Size = "xs" | "sm" | "md" | "lg" | "xl";

  type dateTimeFormat = { dateFormat?: 0 | 1 | 2 | 3 | 4; timeFormat?: 0 | 1 };
}
