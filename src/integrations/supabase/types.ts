export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string;
          file_type: string | null;
          file_url: string | null;
          id: string;
          name: string;
          project_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          file_type?: string | null;
          file_url?: string | null;
          id?: string;
          name: string;
          project_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          file_type?: string | null;
          file_url?: string | null;
          id?: string;
          name?: string;
          project_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      call_sheets: {
        Row: {
          cast_calls: Json;
          contacts: Json;
          created_at: string;
          crew_calls: Json;
          id: string;
          location_details: string | null;
          project_id: string;
          shoot_date: string | null;
          shooting_notes: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cast_calls?: Json;
          contacts?: Json;
          created_at?: string;
          crew_calls?: Json;
          id?: string;
          location_details?: string | null;
          project_id: string;
          shoot_date?: string | null;
          shooting_notes?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cast_calls?: Json;
          contacts?: Json;
          created_at?: string;
          crew_calls?: Json;
          id?: string;
          location_details?: string | null;
          project_id?: string;
          shoot_date?: string | null;
          shooting_notes?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "call_sheets_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      characters: {
        Row: {
          age: string | null;
          character_arc: string | null;
          costume_notes: string | null;
          created_at: string;
          description: string | null;
          external_conflict: string | null;
          goal: string | null;
          id: string;
          internal_conflict: string | null;
          motivation: string | null;
          name: string;
          project_id: string;
          relationships: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          age?: string | null;
          character_arc?: string | null;
          costume_notes?: string | null;
          created_at?: string;
          description?: string | null;
          external_conflict?: string | null;
          goal?: string | null;
          id?: string;
          internal_conflict?: string | null;
          motivation?: string | null;
          name: string;
          project_id: string;
          relationships?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          age?: string | null;
          character_arc?: string | null;
          costume_notes?: string | null;
          created_at?: string;
          description?: string | null;
          external_conflict?: string | null;
          goal?: string | null;
          id?: string;
          internal_conflict?: string | null;
          motivation?: string | null;
          name?: string;
          project_id?: string;
          relationships?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "characters_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      costumes: {
        Row: {
          actor_name: string | null;
          character_name: string | null;
          created_at: string;
          id: string;
          name: string;
          notes: string | null;
          project_id: string;
          responsible_person: string | null;
          scene_references: string | null;
          size: string | null;
          status: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          actor_name?: string | null;
          character_name?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          notes?: string | null;
          project_id: string;
          responsible_person?: string | null;
          scene_references?: string | null;
          size?: string | null;
          status?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          actor_name?: string | null;
          character_name?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          project_id?: string;
          responsible_person?: string | null;
          scene_references?: string | null;
          size?: string | null;
          status?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "costumes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      export_history: {
        Row: {
          created_at: string;
          export_type: string;
          file_name: string | null;
          id: string;
          project_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          export_type: string;
          file_name?: string | null;
          id?: string;
          project_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          export_type?: string;
          file_name?: string | null;
          id?: string;
          project_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "export_history_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      locations: {
        Row: {
          address: string | null;
          contact_info: string | null;
          created_at: string;
          id: string;
          name: string;
          notes: string | null;
          permission_status: string | null;
          photo_url: string | null;
          project_id: string;
          scene_references: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          contact_info?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          notes?: string | null;
          permission_status?: string | null;
          photo_url?: string | null;
          project_id: string;
          scene_references?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: string | null;
          contact_info?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          permission_status?: string | null;
          photo_url?: string | null;
          project_id?: string;
          scene_references?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      production_notes: {
        Row: {
          category: string | null;
          content: string | null;
          created_at: string;
          id: string;
          project_id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          project_id: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          project_id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "production_notes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          last_login: string;
          name: string | null;
          photo_url: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
          last_login?: string;
          name?: string | null;
          photo_url?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          last_login?: string;
          name?: string | null;
          photo_url?: string | null;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          created_at: string;
          id: string;
          invited_email: string;
          member_user_id: string | null;
          owner_id: string;
          project_id: string;
          role: Database["public"]["Enums"]["app_role"];
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          invited_email: string;
          member_user_id?: string | null;
          owner_id: string;
          project_id: string;
          role?: Database["public"]["Enums"]["app_role"];
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          invited_email?: string;
          member_user_id?: string | null;
          owner_id?: string;
          project_id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          archived: boolean;
          author: string | null;
          created_at: string;
          genre: string | null;
          id: string;
          logline: string | null;
          status: string;
          synopsis: string | null;
          title: string;
          updated_at: string;
          user_id: string;
          version: string;
        };
        Insert: {
          archived?: boolean;
          author?: string | null;
          created_at?: string;
          genre?: string | null;
          id?: string;
          logline?: string | null;
          status?: string;
          synopsis?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
          version?: string;
        };
        Update: {
          archived?: boolean;
          author?: string | null;
          created_at?: string;
          genre?: string | null;
          id?: string;
          logline?: string | null;
          status?: string;
          synopsis?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
          version?: string;
        };
        Relationships: [];
      };
      props_costumes: {
        Row: {
          availability_status: string | null;
          created_at: string;
          department: string | null;
          id: string;
          name: string;
          project_id: string;
          quantity: number;
          responsible_person: string | null;
          scene_references: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          availability_status?: string | null;
          created_at?: string;
          department?: string | null;
          id?: string;
          name: string;
          project_id: string;
          quantity?: number;
          responsible_person?: string | null;
          scene_references?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          availability_status?: string | null;
          created_at?: string;
          department?: string | null;
          id?: string;
          name?: string;
          project_id?: string;
          quantity?: number;
          responsible_person?: string | null;
          scene_references?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "props_costumes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      scripts: {
        Row: {
          content: Json;
          created_at: string;
          id: string;
          project_id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content?: Json;
          created_at?: string;
          id?: string;
          project_id: string;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          id?: string;
          project_id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scripts_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      shooting_schedule: {
        Row: {
          cast_members: string | null;
          created_at: string;
          day_night: string | null;
          description: string | null;
          id: string;
          int_ext: string | null;
          location: string | null;
          pages: string | null;
          position: number;
          project_id: string;
          scene: string | null;
          shoot_date: string | null;
          shoot_day: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cast_members?: string | null;
          created_at?: string;
          day_night?: string | null;
          description?: string | null;
          id?: string;
          int_ext?: string | null;
          location?: string | null;
          pages?: string | null;
          position?: number;
          project_id: string;
          scene?: string | null;
          shoot_date?: string | null;
          shoot_day?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cast_members?: string | null;
          created_at?: string;
          day_night?: string | null;
          description?: string | null;
          id?: string;
          int_ext?: string | null;
          location?: string | null;
          pages?: string | null;
          position?: number;
          project_id?: string;
          scene?: string | null;
          shoot_date?: string | null;
          shoot_day?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shooting_schedule_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      story_beats: {
        Row: {
          act: string | null;
          created_at: string;
          description: string | null;
          id: string;
          notes: string | null;
          position: number;
          project_id: string;
          structure_type: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          act?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          notes?: string | null;
          position?: number;
          project_id: string;
          structure_type?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          act?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          notes?: string | null;
          position?: number;
          project_id?: string;
          structure_type?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "story_beats_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      storyboards: {
        Row: {
          angle_description: string | null;
          camera_angle: string | null;
          camera_movement: string | null;
          created_at: string;
          id: string;
          image_url: string | null;
          lens_info: string | null;
          notes: string | null;
          position: number;
          project_id: string;
          scene_link: string | null;
          shot_description: string | null;
          shot_number: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          angle_description?: string | null;
          camera_angle?: string | null;
          camera_movement?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          lens_info?: string | null;
          notes?: string | null;
          position?: number;
          project_id: string;
          scene_link?: string | null;
          shot_description?: string | null;
          shot_number?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          angle_description?: string | null;
          camera_angle?: string | null;
          camera_movement?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          lens_info?: string | null;
          notes?: string | null;
          position?: number;
          project_id?: string;
          scene_link?: string | null;
          shot_description?: string | null;
          shot_number?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "storyboards_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_access_project: { Args: { _project_id: string }; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_project_owner: { Args: { _project_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "admin" | "producer" | "director" | "writer" | "assistant_director";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "producer", "director", "writer", "assistant_director"],
    },
  },
} as const;
