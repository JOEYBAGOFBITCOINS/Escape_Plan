import { projectId, publicAnonKey } from '../utils/supabase/info';
import { isDemoMode } from '../utils/supabase/demo-config';

export interface FuelEntry {
  id: string;
  user_id: string;
  stock_number: string;
  vin?: string;
  gallons: number;
  price_per_gallon: number;
  total_amount: number;
  odometer: number;
  fuel_type: string;
  location: string;
  latitude?: number;
  longitude?: number;
  receipt_photo?: string;
  vin_photo?: string;
  notes?: string;
  timestamp: string;
  created_at: string;
}

export interface CreateFuelEntryData {
  stock_number: string;
  vin?: string;
  gallons: number;
  price_per_gallon: number;
  total_amount: number;
  odometer: number;
  fuel_type: string;
  location: string;
  latitude?: number;
  longitude?: number;
  receipt_photo?: string;
  vin_photo?: string;
  notes?: string;
  timestamp: string;
}

class FuelService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7`;

  async createFuelEntry(
    entryData: CreateFuelEntryData, 
    token: string
  ): Promise<{ entry: FuelEntry } | { error: string }> {
    // Demo mode - simulate creating entry
    if (isDemoMode || projectId === 'your-project-id-here') {
      const mockEntry: FuelEntry = {
        id: `demo-entry-${Date.now()}`,
        user_id: token.replace('demo-token-', ''),
        stock_number: entryData.stock_number,
        vin: entryData.vin,
        gallons: entryData.gallons,
        price_per_gallon: entryData.price_per_gallon,
        total_amount: entryData.total_amount,
        odometer: entryData.odometer,
        fuel_type: entryData.fuel_type,
        location: entryData.location,
        latitude: entryData.latitude,
        longitude: entryData.longitude,
        receipt_photo: entryData.receipt_photo,
        vin_photo: entryData.vin_photo,
        notes: entryData.notes,
        timestamp: entryData.timestamp,
        created_at: new Date().toISOString()
      };

      return { entry: mockEntry };
    }

    try {
      const response = await fetch(`${this.baseUrl}/fuel-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entryData)
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to create fuel entry' };
      }

      return { entry: data };
    } catch (error) {
      console.error('Create fuel entry error:', error);
      return { error: 'Network error while creating fuel entry' };
    }
  }

  async getFuelEntries(token: string): Promise<{ entries: FuelEntry[] } | { error: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/fuel-entries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to fetch fuel entries' };
      }

      return { entries: data };
    } catch (error) {
      console.error('Get fuel entries error:', error);
      return { error: 'Network error while fetching fuel entries' };
    }
  }

  async uploadPhoto(
    photo: File, 
    token: string
  ): Promise<{ url: string; path: string } | { error: string }> {
    try {
      const formData = new FormData();
      formData.append('photo', photo);

      const response = await fetch(`${this.baseUrl}/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to upload photo' };
      }

      return { url: data.url, path: data.path };
    } catch (error) {
      console.error('Upload photo error:', error);
      return { error: 'Network error while uploading photo' };
    }
  }
}

export const fuelService = new FuelService();