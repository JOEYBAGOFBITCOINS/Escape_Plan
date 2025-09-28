import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

const supabaseUrl = `https://${projectId}.supabase.co`

export const supabase = createClient(supabaseUrl, publicAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'porter'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'porter'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'porter'
          updated_at?: string
        }
      }
      fuel_entries: {
        Row: {
          id: string
          user_id: string
          stock_number: string
          vin: string | null
          gallons: number
          price_per_gallon: number
          total_amount: number
          odometer: number
          fuel_type: string
          location: string
          latitude: number | null
          longitude: number | null
          receipt_photo: string | null
          vin_photo: string | null
          notes: string | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stock_number: string
          vin?: string | null
          gallons: number
          price_per_gallon: number
          total_amount: number
          odometer: number
          fuel_type: string
          location: string
          latitude?: number | null
          longitude?: number | null
          receipt_photo?: string | null
          vin_photo?: string | null
          notes?: string | null
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stock_number?: string
          vin?: string | null
          gallons?: number
          price_per_gallon?: number
          total_amount?: number
          odometer?: number
          fuel_type?: string
          location?: string
          latitude?: number | null
          longitude?: number | null
          receipt_photo?: string | null
          vin_photo?: string | null
          notes?: string | null
          timestamp?: string
        }
      }
    }
  }
}