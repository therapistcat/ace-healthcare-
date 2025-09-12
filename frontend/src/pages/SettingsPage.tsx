import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import {
  User,
  Bell,
  Smartphone,
  Languages,
  Shield,
  Heart,
  Phone,
  Mail,
  Camera,
  Trash2,
  LogOut,
  HelpCircle,
  Settings,
  Link,
  Globe,
  Eye,
  Lock
} from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage } = useApp();
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    age: 45,
    gender: 'male',
    emergencyContact: '+91 98765 12345',
    address: '123 Health Street, Wellness City'
  });

  const [notifications, setNotifications] = useState({
    medication: true,
    appointments: true,
    vitals: true,
    family: true,
    marketing: false,
    sms: true,
    email: true,
    push: true
  });

  const [privacy, setPrivacy] = useState({
    shareWithFamily: true,
    shareWithDoctors: true,
    dataForResearch: false,
    locationTracking: true
  });

  const [devices] = useState([
    {
      id: '1',
      name: 'Apple Watch Series 9',
      type: 'smartwatch',
      status: 'connected',
      lastSync: new Date('2024-01-15T10:30:00')
    },
    {
      id: '2',
      name: 'Glucometer OneTouch',
      type: 'glucose_meter',
      status: 'connected',
      lastSync: new Date('2024-01-15T08:15:00')
    },
    {
      id: '3',
      name: 'BP Monitor Omron',
      type: 'bp_monitor',
      status: 'disconnected',
      lastSync: new Date('2024-01-12T18:45:00')
    }
  ]);

  const handleProfileUpdate = () => {
    toast.success('Profile updated successfully!');
  };

  const handleNotificationUpdate = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success('Notification preferences updated');
  };

  const handlePrivacyUpdate = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast.success('Privacy settings updated');
  };

  const handleDeviceConnect = (deviceId: string) => {
    toast.success('Device connection initiated');
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartwatch': return '⌚';
      case 'glucose_meter': return '🩸';
      case 'bp_monitor': return '🩺';
      default: return '📱';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'connected' 
      ? 'bg-green-100 text-green-700 hover:bg-green-100'
      : 'bg-red-100 text-red-700 hover:bg-red-100';
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
        
        <Button variant="outline" onClick={handleLogout} className="gap-2 text-red-600 hover:text-red-700">
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xl">JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button className="gap-2">
                      <Camera className="w-4 h-4" />
                      Change Photo
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={profile.gender} onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input
                      id="emergency"
                      value={profile.emergencyContact}
                      onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="hi">🇮🇳 हिंदी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Types */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Notification Types</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Medication Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded when it's time to take medication</p>
                    </div>
                    <Switch
                      checked={notifications.medication}
                      onCheckedChange={(checked) => handleNotificationUpdate('medication', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Notifications for upcoming appointments</p>
                    </div>
                    <Switch
                      checked={notifications.appointments}
                      onCheckedChange={(checked) => handleNotificationUpdate('appointments', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Vitals Alerts</Label>
                      <p className="text-sm text-muted-foreground">Alerts for abnormal vital signs</p>
                    </div>
                    <Switch
                      checked={notifications.vitals}
                      onCheckedChange={(checked) => handleNotificationUpdate('vitals', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Family Notifications</Label>
                      <p className="text-sm text-muted-foreground">Updates for family members</p>
                    </div>
                    <Switch
                      checked={notifications.family}
                      onCheckedChange={(checked) => handleNotificationUpdate('family', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">Health tips and product updates</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationUpdate('marketing', checked)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Delivery Methods */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Delivery Methods</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <Label>Push Notifications</Label>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationUpdate('push', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <Label>SMS</Label>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => handleNotificationUpdate('sms', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <Label>Email</Label>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationUpdate('email', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Data Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Share with Family Members</Label>
                      <p className="text-sm text-muted-foreground">Allow linked family members to view your health data</p>
                    </div>
                    <Switch
                      checked={privacy.shareWithFamily}
                      onCheckedChange={(checked) => handlePrivacyUpdate('shareWithFamily', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Share with Healthcare Providers</Label>
                      <p className="text-sm text-muted-foreground">Allow your doctors to access your health records</p>
                    </div>
                    <Switch
                      checked={privacy.shareWithDoctors}
                      onCheckedChange={(checked) => handlePrivacyUpdate('shareWithDoctors', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Anonymous Data for Research</Label>
                      <p className="text-sm text-muted-foreground">Help improve healthcare through anonymized data sharing</p>
                    </div>
                    <Switch
                      checked={privacy.dataForResearch}
                      onCheckedChange={(checked) => handlePrivacyUpdate('dataForResearch', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Location Tracking</Label>
                      <p className="text-sm text-muted-foreground">For emergency services and nearby pharmacy/hospital suggestions</p>
                    </div>
                    <Switch
                      checked={privacy.locationTracking}
                      onCheckedChange={(checked) => handlePrivacyUpdate('locationTracking', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Data Management</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button variant="outline" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View My Data
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Connected Devices
                  </CardTitle>
                  <Button className="gap-2">
                    <Link className="w-4 h-4" />
                    Add Device
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getDeviceIcon(device.type)}</div>
                        <div>
                          <h3 className="font-semibold">{device.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            Last sync: {device.lastSync.toLocaleDateString()} {device.lastSync.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(device.status)}>
                          {device.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeviceConnect(device.id)}
                        >
                          {device.status === 'connected' ? 'Sync' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Help & Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                      <HelpCircle className="w-6 h-6" />
                      <span>Help Center</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                      <Phone className="w-6 h-6" />
                      <span>Contact Support</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                      <Mail className="w-6 h-6" />
                      <span>Email Us</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                      <Globe className="w-6 h-6" />
                      <span>Community</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>App Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated</span>
                    <span className="font-medium">January 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Support</span>
                    <span className="font-medium">24/7 Available</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">Terms of Service</Button>
                    <Button variant="outline" className="w-full">Privacy Policy</Button>
                    <Button variant="outline" className="w-full">About HealthCare+</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}