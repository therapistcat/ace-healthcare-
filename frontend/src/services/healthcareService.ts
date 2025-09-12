// Healthcare API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'patient' | 'family' | 'doctor';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  language?: 'en' | 'hi';
  isActive: boolean;
  familyConnections?: FamilyConnection[];
  notificationPreferences?: NotificationPreferences;
  privacySettings?: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  healthAlerts: boolean;
  familyUpdates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'family' | 'private';
  shareHealthData: boolean;
  allowFamilyAccess: boolean;
  dataRetention: number;
}

export interface FamilyConnection {
  _id: string;
  userId: string | User;
  relationship: string;
  permissions: {
    viewMedications: boolean;
    viewVitals: boolean;
    viewAppointments: boolean;
    receiveAlerts: boolean;
    viewProfile: boolean;
  };
  connectedAt: string;
}

export interface Medication {
  _id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  pillCount: number;
  nextDose: string;
  isActive: boolean;
  isPaused: boolean;
  adherence: number;
  takenDoses: number;
  totalDoses: number;
  missedDoses: number;
  notes?: string;
  instructions?: string[];
  medicationType?: string;
  strength?: string;
  manufacturer?: string;
  expiryDate?: string;
  reminderSettings: {
    enabled: boolean;
    times: string[];
    beforeMeal: boolean;
    afterMeal: boolean;
  };
  lowStockThreshold: number;
  prescribedBy?: {
    doctorName: string;
    doctorId: string;
    prescriptionDate: string;
  };
}

export interface VitalSigns {
  _id: string;
  userId: string;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    category: string;
  };
  heartRate?: {
    value: number;
    category: string;
  };
  bloodSugar?: {
    value: number;
    unit: string;
    category: string;
    testType: string;
  };
  weight?: {
    value: number;
    unit: string;
    bmi?: number;
    bmiCategory?: string;
  };
  height?: {
    value: number;
    unit: string;
  };
  temperature?: {
    value: number;
    unit: string;
  };
  recordedAt: string;
  recordedBy: string;
  notes?: string;
}

export interface Appointment {
  _id: string;
  patientId: string;
  doctorId?: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  reason: string;
  symptoms: string[];
  status: string;
  priority: string;
  location: {
    type: string;
    address?: string;
    room?: string;
  };
  telemedicine?: {
    platform: string;
    meetingLink?: string;
    meetingId?: string;
  };
  outcome?: string;
  billing?: {
    amount: number;
    currency: string;
    status: string;
    insuranceCovered: boolean;
  };
}

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  scheduledFor?: string;
  expiresAt?: string;
  relatedData?: any;
  actions?: Array<{
    label: string;
    action: string;
    style: string;
  }>;
}

export interface HealthReport {
  _id: string;
  userId: string;
  name: string;
  type: string;
  category: string;
  provider: {
    name: string;
    address?: string;
    phone?: string;
  };
  reportDate: string;
  testDate?: string;
  files: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  content: any;
  notes?: string;
  tags: string[];
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// HTTP Client
class HttpClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Healthcare Service Class
class HealthcareService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient(API_BASE_URL);
  }

  // Authentication Methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      email,
      password,
    });
    
    if (response.success && response.data.token) {
      this.client.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    age?: number;
    gender?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/register', userData);
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/verify-otp', {
      email,
      otp,
    });
    
    if (response.success && response.data.token) {
      this.client.setToken(response.data.token);
    }
    
    return response;
  }

  async resendOTP(email: string): Promise<ApiResponse<any>> {
    return this.client.post<ApiResponse<any>>('/auth/resend-otp', { email });
  }

  async logout(): Promise<ApiResponse<any>> {
    const response = await this.client.post<ApiResponse<any>>('/auth/logout');
    this.client.clearToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.client.get<ApiResponse<{ user: User }>>('/auth/me');
  }

  // User Methods
  async getUserProfile(): Promise<ApiResponse<{ profile: User }>> {
    return this.client.get<ApiResponse<{ profile: User }>>('/users/profile');
  }

  async updateUserProfile(updates: Partial<User>): Promise<ApiResponse<{ profile: User }>> {
    return this.client.put<ApiResponse<{ profile: User }>>('/users/profile', updates);
  }

  async getFamilyConnections(): Promise<ApiResponse<{ familyConnections: FamilyConnection[] }>> {
    return this.client.get<ApiResponse<{ familyConnections: FamilyConnection[] }>>('/users/family');
  }

  async addFamilyConnection(data: {
    userId: string;
    relationship: string;
    permissions?: any;
  }): Promise<ApiResponse<{ connection: FamilyConnection }>> {
    return this.client.post<ApiResponse<{ connection: FamilyConnection }>>('/users/family/connect', data);
  }

  // Medication Methods
  async getMedications(params?: {
    page?: number;
    limit?: number;
    active?: string;
    userId?: string;
  }): Promise<PaginatedResponse<{ medications: Medication[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/medications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get<PaginatedResponse<{ medications: Medication[] }>>(endpoint);
  }

  async getMedication(id: string): Promise<ApiResponse<{ medication: Medication }>> {
    return this.client.get<ApiResponse<{ medication: Medication }>>(`/medications/${id}`);
  }

  async addMedication(medicationData: Partial<Medication>): Promise<ApiResponse<{ medication: Medication }>> {
    return this.client.post<ApiResponse<{ medication: Medication }>>('/medications', medicationData);
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<ApiResponse<{ medication: Medication }>> {
    return this.client.put<ApiResponse<{ medication: Medication }>>(`/medications/${id}`, updates);
  }

  async deleteMedication(id: string): Promise<ApiResponse<any>> {
    return this.client.delete<ApiResponse<any>>(`/medications/${id}`);
  }

  async recordMedicationTaken(id: string, data?: {
    verified?: boolean;
    method?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.client.post<ApiResponse<any>>(`/medications/${id}/take`, data);
  }

  async getMedicationStats(params?: {
    userId?: string;
    period?: string;
  }): Promise<ApiResponse<{ stats: any }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/medications/stats/adherence${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get<ApiResponse<{ stats: any }>>>(endpoint);
  }

  // Health/Vitals Methods
  async getVitalSigns(params?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<PaginatedResponse<{ vitals: VitalSigns[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/health/vitals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get<PaginatedResponse<{ vitals: VitalSigns[] }>>(endpoint);
  }

  async addVitalSigns(vitalData: Partial<VitalSigns>): Promise<ApiResponse<{ vital: VitalSigns }>> {
    return this.client.post<ApiResponse<{ vital: VitalSigns }>>('/health/vitals', vitalData);
  }

  async getHealthReports(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<PaginatedResponse<{ reports: HealthReport[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/health/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get<PaginatedResponse<{ reports: HealthReport[] }>>(endpoint);
  }

  async getHealthReport(id: string): Promise<ApiResponse<{ report: HealthReport }>> {
    return this.client.get<ApiResponse<{ report: HealthReport }>>(`/health/reports/${id}`);
  }

  async uploadHealthReport(reportData: Partial<HealthReport>): Promise<ApiResponse<{ report: HealthReport }>> {
    return this.client.post<ApiResponse<{ report: HealthReport }>>('/health/reports', reportData);
  }

  async getHealthStats(params?: {
    userId?: string;
    period?: string;
  }): Promise<ApiResponse<{ stats: any }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/health/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get<ApiResponse<{ stats: any }>>>(endpoint);
  }

  // Appointment Methods
  async getAppointments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    specialty?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<PaginatedResponse<{ appointments: Appointment[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get<PaginatedResponse<{ appointments: Appointment[] }>>(endpoint);
  }

  async getAppointment(id: string): Promise<ApiResponse<{ appointment: Appointment }>> {
    return this.client.get<ApiResponse<{ appointment: Appointment }>>(`/appointments/${id}`);
  }

  async bookAppointment(appointmentData: Partial<Appointment>): Promise<ApiResponse<{ appointment: Appointment }>> {
    return this.client.post<ApiResponse<{ appointment: Appointment }>>('/appointments', appointmentData);
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<ApiResponse<{ appointment: Appointment }>> {
    return this.client.put<ApiResponse<{ appointment: Appointment }>>(`/appointments/${id}`, updates);
  }

  async cancelAppointment(id: string, reason?: string): Promise<ApiResponse<any>> {
    return this.client.delete<ApiResponse<any>>(`/appointments/${id}`);
  }

  // Notification Methods
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    priority?: string;
    read?: string;
    userId?: string;
  }): Promise<PaginatedResponse<{ notifications: Notification[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get<PaginatedResponse<{ notifications: Notification[] }>>(endpoint);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<{ notification: Notification }>> {
    return this.client.put<ApiResponse<{ notification: Notification }>>(`/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    return this.client.put<ApiResponse<any>>('/notifications/read-all');
  }

  async deleteNotification(id: string): Promise<ApiResponse<any>> {
    return this.client.delete<ApiResponse<any>>(`/notifications/${id}`);
  }

  // Family Dashboard Methods (for family role users)
  async getFamilyDashboard(): Promise<ApiResponse<{ familyMembers: any[] }>> {
    return this.client.get<ApiResponse<{ familyMembers: any[] }>>('/family/dashboard');
  }

  async getFamilyPatientData(patientId: string): Promise<ApiResponse<any>> {
    return this.client.get<ApiResponse<any>>(`/family/patient/${patientId}`);
  }

  async sendFamilyAlert(patientId: string, data: {
    type: string;
    message: string;
    priority?: string;
  }): Promise<ApiResponse<{ notification: Notification }>> {
    return this.client.post<ApiResponse<{ notification: Notification }>>(`/family/patient/${patientId}/alert`, data);
  }

  async getFamilyActivity(params?: {
    patientId?: string;
    limit?: number;
  }): Promise<ApiResponse<{ activities: any[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/family/activity${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get<ApiResponse<{ activities: any[] }>>(endpoint);
  }

  async getFamilyStats(): Promise<ApiResponse<{ stats: any }>> {
    return this.client.get<ApiResponse<{ stats: any }>>('/family/stats');
  }
}

// Create and export service instance
const healthcareService = new HealthcareService();
export default healthcareService;

// Export types for use in components
export type {
  ApiResponse,
  PaginatedResponse,
  NotificationPreferences,
  PrivacySettings,
  User,
  FamilyConnection,
  Medication,
  VitalSigns,
  Appointment,
  Notification,
  HealthReport
};
