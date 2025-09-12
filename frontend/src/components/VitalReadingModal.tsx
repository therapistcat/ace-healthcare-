import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Scale, 
  Droplets,
  Plus,
  Clock,
  Save,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

interface VitalReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reading: any) => void;
}

const vitalTypes = [
  {
    id: 'blood_pressure',
    name: 'Blood Pressure',
    icon: Heart,
    unit: 'mmHg',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    fields: [
      { name: 'systolic', label: 'Systolic', placeholder: '120' },
      { name: 'diastolic', label: 'Diastolic', placeholder: '80' }
    ]
  },
  {
    id: 'heart_rate',
    name: 'Heart Rate',
    icon: Activity,
    unit: 'bpm',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    fields: [
      { name: 'value', label: 'Heart Rate', placeholder: '72' }
    ]
  },
  {
    id: 'blood_glucose',
    name: 'Blood Glucose',
    icon: Droplets,
    unit: 'mg/dL',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    fields: [
      { name: 'value', label: 'Glucose Level', placeholder: '95' }
    ]
  },
  {
    id: 'temperature',
    name: 'Body Temperature',
    icon: Thermometer,
    unit: '°F',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    fields: [
      { name: 'value', label: 'Temperature', placeholder: '98.6' }
    ]
  },
  {
    id: 'weight',
    name: 'Weight',
    icon: Scale,
    unit: 'kg',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    fields: [
      { name: 'value', label: 'Weight', placeholder: '70' }
    ]
  }
];

export default function VitalReadingModal({ isOpen, onClose, onSave }: VitalReadingModalProps) {
  const [selectedVital, setSelectedVital] = useState<typeof vitalTypes[0] | null>(null);
  const [readings, setReadings] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [takenAt, setTakenAt] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format for datetime-local input
  });

  const handleVitalSelect = (vital: typeof vitalTypes[0]) => {
    setSelectedVital(vital);
    setReadings({});
  };

  const handleReadingChange = (field: string, value: string) => {
    setReadings(prev => ({ ...prev, [field]: value }));
  };

  const getVitalStatus = (vitalId: string, readings: Record<string, string>) => {
    switch (vitalId) {
      case 'blood_pressure':
        const systolic = parseInt(readings.systolic);
        const diastolic = parseInt(readings.diastolic);
        if (!systolic || !diastolic) return null;
        
        if (systolic < 120 && diastolic < 80) return { status: 'Normal', color: 'text-green-600' };
        if (systolic < 130 && diastolic < 80) return { status: 'Elevated', color: 'text-yellow-600' };
        if (systolic < 140 || diastolic < 90) return { status: 'High Stage 1', color: 'text-orange-600' };
        return { status: 'High Stage 2', color: 'text-red-600' };
        
      case 'heart_rate':
        const hr = parseInt(readings.value);
        if (!hr) return null;
        if (hr >= 60 && hr <= 100) return { status: 'Normal', color: 'text-green-600' };
        if (hr < 60) return { status: 'Low', color: 'text-blue-600' };
        return { status: 'High', color: 'text-red-600' };
        
      case 'blood_glucose':
        const glucose = parseInt(readings.value);
        if (!glucose) return null;
        if (glucose < 100) return { status: 'Normal', color: 'text-green-600' };
        if (glucose < 126) return { status: 'Pre-diabetic', color: 'text-yellow-600' };
        return { status: 'Diabetic', color: 'text-red-600' };
        
      case 'temperature':
        const temp = parseFloat(readings.value);
        if (!temp) return null;
        if (temp >= 97 && temp <= 99) return { status: 'Normal', color: 'text-green-600' };
        if (temp < 97) return { status: 'Low', color: 'text-blue-600' };
        return { status: 'Fever', color: 'text-red-600' };
        
      default:
        return null;
    }
  };

  const handleSave = () => {
    if (!selectedVital) return;

    const reading = {
      id: Date.now().toString(),
      type: selectedVital.id,
      name: selectedVital.name,
      readings,
      notes,
      takenAt: new Date(takenAt),
      timestamp: new Date()
    };

    onSave(reading);
    toast.success('Vital reading saved! 📊', {
      description: `${selectedVital.name} recorded successfully`
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedVital(null);
    setReadings({});
    setNotes('');
    setTakenAt(new Date().toISOString().slice(0, 16));
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300);
  };

  const vitalStatus = selectedVital ? getVitalStatus(selectedVital.id, readings) : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Vital Reading
          </DialogTitle>
        </DialogHeader>

        {!selectedVital ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground">Select the vital sign you want to record:</p>
            
            <div className="grid grid-cols-1 gap-3">
              {vitalTypes.map((vital) => {
                const Icon = vital.icon;
                return (
                  <Card 
                    key={vital.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleVitalSelect(vital)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${vital.bgColor}`}>
                          <Icon className={`w-5 h-5 ${vital.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{vital.name}</p>
                          <p className="text-sm text-muted-foreground">Measured in {vital.unit}</p>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className={selectedVital.bgColor}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <selectedVital.icon className={`w-6 h-6 ${selectedVital.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedVital.name}</h3>
                    <p className="text-sm text-muted-foreground">Enter your reading</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {selectedVital.fields.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type="number"
                      placeholder={field.placeholder}
                      value={readings[field.name] || ''}
                      onChange={(e) => handleReadingChange(field.name, e.target.value)}
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                      {selectedVital.unit}
                    </span>
                  </div>
                </div>
              ))}

              {vitalStatus && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Status:</span>
                  <Badge className={`${vitalStatus.color} bg-transparent hover:bg-transparent`}>
                    {vitalStatus.status}
                  </Badge>
                </div>
              )}

              <div>
                <Label htmlFor="takenAt">Time Taken</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="takenAt"
                    type="datetime-local"
                    value={takenAt}
                    onChange={(e) => setTakenAt(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedVital(null)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!selectedVital.fields.every(field => readings[field.name])}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Reading
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}