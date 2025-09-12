import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Heart,
  Search,
  Star,
  Phone,
  Video,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const doctors = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Cardiologist',
    rating: 4.8,
    experience: '15+ years',
    location: 'Apollo Hospital, Delhi',
    avatar: '👨‍⚕️',
    consultationFee: 800,
    nextAvailable: 'Today',
    languages: ['Hindi', 'English']
  },
  {
    id: '2',
    name: 'Dr. Priya Sharma',
    specialty: 'Endocrinologist',
    rating: 4.9,
    experience: '12+ years',
    location: 'Max Hospital, Mumbai',
    avatar: '👩‍⚕️',
    consultationFee: 900,
    nextAvailable: 'Tomorrow',
    languages: ['Hindi', 'English', 'Marathi']
  },
  {
    id: '3',
    name: 'Dr. Amit Patel',
    specialty: 'General Physician',
    rating: 4.7,
    experience: '10+ years',
    location: 'Fortis Hospital, Bangalore',
    avatar: '👨‍⚕️',
    consultationFee: 600,
    nextAvailable: 'Today',
    languages: ['Hindi', 'English', 'Gujarati']
  },
  {
    id: '4',
    name: 'Dr. Sneha Reddy',
    specialty: 'Dermatologist',
    rating: 4.6,
    experience: '8+ years',
    location: 'KIMS Hospital, Hyderabad',
    avatar: '👩‍⚕️',
    consultationFee: 700,
    nextAvailable: 'Tomorrow',
    languages: ['Hindi', 'English', 'Telugu']
  }
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM'
];

export default function AppointmentBookingModal({ isOpen, onClose }: AppointmentBookingModalProps) {
  const [step, setStep] = useState<'search' | 'doctor' | 'datetime' | 'details' | 'confirmation'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<typeof doctors[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState<'in-person' | 'video'>('in-person');
  const [patientDetails, setPatientDetails] = useState({
    reason: '',
    symptoms: '',
    urgency: 'normal'
  });

  const specialties = ['Cardiology', 'Endocrinology', 'General Medicine', 'Dermatology', 'Orthopedics', 'Pediatrics'];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchQuery === '' || 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || 
      doctor.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = () => {
    toast.success('Appointment booked successfully! 📅', {
      description: `${selectedDoctor?.name} on ${selectedDate?.toLocaleDateString()} at ${selectedTime}`
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep('search');
    setSearchQuery('');
    setSelectedSpecialty('');
    setSelectedDoctor(null);
    setSelectedDate(new Date());
    setSelectedTime('');
    setConsultationType('in-person');
    setPatientDetails({ reason: '', symptoms: '', urgency: 'normal' });
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Book Appointment
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div>
                  <Label htmlFor="search">Search Doctors</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialty">Filter by Specialty</Label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All specialties</SelectItem>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty.toLowerCase()}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent 
                      className="p-4"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setStep('doctor');
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{doctor.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{doctor.name}</h3>
                              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>{doctor.experience}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{doctor.rating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-green-600">
                                {doctor.nextAvailable}
                              </Badge>
                              <p className="text-sm font-medium mt-1">₹{doctor.consultationFee}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{doctor.location}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'doctor' && selectedDoctor && (
            <motion.div
              key="doctor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{selectedDoctor.avatar}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-medium">{selectedDoctor.name}</h3>
                      <p className="text-muted-foreground">{selectedDoctor.specialty}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{selectedDoctor.rating}</span>
                          <span className="text-sm text-muted-foreground">(127 reviews)</span>
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{selectedDoctor.experience}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{selectedDoctor.location}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">Languages:</p>
                        <div className="flex gap-2 mt-1">
                          {selectedDoctor.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₹{selectedDoctor.consultationFee}</p>
                      <p className="text-sm text-muted-foreground">Consultation Fee</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <Label>Consultation Type</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Card 
                    className={`cursor-pointer transition-all ${consultationType === 'in-person' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setConsultationType('in-person')}
                  >
                    <CardContent className="p-4 text-center">
                      <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="font-medium">In-Person</p>
                      <p className="text-sm text-muted-foreground">Visit clinic</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${consultationType === 'video' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setConsultationType('video')}
                  >
                    <CardContent className="p-4 text-center">
                      <Video className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="font-medium">Video Call</p>
                      <p className="text-sm text-muted-foreground">Online consultation</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('search')} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep('datetime')} className="flex-1">
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'datetime' && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Select Date</Label>
                  <div className="mt-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-80 overflow-y-auto">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="justify-start"
                      >
                        <Clock className="w-3 h-3 mr-2" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('doctor')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep('details')} 
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Routine checkup, chest pain, follow-up..."
                  value={patientDetails.reason}
                  onChange={(e) => setPatientDetails({...patientDetails, reason: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="symptoms">Symptoms (if any)</Label>
                <Input
                  id="symptoms"
                  placeholder="Describe your symptoms..."
                  value={patientDetails.symptoms}
                  onChange={(e) => setPatientDetails({...patientDetails, symptoms: e.target.value})}
                />
              </div>

              <div>
                <Label>Urgency Level</Label>
                <Select value={patientDetails.urgency} onValueChange={(value) => 
                  setPatientDetails({...patientDetails, urgency: value})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('datetime')} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep('confirmation')} className="flex-1">
                  Review Booking
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'confirmation' && selectedDoctor && selectedDate && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Appointment Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Doctor:</span>
                      <span className="font-medium">{selectedDoctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Specialty:</span>
                      <span>{selectedDoctor.specialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{selectedDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{consultationType.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Consultation Fee:</span>
                      <span className="font-medium">₹{selectedDoctor.consultationFee}</span>
                    </div>
                    
                    {patientDetails.reason && (
                      <div className="pt-2 border-t">
                        <p className="text-muted-foreground text-sm">Reason:</p>
                        <p className="text-sm">{patientDetails.reason}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleBookAppointment} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}