import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Heart,
  Activity,
  Shield,
  Bell,
  Calendar,
  TrendingDown,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const patientData = {
  id: '1',
  name: 'Rajesh Kumar',
  relationship: 'Father',
  age: 68,
  avatar: '👨‍🦳',
  lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  location: 'Home',
  riskScore: 25,
  adherence: 87,
  medications: 3,
  vitals: {
    bloodPressure: { value: '125/82', status: 'normal', trend: 'stable' },
    heartRate: { value: '74', status: 'normal', trend: 'up' },
    bloodSugar: { value: '110', status: 'high', trend: 'down' }
  }
};

const adherenceData = [
  { date: '1/1', adherence: 85 },
  { date: '1/2', adherence: 90 },
  { date: '1/3', adherence: 88 },
  { date: '1/4', adherence: 85 },
  { date: '1/5', adherence: 92 },
  { date: '1/6', adherence: 87 },
  { date: '1/7', adherence: 89 }
];

const recentAlerts = [
  {
    id: '1',
    type: 'missed_medication',
    title: 'Missed Medication',
    message: 'Rajesh missed his evening Metformin dose',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    severity: 'high',
    read: false
  },
  {
    id: '2',
    type: 'vitals_alert',
    title: 'Blood Sugar High',
    message: 'Blood sugar reading 150 mg/dL (above normal)',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'medium',
    read: false
  },
  {
    id: '3',
    type: 'appointment',
    title: 'Appointment Reminder',
    message: 'Dr. Singh appointment tomorrow at 2:00 PM',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    severity: 'low',
    read: true
  }
];

export default function FamilyDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diffMs = currentTime.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Family Care Dashboard</h1>
          <p className="text-muted-foreground">Monitor and support your loved ones' health</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Phone className="w-4 h-4" />
            Emergency Call
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Patient Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{patientData.avatar}</div>
                <div>
                  <h2 className="text-2xl font-bold">{patientData.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>{patientData.relationship} • {patientData.age} years</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{patientData.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Last seen: {formatTimeAgo(patientData.lastSeen)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:max-w-md ml-auto">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{patientData.adherence}%</div>
                  <div className="text-xs text-muted-foreground">Adherence</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{patientData.medications}</div>
                  <div className="text-xs text-muted-foreground">Medications</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{patientData.riskScore}</div>
                  <div className="text-xs text-muted-foreground">Risk Score</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">2</div>
                  <div className="text-xs text-muted-foreground">Alerts</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Alerts
                </CardTitle>
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  {recentAlerts.filter(alert => !alert.read).length} new
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Alert className={`${getSeverityColor(alert.severity)} ${!alert.read ? 'border-l-4' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-semibold">{alert.title}</span>
                          {!alert.read && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                        </div>
                        <AlertDescription className="text-sm">
                          {alert.message}
                        </AlertDescription>
                        <div className="text-xs text-muted-foreground mt-2">
                          {formatTimeAgo(alert.timestamp)}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Mark as read
                      </Button>
                    </div>
                  </Alert>
                </motion.div>
              ))}
              
              <Button variant="outline" className="w-full">
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Vitals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Current Vitals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Blood Pressure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(patientData.vitals.bloodPressure.status)}>
                      {patientData.vitals.bloodPressure.value}
                    </Badge>
                    {getTrendIcon(patientData.vitals.bloodPressure.trend)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="text-sm">Heart Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(patientData.vitals.heartRate.status)}>
                      {patientData.vitals.heartRate.value} bpm
                    </Badge>
                    {getTrendIcon(patientData.vitals.heartRate.trend)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full" />
                    <span className="text-sm">Blood Sugar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(patientData.vitals.bloodSugar.status)}>
                      {patientData.vitals.bloodSugar.value} mg/dL
                    </Badge>
                    {getTrendIcon(patientData.vitals.bloodSugar.trend)}
                  </div>
                </div>
              </div>
              
              <Button className="w-full" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                View Detailed History
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Adherence Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Medication Adherence Trend
              </CardTitle>
              <div className="flex items-center gap-2">
                <Progress value={patientData.adherence} className="w-20" />
                <span className="text-sm font-medium">{patientData.adherence}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={adherenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Adherence']} />
                <Line 
                  type="monotone" 
                  dataKey="adherence" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Phone className="w-6 h-6 text-green-600" />
                <span>Call Patient</span>
              </Button>
              
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" />
                <span>Send Reminder</span>
              </Button>
              
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                <span>Book Appointment</span>
              </Button>
              
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Shield className="w-6 h-6 text-orange-600" />
                <span>Emergency</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}