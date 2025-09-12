import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  Image,
  Download,
  Eye,
  Trash2,
  Search,
  Camera,
  Scan,
  Calendar,
  Activity,
  Heart,
  Droplet,
  Thermometer
} from 'lucide-react';

const reports = [
  {
    id: '1',
    name: 'Blood Test Report',
    type: 'lab',
    date: new Date('2024-01-15'),
    provider: 'Thyrocare Labs',
    category: 'Blood Work',
    status: 'normal',
    fileUrl: '#',
    preview: 'Blood sugar: 95 mg/dL (Normal), Cholesterol: 180 mg/dL (Normal)',
    icon: Droplet
  },
  {
    id: '2',
    name: 'ECG Report',
    type: 'diagnostic',
    date: new Date('2024-01-12'),
    provider: 'City Hospital',
    category: 'Cardiology',
    status: 'normal',
    fileUrl: '#',
    preview: 'Normal sinus rhythm, HR: 72 bpm, No abnormalities detected',
    icon: Heart
  },
  {
    id: '3',
    name: 'X-Ray Chest',
    type: 'imaging',
    date: new Date('2024-01-08'),
    provider: 'Apollo Diagnostics',
    category: 'Radiology',
    status: 'normal',
    fileUrl: '#',
    preview: 'Clear lung fields, Normal heart size, No acute findings',
    icon: Image
  },
  {
    id: '4',
    name: 'Prescription - Dr. Kumar',
    type: 'prescription',
    date: new Date('2024-01-14'),
    provider: 'Dr. Rajesh Kumar',
    category: 'Cardiology',
    status: 'active',
    fileUrl: '#',
    preview: 'Metformin 500mg BD, Lisinopril 10mg OD, Follow-up in 4 weeks',
    icon: FileText
  }
];

const bills = [
  {
    id: '1',
    type: 'medical',
    vendor: 'City Hospital',
    amount: 2500,
    date: new Date('2024-01-15'),
    status: 'paid',
    category: 'Consultation',
    description: 'Cardiology consultation with Dr. Kumar'
  },
  {
    id: '2',
    type: 'pharmacy',
    vendor: 'Apollo Pharmacy',
    amount: 1200,
    date: new Date('2024-01-14'),
    status: 'paid',
    category: 'Medications',
    description: 'Monthly medication refill'
  },
  {
    id: '3',
    type: 'diagnostic',
    vendor: 'Thyrocare Labs',
    amount: 650,
    date: new Date('2024-01-12'),
    status: 'pending',
    category: 'Lab Tests',
    description: 'Comprehensive blood panel'
  }
];

export default function ReportsAndBills() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBills = bills.filter(bill => 
    bill.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      toast.success(`Uploaded: ${file.name}`, {
        description: 'Processing document for OCR...'
      });
    });
    setShowUploadModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'abnormal': return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'active': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'paid': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'pending': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cardiology': return Heart;
      case 'Blood Work': return Droplet;
      case 'Radiology': return Image;
      case 'General': return Activity;
      default: return FileText;
    }
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
          <h1 className="text-2xl md:text-3xl font-bold">Reports & Bills</h1>
          <p className="text-muted-foreground">Manage your medical documents and expenses</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Scan className="w-4 h-4" />
            OCR Scan
          </Button>
          <Button onClick={() => setShowUploadModal(true)} className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search reports, bills, or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Medical Reports</TabsTrigger>
          <TabsTrigger value="bills">Bills & Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Reports Grid */}
          <div className="grid gap-4">
            {filteredReports.map((report, index) => {
              const IconComponent = report.icon;
              
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => setSelectedReport(report)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{report.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{report.provider}</span>
                                <span>•</span>
                                <span>{report.category}</span>
                                <span>•</span>
                                <span>{report.date.toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {report.preview}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="w-3 h-3" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700">
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first medical report to get started
              </p>
              <Button onClick={() => setShowUploadModal(true)} className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Report
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          {/* Bills List */}
          <div className="grid gap-4">
            {filteredBills.map((bill, index) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold">{bill.vendor}</h3>
                          <div className="text-sm text-muted-foreground">
                            {bill.category} • {bill.date.toLocaleDateString()}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {bill.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-bold">₹{bill.amount.toLocaleString()}</div>
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredBills.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No bills found</h3>
              <p className="text-muted-foreground mb-4">
                Upload your medical bills to track expenses
              </p>
              <Button onClick={() => setShowUploadModal(true)} className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Bill
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="font-medium">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, JPG, PNG up to 10MB
                </p>
              </div>
              
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  handleFileUpload(files);
                }}
                id="file-upload"
              />
              
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="mt-4"
              >
                Choose Files
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="gap-2">
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>
              <Button variant="outline" className="gap-2">
                <Scan className="w-4 h-4" />
                OCR Scan
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <strong>AI-Powered OCR:</strong> We automatically extract key information from your medical documents including test results, medication names, and billing details.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}