import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from './ui/dialog';
import healthcareService from '../services/healthcareService';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import { Bell, Pill, Camera, CheckCircle, X, Clock, Volume2, Hand, Eye, RotateCcw } from 'lucide-react';

export default function ReminderModal({ onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { user } = useApp();

  // Mock medication data - in real app this would come from props
  const medication = {
    id: '1',
    name: 'Metformin',
    dosage: '500mg',
    instructions: ['Take with food', 'Take in the morning'],
    pillCount: 28,
    reminderTime: '08:00'
  };

  const steps = [
    {
      title: 'Time to take your medication',
      icon: Bell,
      content: (
        <div className="text-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{medication.name}</h3>
            <p className="text-gray-600">{medication.dosage}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{medication.reminderTime}</span>
            </div>
          </div>
          <div className="space-y-2">
            {medication.instructions.map((instruction, index) => (
              <p key={index} className="text-sm text-gray-600">• {instruction}</p>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Verify your medication',
      icon: Eye,
      content: (
        <div className="text-center space-y-4">
          <p className="text-gray-600">Please verify you have the correct medication before taking it.</p>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Camera className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">Pill Verification</span>
            </div>
            <p className="text-sm text-gray-600">
              Take a photo of your pill to verify it matches your prescription
            </p>
          </div>
          {verificationResult && (
            <div className={`p-3 rounded-lg ${verificationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 justify-center">
                {verificationResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <X className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${verificationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {verificationResult.message}
                </span>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Confirm medication taken',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold">Ready to confirm?</h3>
            <p className="text-gray-600 text-sm">
              Please confirm that you have taken your {medication.name}
            </p>
          </div>
          <div className="text-left space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Correct medication verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Proper dosage: {medication.dosage}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Instructions followed</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleVerifyPill = async () => {
    setIsVerifying(true);
    
    // Simulate pill verification
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      setVerificationResult({
        success,
        message: success ? 'Pill verified successfully!' : 'Pill verification failed. Please try again.'
      });
      setIsVerifying(false);
      
      if (success) {
        setTimeout(() => setCurrentStep(2), 1000);
      }
    }, 2000);
  };

  const handleConfirmTaken = async () => {
    try {
      // Record medication taken
      await healthcareService.recordMedicationTaken(medication.id, {
        takenAt: new Date().toISOString(),
        verified: verificationResult?.success || false,
        notes: 'Taken via reminder modal'
      });
      
      toast.success('Medication recorded successfully!');
      onComplete?.();
      onClose?.();
    } catch (error) {
      toast.error('Failed to record medication. Please try again.');
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
            
            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious} className="flex-1">
                Previous
              </Button>
            )}
            
            {currentStep === 0 && (
              <Button onClick={handleNext} className="flex-1">
                Start Verification
              </Button>
            )}
            
            {currentStep === 1 && (
              <Button 
                onClick={handleVerifyPill} 
                disabled={isVerifying}
                className="flex-1"
              >
                {isVerifying ? 'Verifying...' : 'Verify Pill'}
              </Button>
            )}
            
            {currentStep === 2 && (
              <Button onClick={handleConfirmTaken} className="flex-1">
                Confirm Taken
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
