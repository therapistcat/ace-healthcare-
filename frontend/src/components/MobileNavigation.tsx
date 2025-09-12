import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Home,
  Pill,
  DollarSign,
  FileText,
  Users,
  Stethoscope,
  Settings,
  Heart
} from 'lucide-react';

interface MobileNavigationProps {
  userRole: 'patient' | 'family' | 'doctor';
}

export default function MobileNavigation({ userRole }: MobileNavigationProps) {
  const location = useLocation();

  const getNavigationItems = () => {
    switch (userRole) {
      case 'patient':
        return [
          { path: '/dashboard', icon: Home, label: 'Home', badge: null },
          { path: '/medications', icon: Pill, label: 'Medications', badge: '3' },
          { path: '/finance', icon: DollarSign, label: 'Finance', badge: null },
          { path: '/reports', icon: FileText, label: 'Reports', badge: '2' },
          { path: '/settings', icon: Settings, label: 'Settings', badge: null }
        ];
      case 'family':
        return [
          { path: '/dashboard', icon: Home, label: 'Home', badge: null },
          { path: '/alerts', icon: Heart, label: 'Alerts', badge: '1' },
          { path: '/patients', icon: Users, label: 'Patients', badge: null },
          { path: '/settings', icon: Settings, label: 'Settings', badge: null }
        ];
      case 'doctor':
        return [
          { path: '/dashboard', icon: Home, label: 'Home', badge: null },
          { path: '/patients', icon: Users, label: 'Patients', badge: '12' },
          { path: '/appointments', icon: Stethoscope, label: 'Appointments', badge: '5' },
          { path: '/settings', icon: Settings, label: 'Settings', badge: null }
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      <div className="bg-white border-t border-border shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full flex flex-col items-center gap-1 h-auto py-2 px-2 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="relative">
                      <item.icon className="w-5 h-5" />
                      {item.badge && (
                        <Badge 
                          className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </Button>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}