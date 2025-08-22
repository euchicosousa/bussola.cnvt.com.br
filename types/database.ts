export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.0.2 (a4e00ff)"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          archived: boolean | null
          caption: string | null
          category: string
          color: string
          created_at: string
          date: string
          description: string | null
          files: string[] | null
          id: string
          instagram_caption: string | null
          instagram_content: string | null
          instagram_date: string
          partners: string[]
          priority: string
          responsibles: string[]
          state: string
          time: number
          title: string
          topics: number[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          caption?: string | null
          category: string
          color?: string
          created_at: string
          date: string
          description?: string | null
          files?: string[] | null
          id?: string
          instagram_caption?: string | null
          instagram_content?: string | null
          instagram_date: string
          partners: string[]
          priority: string
          responsibles: string[]
          state: string
          time?: number
          title: string
          topics?: number[] | null
          updated_at: string
          user_id?: string
        }
        Update: {
          archived?: boolean | null
          caption?: string | null
          category?: string
          color?: string
          created_at?: string
          date?: string
          description?: string | null
          files?: string[] | null
          id?: string
          instagram_caption?: string | null
          instagram_content?: string | null
          instagram_date?: string
          partners?: string[]
          priority?: string
          responsibles?: string[]
          state?: string
          time?: number
          title?: string
          topics?: number[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          created_at: string
          id: string
          order: number
          role: number
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          order: number
          role?: number
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          order?: number
          role?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          area: string
          color: string
          created_at: string
          id: string
          order: number
          shortcut: string
          slug: string
          title: string
        }
        Insert: {
          area: string
          color?: string
          created_at?: string
          id?: string
          order: number
          shortcut?: string
          slug: string
          title: string
        }
        Update: {
          area?: string
          color?: string
          created_at?: string
          id?: string
          order?: number
          shortcut?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      celebrations: {
        Row: {
          created_at: string
          date: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      config: {
        Row: {
          created_at: string
          creative: string
          id: number
          theme: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creative: string
          id?: number
          theme?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creative?: string
          id?: number
          theme?: string
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          archived: boolean
          colors: string[]
          context: string | null
          created_at: string
          id: string
          img: string | null
          instagram_caption_tail: string | null
          short: string
          slug: string
          sow: Database["public"]["Enums"]["sow"]
          title: string
          users_ids: string[]
        }
        Insert: {
          archived?: boolean
          colors: string[]
          context?: string | null
          created_at?: string
          id?: string
          img?: string | null
          instagram_caption_tail?: string | null
          short: string
          slug: string
          sow?: Database["public"]["Enums"]["sow"]
          title: string
          users_ids: string[]
        }
        Update: {
          archived?: boolean
          colors?: string[]
          context?: string | null
          created_at?: string
          id?: string
          img?: string | null
          instagram_caption_tail?: string | null
          short?: string
          slug?: string
          sow?: Database["public"]["Enums"]["sow"]
          title?: string
          users_ids?: string[]
        }
        Relationships: []
      }
      people: {
        Row: {
          admin: boolean
          areas: string[]
          created_at: string
          email: string | null
          id: string
          image: string | null
          initials: string
          name: string
          short: string
          surname: string
          user_id: string
          visible: boolean
        }
        Insert: {
          admin?: boolean
          areas: string[]
          created_at?: string
          email?: string | null
          id?: string
          image?: string | null
          initials: string
          name: string
          short: string
          surname: string
          user_id: string
          visible?: boolean
        }
        Update: {
          admin?: boolean
          areas?: string[]
          created_at?: string
          email?: string | null
          id?: string
          image?: string | null
          initials?: string
          name?: string
          short?: string
          surname?: string
          user_id?: string
          visible?: boolean
        }
        Relationships: []
      }
      priorities: {
        Row: {
          created_at: string
          id: string
          order: number
          shortcut: string
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          order: number
          shortcut?: string
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          order?: number
          shortcut?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      sprints: {
        Row: {
          action_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          color: string
          created_at: string
          foreground: string
          id: string
          order: number
          shortcut: string
          slug: string
          title: string
        }
        Insert: {
          color?: string
          created_at?: string
          foreground?: string
          id?: string
          order: number
          shortcut?: string
          slug: string
          title: string
        }
        Update: {
          color?: string
          created_at?: string
          foreground?: string
          id?: string
          order?: number
          shortcut?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          color: string
          created_at: string
          foreground: string
          id: number
          partner_slug: string
          title: string
        }
        Insert: {
          color: string
          created_at?: string
          foreground: string
          id?: number
          partner_slug: string
          title: string
        }
        Update: {
          color?: string
          created_at?: string
          foreground?: string
          id?: number
          partner_slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_partner_slug_fkey"
            columns: ["partner_slug"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      sow: "marketing" | "socialmedia" | "demand"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      sow: ["marketing", "socialmedia", "demand"],
    },
  },
} as const
