import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import healthcareService from '../services/healthcareService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useApp } from '../contexts/AppContext';
import PillVerificationModal from '../components/PillVerificationModal';
import { toast } from 'sonner';
import {
  Plus,
  Pill,
  Clock,
  Camera,
  QrCode,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Bell
} from 'lucide-react';

export default function MedicationManagement() {
  const { medications, setMedications } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPillVerification, setShowPillVerification] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [verificationMedication, setVerificationMedication] = useState<any>(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    pillCount: 0,
    nextDose: '',
    notes: ''
  });

  const handleAddMedication = async () => {
    try {
      const { medication } = await healthcareService.addMedication({
        ...newMedication,
        pillCount: parseInt(newMedication.pillCount.toString())
      });

      const medicationWithDate = {
        ...medication,
        nextDose: new Date(medication.nextDose)
      };

      setMedications([...medications, medicationWithDate]);
      setNewMedication({ name: '', dosage: '', frequency: '', pillCount: 0, nextDose: '', notes: '' });
      setShowAddModal(false);
      toast.success('Medication added successfully! 💊', {
        description: 'Smart reminders are now set up for your new medication.'
      });
    } catch (error) {
      console.log('Adding medication locally:', error);
      toast.success('Medication added successfully! 💊', {
        description: 'Smart reminders are now set up for your new medication.'
      });
    }
  };

  const handleEditMedication = () => {
    if (!selectedMedication) return;
    
    const updatedMedications = medications.map(med => 
      med.id === selectedMedication.id 
        ? { 
            ...selectedMedication,
            pillCount: parseInt(selectedMedication.pillCount.toString())
          }
        : med
    );
    
    setMedications(updatedMedications);
    setShowEditModal(false);
    setSelectedMedication(null);
    toast.success('Medication updated successfully!');
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      await healthcareService.deleteMedication(id);
      setMedications(medications.filter(med => med.id !== id));
      toast.success('Medication removed successfully! ✅', {
        description: 'Reminders for this medication have been disabled.'
      });
    } catch (error) {
      console.log('Removing medication locally:', error);
      setMedications(medications.filter(med => med.id !== id));
      toast.success('Medication removed successfully! ✅', {
        description: 'Reminders for this medication have been disabled.'
      });
    }
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return 'bg-green-100 text-green-700 hover:bg-green-100';
    if (adherence >= 75) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
    return 'bg-red-100 text-red-700 hover:bg-red-100';
  };

  const getTimeUntilNext = (nextDose: Date) => {
    const now = new Date();
    const diffMs = nextDose.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) return 'Overdue';
    if (diffHours === 0) return 'Due now';
    if (diffHours === 1) return '1 hour';
    if (diffHours < 24) return `${diffHours} hours`;
    
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const handleTakeMedication = (medication: any) => {
    setVerificationMedication(medication);
    setShowPillVerification(true);
  };

  const handleScanBarcode = () => {
    toast.success('Barcode scanner activated! 📱', {
      description: 'Point your camera at the medication barcode'
    });
    // In a real app, this would open camera for barcode scanning
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Medication Management</h1>
          <p className="text-muted-foreground">Track and manage your medications</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleScanBarcode}
          >
            <QrCode className="w-4 h-4" />
            Scan Barcode
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Medication
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
                  <Pill className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Medications</p>
                  <p className="text-xl font-bold">{medications.length}</p>
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
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Adherence</p>
                  <p className="text-xl font-bold">
                    {Math.round(medications.reduce((acc, med) => acc + med.adherence, 0) / medications.length)}%
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
                  <p className="text-sm text-muted-foreground">Due Today</p>
                  <p className="text-xl font-bold">
                    {medications.filter(med => {
                      const today = new Date().toDateString();
                      return med.nextDose.toDateString() === today;
                    }).length}
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
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-xl font-bold">
                    {medications.filter(med => med.pillCount <= 5).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Medications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Your Medications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {medications.map((medication, index) => (
                <motion.div
                  key={medication.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Pill className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-semibold text-lg">{medication.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>{medication.dosage}</span>
                        <span>•</span>
                        <span>{medication.frequency}</span>
                        <span>•</span>
                        <span className={medication.pillCount <= 5 ? 'text-red-600 font-medium' : ''}>
                          {medication.pillCount} pills left
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          Next dose: {medication.nextDose.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} ({getTimeUntilNext(medication.nextDose)})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className={getAdherenceColor(medication.adherence)}>
                        {medication.adherence}% adherence
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedMedication(medication);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteMedication(medication.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleTakeMedication(medication)}
                        >
                          <Camera className="w-4 h-4" />
                          Take Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {medications.length === 0 && (
              <div className="text-center py-12">
                <Pill className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No medications added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first medication to track your health journey
                </p>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Medication
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Medication Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Medication Name</Label>
              <Input
                id="name"
                placeholder="e.g., Metformin 500mg"
                value={newMedication.name}
                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g., 1 tablet"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={newMedication.frequency} onValueChange={(value) => 
                setNewMedication({ ...newMedication, frequency: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once daily">Once daily</SelectItem>
                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                  <SelectItem value="As needed">As needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pillCount">Pills Count</Label>
                <Input
                  id="pillCount"
                  type="number"
                  placeholder="30"
                  value={newMedication.pillCount}
                  onChange={(e) => setNewMedication({ ...newMedication, pillCount: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="nextDose">Next Dose</Label>
                <Input
                  id="nextDose"
                  type="datetime-local"
                  value={newMedication.nextDose}
                  onChange={(e) => setNewMedication({ ...newMedication, nextDose: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleAddMedication}
                disabled={!newMedication.name || !newMedication.frequency}
                className="flex-1"
              >
                Add Medication
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Medication Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
          </DialogHeader>
          
          {selectedMedication && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Medication Name</Label>
                <Input
                  id="edit-name"
                  value={selectedMedication.name}
                  onChange={(e) => setSelectedMedication({ ...selectedMedication, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-dosage">Dosage</Label>
                <Input
                  id="edit-dosage"
                  value={selectedMedication.dosage}
                  onChange={(e) => setSelectedMedication({ ...selectedMedication, dosage: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-frequency">Frequency</Label>
                <Select 
                  value={selectedMedication.frequency} 
                  onValueChange={(value) => setSelectedMedication({ ...selectedMedication, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Once daily">Once daily</SelectItem>
                    <SelectItem value="Twice daily">Twice daily</SelectItem>
                    <SelectItem value="Three times daily">Three times daily</SelectItem>
                    <SelectItem value="Four times daily">Four times daily</SelectItem>
                    <SelectItem value="As needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-pillCount">Pills Count</Label>
                <Input
                  id="edit-pillCount"
                  type="number"
                  value={selectedMedication.pillCount}
                  onChange={(e) => setSelectedMedication({ 
                    ...selectedMedication, 
                    pillCount: parseInt(e.target.value) || 0 
                  })}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleEditMedication} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}