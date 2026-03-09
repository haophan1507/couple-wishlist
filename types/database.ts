export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      couple_profile: {
        Row: {
          id: string;
          person_one_name: string;
          person_two_name: string;
          love_start_date: string | null;
          person_one_birthday: string | null;
          person_two_birthday: string | null;
          person_one_favorite: string | null;
          person_two_favorite: string | null;
          person_one_hobby: string | null;
          person_two_hobby: string | null;
          story: string | null;
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_one_name: string;
          person_two_name: string;
          love_start_date?: string | null;
          person_one_birthday?: string | null;
          person_two_birthday?: string | null;
          person_one_favorite?: string | null;
          person_two_favorite?: string | null;
          person_one_hobby?: string | null;
          person_two_hobby?: string | null;
          story?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          person_one_name?: string;
          person_two_name?: string;
          love_start_date?: string | null;
          person_one_birthday?: string | null;
          person_two_birthday?: string | null;
          person_one_favorite?: string | null;
          person_two_favorite?: string | null;
          person_one_hobby?: string | null;
          person_two_hobby?: string | null;
          story?: string | null;
          cover_image_url?: string | null;
          updated_at?: string;
        };
      };
      gift_history_items: {
        Row: {
          id: string;
          recipient_owner_type: "me" | "honey";
          gift_name: string;
          giver_name: string;
          received_date: string;
          special_day_id: string | null;
          note: string | null;
          photo_url: string | null;
          wishlist_item_id: string | null;
          wishlist_item_title: string | null;
          status: "received" | "thanked" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipient_owner_type: "me" | "honey";
          gift_name: string;
          giver_name: string;
          received_date: string;
          special_day_id?: string | null;
          note?: string | null;
          photo_url?: string | null;
          wishlist_item_id?: string | null;
          wishlist_item_title?: string | null;
          status?: "received" | "thanked" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          recipient_owner_type?: "me" | "honey";
          gift_name?: string;
          giver_name?: string;
          received_date?: string;
          special_day_id?: string | null;
          note?: string | null;
          photo_url?: string | null;
          wishlist_item_id?: string | null;
          wishlist_item_title?: string | null;
          status?: "received" | "thanked" | "archived";
          updated_at?: string;
        };
      };
      gallery_items: {
        Row: {
          id: string;
          image_url: string;
          caption: string | null;
          memory_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          caption?: string | null;
          memory_date?: string | null;
          created_at?: string;
        };
        Update: {
          image_url?: string;
          caption?: string | null;
          memory_date?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          role: "admin" | "viewer";
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          role?: "admin" | "viewer";
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          avatar_url?: string | null;
          role?: "admin" | "viewer";
        };
      };
      special_days: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          date: string;
          type: "birthday" | "anniversary" | "relationship" | "holiday" | "other";
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          date: string;
          type?: "birthday" | "anniversary" | "relationship" | "holiday" | "other";
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          date?: string;
          type?: "birthday" | "anniversary" | "relationship" | "holiday" | "other";
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          owner_type: "me" | "honey";
          title: string;
          description: string | null;
          image_url: string | null;
          product_url: string | null;
          price_min: number | null;
          price_max: number | null;
          category: string | null;
          priority: "low" | "medium" | "high";
          note: string | null;
          status: "available" | "gifted";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_type: "me" | "honey";
          title: string;
          description?: string | null;
          image_url?: string | null;
          product_url?: string | null;
          price_min?: number | null;
          price_max?: number | null;
          category?: string | null;
          priority?: "low" | "medium" | "high";
          note?: string | null;
          status?: "available" | "gifted";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_type?: "me" | "honey";
          title?: string;
          description?: string | null;
          image_url?: string | null;
          product_url?: string | null;
          price_min?: number | null;
          price_max?: number | null;
          category?: string | null;
          priority?: "low" | "medium" | "high";
          note?: string | null;
          status?: "available" | "gifted";
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
