interface VehicleInfo {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim?: string;
  engine?: string;
  displacement?: string;
  cylinders?: string;
  fuel_type?: string;
  vehicle_type?: string;
  body_class?: string;
  drive_type?: string;
  transmission?: string;
  manufacturer?: string;
  plant_city?: string;
  plant_state?: string;
  valid: boolean;
  cached_at?: string;
  error?: string;
}

class VinService {
  private cache = new Map<string, VehicleInfo>();

  async decodeVin(vin: string, accessToken?: string): Promise<VehicleInfo> {
    // Validate VIN format first
    if (!this.isValidVinFormat(vin)) {
      return {
        vin: vin.toUpperCase(),
        year: '',
        make: '',
        model: '',
        valid: false,
        error: 'Invalid VIN format'
      };
    }

    const normalizedVin = vin.toUpperCase();

    // Check local cache first
    const cached = this.cache.get(normalizedVin);
    if (cached) {
      return cached;
    }

    try {
      // If we have an access token, use the backend service (preferred)
      if (accessToken) {
        const { projectId } = await import('../utils/supabase/info');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7/decode-vin`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ vin: normalizedVin })
          }
        );

        if (!response.ok) {
          throw new Error(`Backend VIN decode failed: ${response.status}`);
        }

        const vehicleData = await response.json();
        
        // Cache the result locally
        this.cache.set(normalizedVin, vehicleData);
        
        return vehicleData;
      } else {
        // Fallback to direct NHTSA API call (frontend only)
        return await this.directNhtsaCall(normalizedVin);
      }
    } catch (error) {
      console.error('VIN decode error:', error);
      
      // Fallback to direct NHTSA call if backend fails
      if (accessToken) {
        console.log('Backend failed, trying direct NHTSA API call...');
        return await this.directNhtsaCall(normalizedVin);
      }
      
      const errorInfo: VehicleInfo = {
        vin: normalizedVin,
        year: '',
        make: '',
        model: '',
        valid: false,
        error: 'Failed to decode VIN'
      };

      // Cache error result for 5 minutes to avoid repeated API calls
      setTimeout(() => this.cache.delete(normalizedVin), 5 * 60 * 1000);
      this.cache.set(normalizedVin, errorInfo);

      return errorInfo;
    }
  }

  private async directNhtsaCall(vin: string): Promise<VehicleInfo> {
    try {
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      );

      if (!response.ok) {
        throw new Error('NHTSA API error');
      }

      const data = await response.json();
      const results = data.Results || [];

      // Extract vehicle information
      const vehicleInfo: VehicleInfo = {
        vin,
        year: this.findResult(results, 'Model Year'),
        make: this.findResult(results, 'Make'),
        model: this.findResult(results, 'Model'),
        trim: this.findResult(results, 'Trim'),
        engine: this.findResult(results, 'Engine Model'),
        displacement: this.findResult(results, 'Displacement (L)'),
        cylinders: this.findResult(results, 'Engine Number of Cylinders'),
        fuel_type: this.findResult(results, 'Fuel Type - Primary'),
        vehicle_type: this.findResult(results, 'Vehicle Type'),
        body_class: this.findResult(results, 'Body Class'),
        drive_type: this.findResult(results, 'Drive Type'),
        transmission: this.findResult(results, 'Transmission Style'),
        manufacturer: this.findResult(results, 'Manufacturer Name'),
        plant_city: this.findResult(results, 'Plant City'),
        plant_state: this.findResult(results, 'Plant State'),
        valid: false,
        cached_at: new Date().toISOString()
      };

      // Determine if VIN decode was successful
      vehicleInfo.valid = !!(vehicleInfo.year && vehicleInfo.make && vehicleInfo.model);
      if (!vehicleInfo.valid) {
        vehicleInfo.error = 'Vehicle information not found';
      }

      // Cache the result
      this.cache.set(vin, vehicleInfo);

      return vehicleInfo;
    } catch (error) {
      console.error('Direct NHTSA call error:', error);
      throw error;
    }
  }

  private findResult(results: any[], variableName: string): string {
    const result = results.find(r => r.Variable === variableName);
    return result?.Value || '';
  }

  private isValidVinFormat(vin: string): boolean {
    // VIN must be exactly 17 characters, alphanumeric, excluding I, O, Q
    const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinPattern.test(vin.toUpperCase());
  }

  // Get cached vehicle by VIN
  async getCachedVehicle(vin: string, accessToken: string): Promise<VehicleInfo | null> {
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7/vehicles/${vin.toUpperCase()}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get cached vehicle: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get cached vehicle error:', error);
      return null;
    }
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
  }
}

export const vinService = new VinService();
export type { VehicleInfo };