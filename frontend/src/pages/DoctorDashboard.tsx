import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import {
  Users,
  Calendar,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Phone,
  Video,
  FileText,
  Pill,
  Heart,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const patients = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    age: 68,
    condition: 'Diabetes Type 2',
    riskScore: 25,
    adherence: 87,
    lastVisit: new Date('2024-01-10'),
    nextAppointment: new Date('2024-01-25'),
    avatar: '👨‍🦳',
    status: 'stable',
    vitals: { bp: '125/82', hr: 74, glucose: 110 }
  },
  {
    id: '2',
    name: 'Sunita Devi',
    age: 62,
    condition: 'Hypertension',
    riskScore: 45,
    adherence: 92,
    lastVisit: new Date('2024-01-12'),
    nextAppointment: new Date('2024-01-28'),
    avatar: '👩‍🦳',
    status: 'monitoring',
    vitals: { bp: '140/90', hr: 78, glucose: 95 }
  },
  {
    id: '3',
    name: 'Amit Singh',
    age: 45,
    condition: 'High Cholesterol',
    riskScore: 35,
    adherence: 78,
    lastVisit: new Date('2024-01-08'),
    nextAppointment: new Date('2024-01-30'),
    avatar: '👨‍💼',
    status: 'attention',
    vitals: { bp: '130/85', hr: 82, glucose: 102 }
  }
];

const adherenceData = [
  { date: '1/1', overall: 85, rajesh: 87, sunita: 92, amit: 78 },
  { date: '1/2', overall: 87, rajesh: 89, sunita: 90, amit: 82 },
  { date: '1/3', overall: 89, rajesh: 91, sunita: 94, amit: 83 },
  { date: '1/4', overall: 86, rajesh: 88, sunita: 91, amit: 79 },
  { date: '1/5', overall: 88, rajesh: 90, sunita: 93, amit: 81 },
  { date: '1/6', overall: 90, rajesh: 92, sunita: 95, amit: 83 },
  { date: '1/7', overall: 89, rajesh: 87, sunita: 92, amit: 88 }
];

const riskDistribution = [
  { category: 'Low Risk', count: 25, color: '#10b981' },
  { category: 'Moderate', count: 18, color: '#f59e0b' },
  { category: 'High Risk', count: 8, color: '#ef4444' },
  { category: 'Critical', count: 2, color: '#7c2d12' }
];

const upcomingAppointments = [
  {
    id: '1',
    patientName: 'Rajesh Kumar',
    time: '10:00 AM',
    date: new Date('2024-01-25'),
    type: 'Follow-up',
    duration: 30,
    avatar: '👨‍🦳'
  },
  {
    id: '2',
    patientName: 'Sunita Devi',
    time: '11:30 AM',
    date: new Date('2024-01-25'),
    type: 'Consultation',
    duration: 45,
    avatar: '👩‍🦳'
  },
  {
    id: '3',
    patientName: 'Amit Singh',
    time: '2:00 PM',
    date: new Date('2024-01-25'),
    type: 'Check-up',
    duration: 30,
    avatar: '👨‍💼'
  }
];

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'monitoring': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'attention': return 'bg-red-100 text-red-700 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 25) return 'text-green-600 bg-green-100';
    if (score <= 50) return 'text-yellow-600 bg-yellow-100';
    if (score <= 75) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
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
          <h1 className="text-2xl md:text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your patients' health</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Video className="w-4 h-4" />
            Telemedicine
          </Button>
          <Button className="gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-xl font-bold">{patients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Adherence</p>
                  <p className="text-xl font-bold">
                    {Math.round(patients.reduce((acc, p) => acc + p.adherence, 0) / patients.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-xl font-bold">
                    {patients.filter(p => p.riskScore > 40).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Appts</p>
                  <p className="text-xl font-bold">{upcomingAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-6">
          {/* Patient List */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{patient.avatar}</div>
                        <div>
                          <h3 className="font-semibold">{patient.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {patient.age} years • {patient.condition}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Last visit: {patient.lastVisit.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Risk Score</div>
                          <Badge className={getRiskColor(patient.riskScore)}>
                            {patient.riskScore}/100
                          </Badge>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Adherence</div>
                          <div className="font-bold text-green-600">{patient.adherence}%</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">BP</div>
                          <div className="font-medium">{patient.vitals.bp}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Status</div>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Records
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Patient Adherence Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={adherenceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[70, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={3} name="Overall" />
                      <Line type="monotone" dataKey="rajesh" stroke="#10b981" strokeWidth={2} name="Rajesh" />
                      <Line type="monotone" dataKey="sunita" stroke="#f59e0b" strokeWidth={2} name="Sunita" />
                      <Line type="monotone" dataKey="amit" stroke="#ef4444" strokeWidth={2} name="Amit" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Risk Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={riskDistribution} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Risk Score</p>
                    <p className="text-2xl font-bold">31.2</p>
                  </div>
                  <div className="text-green-600">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">↓ 5.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Treatment Success</p>
                    <p className="text-2xl font-bold">89%</p>
                  </div>
                  <div className="text-green-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">↑ 2.3% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient Satisfaction</p>
                    <p className="text-2xl font-bold">4.8/5</p>
                  </div>
                  <div className="text-green-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">↑ 0.2 from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Appointments</CardTitle>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {upcomingAppointments.length} scheduled
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{appointment.avatar}</div>
                      <div>
                        <h3 className="font-semibold">{appointment.patientName}</h3>
                        <div className="text-sm text-muted-foreground">
                          {appointment.type} • {appointment.duration} minutes
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium">{appointment.time}</div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.date.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Video className="w-4 h-4 mr-1" />
                          Video
                        </Button>
                        <Button size="sm">
                          Start
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}