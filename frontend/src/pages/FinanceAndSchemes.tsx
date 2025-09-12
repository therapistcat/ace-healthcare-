import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import {
  DollarSign,
  FileText,
  Shield,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  Search,
  CreditCard,
  Receipt,
  Target,
  Award,
  Info,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const expenseData = [
  { name: 'Medications', value: 3200, color: '#3b82f6', percentage: 45 },
  { name: 'Consultations', value: 2100, color: '#10b981', percentage: 30 },
  { name: 'Lab Tests', value: 1200, color: '#f59e0b', percentage: 17 },
  { name: 'Other', value: 600, color: '#ef4444', percentage: 8 }
];

const monthlyExpenses = [
  { month: 'Jan', amount: 6500 },
  { month: 'Feb', amount: 7200 },
  { month: 'Mar', amount: 5800 },
  { month: 'Apr', amount: 7100 },
  { month: 'May', amount: 6900 },
  { month: 'Jun', amount: 7800 },
  { month: 'Jul', amount: 7100 }
];

const bills = [
  {
    id: '1',
    type: 'medication',
    vendor: 'Apollo Pharmacy',
    amount: 1250,
    date: new Date('2024-01-15'),
    status: 'paid',
    category: 'Medications',
    reimbursable: true
  },
  {
    id: '2',
    type: 'consultation',
    vendor: 'Dr. Rajesh Kumar',
    amount: 800,
    date: new Date('2024-01-14'),
    status: 'pending',
    category: 'Consultations',
    reimbursable: false
  },
  {
    id: '3',
    type: 'lab',
    vendor: 'Thyrocare Labs',
    amount: 650,
    date: new Date('2024-01-12'),
    status: 'paid',
    category: 'Lab Tests',
    reimbursable: true
  },
  {
    id: '4',
    type: 'medication',
    vendor: 'MedPlus',
    amount: 890,
    date: new Date('2024-01-10'),
    status: 'paid',
    category: 'Medications',
    reimbursable: false
  }
];

const governmentSchemes = [
  {
    id: '1',
    name: 'Ayushman Bharat (PM-JAY)',
    description: 'Comprehensive health insurance coverage up to ₹5 lakh per family per year',
    coverage: '₹5,00,000',
    eligibility: 'Based on SECC-2011 database',
    status: 'eligible',
    benefits: [
      'Covers 1,350+ medical packages',
      'Cashless treatment at empanelled hospitals',
      'No premium payment required',
      'Pre and post hospitalization covered'
    ],
    savings: '₹45,000 annually',
    applied: false
  },
  {
    id: '2',
    name: 'Jan Aushadhi Generic Medicines',
    description: 'Access to quality generic medicines at affordable prices',
    coverage: '50-80% discount',
    eligibility: 'All citizens',
    status: 'applicable',
    benefits: [
      '9000+ Jan Aushadhi stores',
      'WHO-GMP certified medicines',
      '50-80% cost savings',
      '1500+ generic drug formulations'
    ],
    savings: '₹1,200 monthly',
    applied: true
  },
  {
    id: '3',
    name: 'Senior Citizen Health Insurance',
    description: 'Special health insurance scheme for senior citizens aged 60+',
    coverage: '₹3,00,000',
    eligibility: 'Age 60+ years',
    status: 'eligible',
    benefits: [
      'Pre-existing conditions covered',
      'Domiciliary treatment',
      'Annual health check-up',
      'Cashless claim facility'
    ],
    savings: '₹18,000 annually',
    applied: false
  }
];

export default function FinanceAndSchemes() {
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const totalSpent = expenseData.reduce((acc, item) => acc + item.value, 0);
  const filteredBills = bills.filter(bill => 
    bill.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApplyScheme = (schemeId: string) => {
    const scheme = governmentSchemes.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedScheme(scheme);
      setShowSchemeModal(true);
    }
  };

  const handleSchemeApplication = () => {
    if (selectedScheme) {
      toast.success(`Application submitted for ${selectedScheme.name}`, {
        description: 'You will receive updates via SMS and email'
      });
      setShowSchemeModal(false);
      setSelectedScheme(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'pending': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'overdue': return 'bg-red-100 text-red-700 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const getSchemeStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'applicable': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'not-eligible': return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
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
          <h1 className="text-2xl md:text-3xl font-bold">Finance & Government Schemes</h1>
          <p className="text-muted-foreground">Track expenses and discover savings opportunities</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bills">Bills & Expenses</TabsTrigger>
          <TabsTrigger value="schemes">Government Schemes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-xl font-bold">₹{totalSpent.toLocaleString()}</p>
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
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Potential Savings</p>
                      <p className="text-xl font-bold text-green-600">₹18,500</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reimbursable</p>
                      <p className="text-xl font-bold">₹1,900</p>
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
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Schemes Applied</p>
                      <p className="text-xl font-bold">1 of 3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Expense Breakdown */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="space-y-3">
                      {expenseData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">₹{item.value}</div>
                            <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyExpenses}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="bills" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search bills by vendor or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Bills
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bills List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bills & Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBills.map((bill, index) => (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {bill.type === 'medication' ? (
                          <Receipt className="w-6 h-6 text-blue-600" />
                        ) : bill.type === 'consultation' ? (
                          <FileText className="w-6 h-6 text-green-600" />
                        ) : (
                          <CreditCard className="w-6 h-6 text-orange-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{bill.vendor}</h3>
                          {bill.reimbursable && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                              Reimbursable
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {bill.category} • {bill.date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-lg">₹{bill.amount}</div>
                        <Badge className={getStatusColor(bill.status)}>
                          {bill.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schemes" className="space-y-6">
          {/* Schemes Grid */}
          <div className="grid gap-6">
            {governmentSchemes.map((scheme, index) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <Badge className={getSchemeStatusColor(scheme.status)}>
                      {scheme.status === 'eligible' ? 'Eligible' : 
                       scheme.status === 'applicable' ? 'Available' : 'Not Eligible'}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <CardTitle className="text-xl">{scheme.name}</CardTitle>
                        <p className="text-muted-foreground mt-2">{scheme.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Key Details */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Coverage</span>
                        </div>
                        <div className="font-bold text-blue-600">{scheme.coverage}</div>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Potential Savings</span>
                        </div>
                        <div className="font-bold text-green-600">{scheme.savings}</div>
                      </div>
                      
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">Eligibility</span>
                        </div>
                        <div className="font-bold text-orange-600 text-sm">{scheme.eligibility}</div>
                      </div>
                    </div>
                    
                    {/* Benefits */}
                    <div>
                      <h4 className="font-semibold mb-2">Key Benefits:</h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {scheme.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {scheme.applied ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Application submitted
                          </div>
                        ) : (
                          'Not yet applied'
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                        <Button 
                          onClick={() => handleApplyScheme(scheme.id)}
                          disabled={scheme.applied || scheme.status === 'not-eligible'}
                          size="sm"
                        >
                          {scheme.applied ? 'Applied' : 'Apply Now'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Modal */}
      <Dialog open={showSchemeModal} onOpenChange={setShowSchemeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for {selectedScheme?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedScheme && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Application Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Coverage:</span>
                    <span className="font-medium">{selectedScheme.coverage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potential Savings:</span>
                    <span className="font-medium text-green-600">{selectedScheme.savings}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+91 98765 43210" />
                </div>
                
                <div>
                  <Label htmlFor="aadhaar">Aadhaar Number</Label>
                  <Input id="aadhaar" placeholder="XXXX XXXX XXXX" />
                </div>
                
                <div>
                  <Label htmlFor="income">Annual Family Income</Label>
                  <Input id="income" placeholder="₹2,50,000" />
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Important Note</p>
                    <p className="text-yellow-700">
                      Your application will be reviewed by the government authority. 
                      You will receive updates via SMS and email.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowSchemeModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSchemeApplication} className="flex-1">
                  Submit Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}