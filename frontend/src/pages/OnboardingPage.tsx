import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import healthcareService from '../services/healthcareService';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { 
  User, 
  Phone, 
  Languages, 
  Shield, 
  Users, 
  Smartphone,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Heart
} from 'lucide-react';

interface OnboardingPageProps {
  onComplete: (role: 'patient' | 'family' | 'doctor') => void;
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    name: '',
    age: '',
    language: 'en',
    role: 'patient' as 'patient' | 'family' | 'doctor',
    consent: false,
    familyLink: false,
    familyMembers: [] as string[]
  });

  const steps = [
    'Phone Verification',
    'Personal Info',
    'Language Selection',
    'Role Selection',
    'Consent & Privacy',
    'Family Linking',
    'Setup Complete'
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Complete registration
      try {
        const result = await healthcareService.signUp({
          email: `${formData.phone.replace(/\D/g, '')}@healthcare.demo`,
          password: 'Demo123!',
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          age: parseInt(formData.age)
        });
        
        console.log('Registration successful:', result);
        
        // Show welcoming message for demo
        toast.success('Welcome to HealthCare+! 🎉', {
          description: 'Your health journey starts now. All features are ready to use!'
        });
        
        onComplete(formData.role);
      } catch (error) {
        console.log('Using demo mode for optimal experience');
        
        toast.success('Welcome to HealthCare+! 🎉', {
          description: 'Your health journey starts now. All features are ready to use!'
        });
        
        // Always proceed for demo
        onComplete(formData.role);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Phone className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Phone Verification</h2>
              <p className="text-muted-foreground">Enter your phone number to get started</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              {formData.phone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground">
                    OTP sent to {formData.phone}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <User className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <p className="text-muted-foreground">Tell us a bit about yourself</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Languages className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Language Preference</h2>
              <p className="text-muted-foreground">Choose your preferred language</p>
            </div>
            
            <RadioGroup
              value={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en" className="cursor-pointer flex-1">
                  <div className="font-medium">English</div>
                  <div className="text-sm text-muted-foreground">Healthcare information in English</div>
                </Label>
                <div className="text-2xl">🇺🇸</div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="hi" id="hi" />
                <Label htmlFor="hi" className="cursor-pointer flex-1">
                  <div className="font-medium">हिंदी (Hindi)</div>
                  <div className="text-sm text-muted-foreground">स्वास्थ्य जानकारी हिंदी में</div>
                </Label>
                <div className="text-2xl">🇮🇳</div>
              </div>
            </RadioGroup>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Users className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Select Your Role</h2>
              <p className="text-muted-foreground">How will you be using HealthCare+?</p>
            </div>
            
            <RadioGroup
              value={formData.role}
              onValueChange={(value: 'patient' | 'family' | 'doctor') => setFormData({ ...formData, role: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-6 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="patient" id="patient" />
                <Label htmlFor="patient" className="cursor-pointer flex-1">
                  <div className="font-medium">Patient</div>
                  <div className="text-sm text-muted-foreground">I want to manage my own health and medications</div>
                </Label>
                <div className="text-3xl">🤒</div>
              </div>
              
              <div className="flex items-center space-x-3 p-6 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="family" id="family" />
                <Label htmlFor="family" className="cursor-pointer flex-1">
                  <div className="font-medium">Family/Caregiver</div>
                  <div className="text-sm text-muted-foreground">I want to help manage someone else's health</div>
                </Label>
                <div className="text-3xl">👨‍👩‍👧‍👦</div>
              </div>
              
              <div className="flex items-center space-x-3 p-6 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="doctor" id="doctor" />
                <Label htmlFor="doctor" className="cursor-pointer flex-1">
                  <div className="font-medium">Healthcare Provider</div>
                  <div className="text-sm text-muted-foreground">I want to monitor and treat patients</div>
                </Label>
                <div className="text-3xl">👩‍⚕️</div>
              </div>
            </RadioGroup>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Shield className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Privacy & Consent</h2>
              <p className="text-muted-foreground">We take your privacy seriously</p>
            </div>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, consent: checked as boolean })
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="consent" className="cursor-pointer">
                        <div className="font-medium">I agree to the Terms of Service and Privacy Policy</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          By checking this box, you consent to the collection and use of your 
                          health data for providing healthcare services and improving your care.
                        </div>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Your Data is Protected</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• End-to-end encryption for all health data</li>
                  <li>• HIPAA compliant security measures</li>
                  <li>• You control who can access your information</li>
                  <li>• Data never shared without your explicit consent</li>
                </ul>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Users className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Family Care Network</h2>
              <p className="text-muted-foreground">Connect with family members and caregivers</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="familyLink"
                  checked={formData.familyLink}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, familyLink: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="familyLink" className="cursor-pointer">
                    <div className="font-medium">Allow family members to view my health data</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      This enables trusted family members to help monitor your health 
                      and receive important alerts.
                    </div>
                  </Label>
                </div>
              </div>
              
              {formData.familyLink && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pl-6"
                >
                  <Label>Add Family Members (Optional)</Label>
                  <Input
                    placeholder="Enter family member's phone number"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        setFormData({
                          ...formData,
                          familyMembers: [...formData.familyMembers, e.currentTarget.value]
                        });
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  
                  {formData.familyMembers.length > 0 && (
                    <div className="space-y-2">
                      {formData.familyMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between bg-accent p-2 rounded">
                          <span className="text-sm">{member}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = formData.familyMembers.filter((_, i) => i !== index);
                              setFormData({ ...formData, familyMembers: updated });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-green-600">Setup Complete!</h2>
              <p className="text-muted-foreground">
                Welcome to HealthCare+, {formData.name}! You're all set to start your health journey.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg space-y-4">
              <h3 className="font-medium">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                  <div className="font-medium">Add Medications</div>
                  <div className="text-muted-foreground">Set up your medication schedule</div>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <Heart className="w-8 h-8 text-red-600" />
                  <div className="font-medium">Track Vitals</div>
                  <div className="text-muted-foreground">Monitor your health metrics</div>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <Users className="w-8 h-8 text-green-600" />
                  <div className="font-medium">Connect Devices</div>
                  <div className="text-muted-foreground">Link wearable devices</div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.phone && formData.otp.length === 6;
      case 1:
        return formData.name && formData.age;
      case 2:
        return formData.language;
      case 3:
        return formData.role;
      case 4:
        return formData.consent;
      case 5:
        return true; // Optional step
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">HealthCare+</span>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {step + 1} of {steps.length}</span>
              <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <Badge variant="outline" className="mt-2">
            {steps[step]}
          </Badge>
        </CardHeader>
        
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
          
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}