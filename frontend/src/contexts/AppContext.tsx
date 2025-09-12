import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import healthcareService from '../services/healthcareService';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'family' | 'doctor';
  language: 'en' | 'hi';
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: Date;
  adherence: number;
  pillCount: number;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface VitalSigns {
  bloodPressure: { systolic: number; diastolic: number; date: Date };
  heartRate: { value: number; date: Date };
  bloodSugar: { value: number; date: Date };
  weight: { value: number; date: Date };
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  medications: Medication[];
  setMedications: (medications: Medication[]) => void;
  vitals: VitalSigns[];
  setVitals: (vitals: VitalSigns[]) => void;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app with session data
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const session = await healthcareService.getSession();
      
      if (session?.user) {
        // Set user from session
        const sessionUser = session.user;
        setUser({
          id: sessionUser.id,
          name: sessionUser.name || sessionUser.user_metadata?.name || 'Demo User',
          email: sessionUser.email,
          role: sessionUser.role || sessionUser.user_metadata?.role || 'patient',
          language: sessionUser.language || sessionUser.user_metadata?.language || 'en'
        });
        setLanguage(sessionUser.language || sessionUser.user_metadata?.language || 'en');
        
        // Try to get profile, but don't fail if backend is unavailable
        try {
          const { profile } = await healthcareService.getProfile();
          if (profile && !profile.demo) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              language: profile.language || 'en'
            });
            setLanguage(profile.language || 'en');
          }
        } catch (error) {
          console.warn('Failed to load user profile from backend, using session data:', error);
        }
        
        // Load user data
        await refreshData();
      } else {
        // No session, use mock data for demo
        loadMockData();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    // Fallback to mock data for demo purposes
    setMedications([
      {
        id: '1',
        name: 'Metformin 500mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        nextDose: new Date(Date.now() + 2 * 60 * 60 * 1000),
        adherence: 85,
        pillCount: 28,
        userId: 'demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Lisinopril 10mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        nextDose: new Date(Date.now() + 8 * 60 * 60 * 1000),
        adherence: 92,
        pillCount: 25,
        userId: 'demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);

    setVitals([
      {
        bloodPressure: { systolic: 120, diastolic: 80, date: new Date() },
        heartRate: { value: 72, date: new Date() },
        bloodSugar: { value: 95, date: new Date() },
        weight: { value: 70, date: new Date() }
      }
    ]);

    setNotifications([
      {
        id: '1',
        type: 'reminder',
        title: 'Medication Due',
        message: 'Time to take your Metformin',
        timestamp: new Date(),
        read: false
      },
      {
        id: '2',
        type: 'alert',
        title: 'High Blood Pressure',
        message: 'Your blood pressure reading is above normal',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false
      }
    ]);
  };

  const refreshData = async () => {
    try {
      // Load medications
      const { medications: userMedications } = await healthcareService.getMedications();
      if (userMedications) {
        setMedications(userMedications.map((med: any) => ({
          ...med,
          nextDose: new Date(med.nextDose)
        })));
      }

      // Load notifications (with fallback)
      try {
        const { notifications: userNotifications } = await healthcareService.getNotifications();
        if (userNotifications) {
          setNotifications(userNotifications.map((notif: any) => ({
            ...notif,
            timestamp: new Date(notif.createdAt || notif.timestamp)
          })));
        }
      } catch (error) {
        console.warn('Failed to load notifications:', error);
        // Use default notifications if backend fails
        setNotifications([
          {
            id: '1',
            type: 'reminder',
            title: 'Medication Due',
            message: 'Time to take your Metformin',
            timestamp: new Date(),
            read: false
          }
        ]);
      }

      // Load health data would go here
      // const { healthData } = await healthcareService.getHealthData();
      
    } catch (error) {
      console.warn('Failed to refresh data, using local/demo data:', error);
      // Don't clear existing data on error, just log it
    }
  };

  const value = {
    user,
    setUser,
    language,
    setLanguage,
    medications,
    setMedications,
    vitals,
    setVitals,
    notifications,
    setNotifications,
    isLoading,
    refreshData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};