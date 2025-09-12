# HealthCare+ Platform

A comprehensive Health & Wellness Tech Platform that supports multiple user roles (patient, family, doctor) with features including medication management, health tracking, appointment booking, and government scheme integration.

## 🏗️ Architecture

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Routing**: React Router
- **Charts**: Recharts
- **State Management**: React Context

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 8.0.3
- **Authentication**: JWT tokens with bcryptjs
- **Security**: Helmet, CORS, express-rate-limit
- **Email**: Nodemailer
- **File Upload**: Multer
- **Validation**: express-validator

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd healthcare-platform
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/healthcare_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

#### Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

#### Start Backend Server
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Test the API
Run the API test script to verify everything is working:
```bash
cd backend
node test-api.js
```

## 📁 Project Structure

```
healthcare-platform/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # Authentication & authorization
│   ├── models/
│   │   ├── User.js              # User schema with roles & family connections
│   │   ├── Medication.js        # Medication tracking & adherence
│   │   ├── VitalSigns.js        # Health data tracking
│   │   ├── Appointment.js       # Appointment management
│   │   ├── Notification.js      # Notification system
│   │   └── HealthReport.js      # Document management
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── users.js             # User management
│   │   ├── medications.js       # Medication CRUD operations
│   │   ├── health.js            # Vitals & health reports
│   │   ├── appointments.js      # Appointment booking & management
│   │   ├── notifications.js     # Notification management
│   │   └── family.js            # Family dashboard & connections
│   ├── utils/
│   │   ├── email.js             # Email templates & sending
│   │   └── helpers.js           # Utility functions
│   ├── server.js                # Main server configuration
│   ├── package.json             # Backend dependencies
│   ├── .env.example             # Environment variables template
│   └── test-api.js              # API testing script
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # React contexts
│   │   ├── services/
│   │   │   └── healthcareService.ts  # API service layer
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # App entry point
│   ├── package.json             # Frontend dependencies
│   └── .env.example             # Environment variables template
└── README.md                    # This file
```

## 🔐 Authentication Flow

1. **User Registration**: Users register with email, password, and basic info
2. **OTP Verification**: Email OTP sent for account verification
3. **Login**: JWT token issued upon successful authentication
4. **Role-based Access**: Different permissions for patient, family, and doctor roles
5. **Family Connections**: Patients can connect with family members with granular permissions

## 🏥 Key Features

### For Patients
- **Medication Management**: Track medications, set reminders, monitor adherence
- **Health Tracking**: Record vital signs, view trends and analytics
- **Appointment Booking**: Schedule appointments with doctors
- **Health Reports**: Upload and manage medical documents
- **Family Sharing**: Connect with family members for health monitoring

### For Family Members
- **Family Dashboard**: Monitor connected patients' health status
- **Medication Oversight**: View medication schedules and adherence
- **Health Alerts**: Receive notifications for critical health events
- **Appointment Tracking**: View upcoming appointments for family members

### For Doctors
- **Patient Management**: View and manage patient records
- **Prescription Management**: Prescribe medications and track adherence
- **Appointment Scheduling**: Manage appointment bookings
- **Health Monitoring**: Review patient vital signs and health trends

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/family` - Get family connections
- `POST /api/users/family/connect` - Add family connection

### Medications
- `GET /api/medications` - Get medications
- `POST /api/medications` - Add medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication
- `POST /api/medications/:id/take` - Record medication taken

### Health
- `GET /api/health/vitals` - Get vital signs
- `POST /api/health/vitals` - Add vital signs
- `GET /api/health/reports` - Get health reports
- `POST /api/health/reports` - Upload health report
- `GET /api/health/stats` - Get health statistics

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Family Dashboard
- `GET /api/family/dashboard` - Get family dashboard
- `GET /api/family/patient/:id` - Get patient details
- `POST /api/family/patient/:id/alert` - Send alert to patient

## 🚀 Deployment

### Backend Deployment

#### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare_db
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
```

#### Deploy to Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-connection-string
heroku config:set JWT_SECRET=your-jwt-secret
# ... set other environment variables

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Deploy to Railway
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically deploy on git push

#### Deploy to DigitalOcean App Platform
1. Create new app in DigitalOcean
2. Connect GitHub repository
3. Configure environment variables
4. Deploy

### Frontend Deployment

#### Build for Production
```bash
cd frontend
npm run build
```

#### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-domain.com/api
```

#### Deploy to Netlify
1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

## 🧪 Testing

### Backend Testing
```bash
cd backend
node test-api.js
```

### Manual Testing Checklist
- [ ] User registration and OTP verification
- [ ] User login and authentication
- [ ] Medication CRUD operations
- [ ] Vital signs recording and retrieval
- [ ] Appointment booking and management
- [ ] Notification system
- [ ] Family connections and permissions
- [ ] Role-based access control

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: express-validator for request validation
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers for Express
- **Role-based Access**: Granular permissions system

## 📊 Database Schema

### Users Collection
- Authentication data (email, password, OTP)
- Profile information (name, age, gender, etc.)
- Role-based permissions (patient, family, doctor)
- Family connections with granular permissions
- Notification preferences and privacy settings

### Medications Collection
- Medication details (name, dosage, frequency)
- Adherence tracking and statistics
- Reminder settings and scheduling
- Prescription information
- Stock management

### VitalSigns Collection
- Blood pressure, heart rate, blood sugar
- Weight, height, temperature
- Automatic categorization and alerts
- Trend analysis and BMI calculation

### Appointments Collection
- Doctor and patient information
- Scheduling and status tracking
- Telemedicine support
- Billing and insurance integration

### Notifications Collection
- Multi-type notification system
- Priority levels and categorization
- Delivery tracking and interaction logging
- Scheduled and expiring notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@healthcareplus.com
- Documentation: [Project Wiki](link-to-wiki)

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User authentication and role management
  - Medication tracking and adherence
  - Health data recording and analytics
  - Appointment booking system
  - Family connections and monitoring
  - Notification system
