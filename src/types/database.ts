export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type UserRole = 'customer' | 'admin'

export interface Database {
  public: {
    Enums: Record<string, never>
    Functions: Record<string, never>
    CompositeTypes: Record<string, never>
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          line_uid: string | null
          line_display_name: string | null
          line_picture_url: string | null
          role: UserRole
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      services: {
        Row: {
          id: string
          name: string
          name_en: string | null
          description: string | null
          duration: number
          price: number | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      time_slots: {
        Row: {
          id: string
          slot_date: string
          start_time: string
          end_time: string
          capacity: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['time_slots']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['time_slots']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          booking_no: string
          user_id: string | null
          guest_name: string | null
          guest_phone: string | null
          guest_line_uid: string | null
          service_id: string
          slot_id: string | null
          slot_date: string
          start_time: string
          end_time: string
          note: string | null
          status: BookingStatus
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'booking_no' | 'created_at' | 'updated_at'>
        Update: Partial<Pick<Database['public']['Tables']['bookings']['Row'], 'status' | 'note'>>
      }
      seo_settings: {
        Row: {
          id: string
          page_key: string
          title: string | null
          description: string | null
          og_title: string | null
          og_description: string | null
          og_image: string | null
          keywords: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['seo_settings']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['seo_settings']['Insert']>
      }
    }
    Views: {
      slot_availability: {
        Row: {
          id: string
          slot_date: string
          start_time: string
          end_time: string
          capacity: number
          is_active: boolean
          booked_count: number
          available: number
        }
      }
    }
  }
}
