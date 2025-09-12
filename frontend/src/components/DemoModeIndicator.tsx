import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Info, X } from 'lucide-react';

export default function DemoModeIndicator() {
  const [showInfo, setShowInfo] = useState(false);
  
  // Check if we're in demo mode
  const isDemoMode = localStorage.getItem('healthcare_demo_user') !== null;
  
  if (!isDemoMode) return null;

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <Badge 
          className="bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer gap-1"
          onClick={() => setShowInfo(true)}
        >
          <Info className="w-3 h-3" />
          Interactive Demo
        </Badge>
      </div>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-green-600" />
                Interactive Demo Experience
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowInfo(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                You're experiencing HealthCare+ as an interactive demo! All features work exactly like the real app, with your data stored securely on your device.
              </p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Fully Functional</p>
                  <p className="text-muted-foreground">All features work exactly as in the full version</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Local Storage</p>
                  <p className="text-muted-foreground">Data persists between sessions on this device</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Real-time Updates</p>
                  <p className="text-muted-foreground">Changes are reflected immediately across all screens</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> In production, this would sync with our secure cloud backend and support family sharing, doctor access, and cross-device synchronization.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}