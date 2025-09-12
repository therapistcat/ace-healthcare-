import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { 
  Heart, 
  Smartphone, 
  Shield, 
  Users, 
  BarChart3, 
  Clock, 
  ArrowRight, 
  Star,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Smart Health Monitoring',
    description: 'Track vitals, medication adherence, and health trends with AI-powered insights.',
    gradient: 'from-red-500/10 to-pink-500/10'
  },
  {
    icon: Smartphone,
    title: 'Medication Management',
    description: 'Never miss a dose with smart reminders, pill verification, and refill alerts.',
    gradient: 'from-blue-500/10 to-cyan-500/10'
  },
  {
    icon: Shield,
    title: 'Family Care Network',
    description: 'Connect with family members and caregivers for collaborative health management.',
    gradient: 'from-green-500/10 to-emerald-500/10'
  },
  {
    icon: Users,
    title: 'Doctor Integration',
    description: 'Seamless communication with healthcare providers and appointment management.',
    gradient: 'from-purple-500/10 to-indigo-500/10'
  },
  {
    icon: BarChart3,
    title: 'Health Analytics',
    description: 'Comprehensive health reports and predictive risk assessment.',
    gradient: 'from-orange-500/10 to-amber-500/10'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock health assistance and emergency response.',
    gradient: 'from-teal-500/10 to-cyan-500/10'
  }
];

const testimonials = [
  {
    name: 'Rajesh Sharma',
    role: 'Patient',
    content: 'This app has completely transformed how I manage my diabetes. The medication reminders and health tracking keep me on track.',
    rating: 5,
    avatar: '👨‍💼'
  },
  {
    name: 'Dr. Priya Patel',
    role: 'Cardiologist',
    content: 'As a doctor, I love how this platform helps me monitor my patients remotely and provides comprehensive health data.',
    rating: 5,
    avatar: '👩‍⚕️'
  },
  {
    name: 'Sunita Devi',
    role: 'Family Caregiver',
    content: 'Managing my mother\'s medications is so much easier now. The family dashboard gives me peace of mind.',
    rating: 5,
    avatar: '👩‍🦳'
  },
  {
    name: 'Amit Kumar',
    role: 'Patient',
    content: 'The government scheme assistance helped me save thousands on my medical bills. Truly life-changing!',
    rating: 5,
    avatar: '👨‍🔬'
  }
];

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">HealthCare+</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-6"
            >
              <a href="#features" className="text-sm hover:text-primary transition-colors">Features</a>
              <a href="#testimonials" className="text-sm hover:text-primary transition-colors">Testimonials</a>
              <a href="#about" className="text-sm hover:text-primary transition-colors">About</a>
              <Link to="/onboarding">
                <Button>Get Started</Button>
              </Link>
            </motion.div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                🚀 Revolutionary Healthcare Platform
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Your Health,{' '}
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Your Family
                </span>,<br />
                Our Priority
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Transform your healthcare journey with AI-powered medication management, 
                family care coordination, and comprehensive health monitoring.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/onboarding">
                  <Button size="lg" className="group">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Button variant="outline" size="lg" className="group">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Adherence Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">₹50L+</div>
                  <div className="text-sm text-muted-foreground">Savings Generated</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1706700373837-cec87ddeedad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwdGVjaG5vbG9neSUyMG1vZGVybnxlbnwxfHx8fDE3NTcxODQ0NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Healthcare Technology"
                  className="w-full h-80 object-cover rounded-xl"
                />
                
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3 border"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <div className="text-xs">
                      <div className="font-medium">Medication Taken</div>
                      <div className="text-muted-foreground">9:00 AM</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3 border"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xs">
                      <div className="font-medium">BP: 120/80</div>
                      <div className="text-muted-foreground">Normal</div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-green-500/20 rounded-2xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/20 to-pink-500/20 rounded-2xl transform -rotate-2"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4">
              ✨ Comprehensive Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Better Health
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with compassionate care 
              to deliver a seamless healthcare experience.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="relative h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}></div>
                  <CardContent className="relative p-6 h-full flex flex-col">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground flex-1">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mb-4">
              💬 User Testimonials
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              What Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Users Say
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from real people whose lives have been transformed by our platform.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden shadow-2xl border-0">
              <CardContent className="p-0">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="p-8 md:p-12"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl md:text-2xl font-medium mb-6 leading-relaxed">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{testimonials[currentTestimonial].avatar}</div>
                    <div>
                      <div className="font-bold">{testimonials[currentTestimonial].name}</div>
                      <div className="text-muted-foreground">{testimonials[currentTestimonial].role}</div>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
              
              {/* Navigation */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4">
                <Button variant="outline" size="icon" onClick={prevTestimonial}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <Button variant="outline" size="icon" onClick={nextTestimonial}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
            
            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-primary w-6' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-white"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Healthcare Journey?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of users who have already taken control of their health 
              with our comprehensive platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/onboarding">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 group">
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Schedule Demo
              </Button>
            </div>
            
            <div className="mt-8 text-blue-100">
              <p className="text-sm">✓ Free 30-day trial &nbsp;&nbsp; ✓ No credit card required &nbsp;&nbsp; ✓ Cancel anytime</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HealthCare+</span>
              </div>
              <p className="text-slate-400">
                Empowering healthier lives through innovative technology and compassionate care.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 HealthCare+. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}