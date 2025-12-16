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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          ended_at: string | null
          id: string
          legacy_user_id: string
          message_count: number | null
          started_at: string | null
          visitor_id: string | null
          visitor_name: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          legacy_user_id: string
          message_count?: number | null
          started_at?: string | null
          visitor_id?: string | null
          visitor_name?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          legacy_user_id?: string
          message_count?: number | null
          started_at?: string | null
          visitor_id?: string | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_legacy_user_id_fkey"
            columns: ["legacy_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "legacy_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          audio_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          retrieved_response_ids: string[] | null
          role: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          retrieved_response_ids?: string[] | null
          role: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          retrieved_response_ids?: string[] | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_circles: {
        Row: {
          accepted_at: string | null
          access_level: string | null
          email: string | null
          id: string
          invited_at: string | null
          name: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          access_level?: string | null
          email?: string | null
          id?: string
          invited_at?: string | null
          name: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          access_level?: string | null
          email?: string | null
          id?: string
          invited_at?: string | null
          name?: string
          relationship?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_circles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_profiles: {
        Row: {
          beliefs: Json | null
          communication_style: Json | null
          confidence_score: number | null
          created_at: string | null
          emotional_patterns: Json | null
          humor_style: string | null
          id: string
          important_people: Json | null
          key_stories: string[] | null
          last_analyzed_at: string | null
          life_lessons: string[] | null
          system_prompt: string | null
          total_responses: number | null
          traits: Json | null
          updated_at: string | null
          user_id: string
          values: Json | null
        }
        Insert: {
          beliefs?: Json | null
          communication_style?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          emotional_patterns?: Json | null
          humor_style?: string | null
          id?: string
          important_people?: Json | null
          key_stories?: string[] | null
          last_analyzed_at?: string | null
          life_lessons?: string[] | null
          system_prompt?: string | null
          total_responses?: number | null
          traits?: Json | null
          updated_at?: string | null
          user_id: string
          values?: Json | null
        }
        Update: {
          beliefs?: Json | null
          communication_style?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          emotional_patterns?: Json | null
          humor_style?: string | null
          id?: string
          important_people?: Json | null
          key_stories?: string[] | null
          last_analyzed_at?: string | null
          life_lessons?: string[] | null
          system_prompt?: string | null
          total_responses?: number | null
          traits?: Json | null
          updated_at?: string | null
          user_id?: string
          values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "personality_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string | null
          display_name: string | null
          id: string
          legacy_activated_at: string | null
          legacy_status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          legacy_activated_at?: string | null
          legacy_status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          legacy_activated_at?: string | null
          legacy_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string
          created_at: string | null
          depth: string | null
          id: string
          question: string
        }
        Insert: {
          category: string
          created_at?: string | null
          depth?: string | null
          id?: string
          question: string
        }
        Update: {
          category?: string
          created_at?: string | null
          depth?: string | null
          id?: string
          question?: string
        }
        Relationships: []
      }
      responses: {
        Row: {
          audio_url: string | null
          content: string
          content_type: string | null
          created_at: string | null
          embedding: string | null
          extracted_emotions: string[] | null
          extracted_values: string[] | null
          id: string
          photo_url: string | null
          privacy: string | null
          question_id: string | null
          summary: string | null
          transcript: string | null
          updated_at: string | null
          user_id: string
          video_url: string | null
          word_count: number | null
        }
        Insert: {
          audio_url?: string | null
          content: string
          content_type?: string | null
          created_at?: string | null
          embedding?: string | null
          extracted_emotions?: string[] | null
          extracted_values?: string[] | null
          id?: string
          photo_url?: string | null
          privacy?: string | null
          question_id?: string | null
          summary?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id: string
          video_url?: string | null
          word_count?: number | null
        }
        Update: {
          audio_url?: string | null
          content?: string
          content_type?: string | null
          created_at?: string | null
          embedding?: string | null
          extracted_emotions?: string[] | null
          extracted_values?: string[] | null
          id?: string
          photo_url?: string | null
          privacy?: string | null
          question_id?: string | null
          summary?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_profiles: {
        Row: {
          created_at: string | null
          description: string | null
          elevenlabs_voice_id: string
          id: string
          is_primary: boolean | null
          name: string
          sample_count: number | null
          total_audio_duration: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          elevenlabs_voice_id: string
          id?: string
          is_primary?: boolean | null
          name: string
          sample_count?: number | null
          total_audio_duration?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          elevenlabs_voice_id?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          sample_count?: number | null
          total_audio_duration?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
