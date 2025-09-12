import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Card, CardContent } from './ui/card';
import { 
  Camera, 
  Check, 
  X, 
  RotateCcw, 
  Pill, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface PillVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication?: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
  };
}

export default function PillVerificationModal({ 
  isOpen, 
  onClose, 
  medication 
}: PillVerificationModalProps) {
  const [step, setStep] = useState<'camera' | 'verifying' | 'success' | 'failed'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageCapture = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
      startVerification();
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageCapture(file);
    }
  };

  const startVerification = () => {
    setStep('verifying');
    setIsProcessing(true);
    setVerificationProgress(0);

    // Simulate AI verification process
    const progressInterval = setInterval(() => {
      setVerificationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Simulate verification result (90% success rate for demo)
          const isSuccess = Math.random() > 0.1;
          setStep(isSuccess ? 'success' : 'failed');
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setStep('camera');
    setVerificationProgress(0);
  };

  const confirmTaken = () => {
    toast.success('Medication taken successfully! 💊', {
      description: `${medication?.name} dose confirmed at ${new Date().toLocaleTimeString()}`
    });
    onClose();
    resetModal();
  };

  const resetModal = () => {
    setStep('camera');
    setCapturedImage(null);
    setVerificationProgress(0);
    setIsProcessing(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300); // Reset after modal close animation
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Pill Verification
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {medication && (
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <h3 className="font-medium">{medication.name}</h3>
                    <p className="text-sm text-muted-foreground">{medication.dosage} • {medication.frequency}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                      <Clock className="w-4 h-4" />
                      Due now
                    </div>
                  </CardContent>
                </Card>
              )}

              {!capturedImage ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 aspect-square rounded-lg flex flex-col items-center justify-center p-8">
                    <Camera className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-center text-gray-600 mb-4">
                      Take a photo of your pill or upload from gallery
                    </p>
                    <div className="space-y-2 w-full">
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo / Upload
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">Verification Tips:</p>
                        <ul className="text-yellow-700 mt-1 space-y-1">
                          <li>• Ensure good lighting</li>
                          <li>• Show the pill clearly</li>
                          <li>• Include any markings or numbers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={capturedImage} 
                      alt="Captured pill" 
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={retakePicture} className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                    <Button onClick={startVerification} className="flex-1">
                      <Check className="w-4 h-4 mr-2" />
                      Verify Pill
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 py-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Pill className="w-8 h-8 text-blue-600" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-medium mb-2">Verifying Medication</h3>
                <p className="text-muted-foreground text-sm">
                  Our AI is analyzing your pill image...
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Verification Progress</span>
                  <span>{verificationProgress}%</span>
                </div>
                <Progress value={verificationProgress} className="h-2" />
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div className={verificationProgress >= 30 ? 'text-green-600' : ''}>
                  ✓ Image quality check
                </div>
                <div className={verificationProgress >= 60 ? 'text-green-600' : ''}>
                  ✓ Pill identification
                </div>
                <div className={verificationProgress >= 90 ? 'text-green-600' : ''}>
                  ✓ Prescription match
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6 py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-green-600 mb-2">
                  Pill Verified Successfully!
                </h3>
                <p className="text-muted-foreground text-sm">
                  The medication matches your prescription
                </p>
              </div>

              {medication && (
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Pill className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{medication.name}</p>
                        <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Not Now
                </Button>
                <Button onClick={confirmTaken} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Taken
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6 py-8"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <X className="w-8 h-8 text-red-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-red-600 mb-2">
                  Verification Failed
                </h3>
                <p className="text-muted-foreground text-sm">
                  We couldn't match this pill to your prescription. Please try again with better lighting.
                </p>
              </div>

              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Possible issues:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Poor image quality</li>
                      <li>• Different medication</li>
                      <li>• Pill markings not visible</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={retakePicture} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}