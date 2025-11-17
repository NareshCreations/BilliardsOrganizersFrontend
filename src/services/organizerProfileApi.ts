// Organizer Profile API Service
import { makeAuthenticatedRequest, ApiResponse } from './api';
import authService from './authService';

const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  return '/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export interface OrganizerProfile {
  id: string;
  userId: string;
  orgId: string;
  organizationName: string;
  contactPersonName?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  isPremium: boolean;
  profilePicUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerProfileResponse extends ApiResponse<OrganizerProfile> {}

export interface UpdateOrganizerProfileRequest {
  organizationName?: string;
  contactPersonName?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  profilePicture?: File;
  profilePicUrl?: string;
}

class OrganizerProfileApiService {
  /**
   * Get organizer profile
   */
  async getProfile(): Promise<OrganizerProfileResponse> {
    try {
      const url = `${API_BASE_URL}/organizers/profile`;
      console.log('📥 Fetching organizer profile from:', url);
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: OrganizerProfileResponse = await response.json();
      console.log('✅ Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching organizer profile:', error);
      throw error;
    }
  }

  /**
   * Update organizer profile
   * Supports multipart/form-data for file uploads
   */
  async updateProfile(profileData: UpdateOrganizerProfileRequest): Promise<OrganizerProfileResponse> {
    try {
      const url = `${API_BASE_URL}/organizers/profile`;
      console.log('📤 Updating organizer profile:', url);
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      if (profileData.organizationName) {
        formData.append('organizationName', profileData.organizationName);
      }
      if (profileData.contactPersonName) {
        formData.append('contactPersonName', profileData.contactPersonName);
      }
      if (profileData.phone) {
        formData.append('phone', profileData.phone);
      }
      if (profileData.email) {
        formData.append('email', profileData.email);
      }
      if (profileData.city) {
        formData.append('city', profileData.city);
      }
      if (profileData.state) {
        formData.append('state', profileData.state);
      }
      if (profileData.country) {
        formData.append('country', profileData.country);
      }
      if (profileData.profilePicture) {
        formData.append('profilePicture', profileData.profilePicture);
      }
      if (profileData.profilePicUrl) {
        formData.append('profilePicUrl', profileData.profilePicUrl);
      }

      // Get auth headers (but don't set Content-Type - browser will set it with boundary for FormData)
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.log('❌ Unauthorized request (401), token expired or invalid');
        authService.logout();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: OrganizerProfileResponse = await response.json();
      console.log('✅ Profile updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating organizer profile:', error);
      throw error;
    }
  }
}

const organizerProfileApiService = new OrganizerProfileApiService();
export default organizerProfileApiService;

