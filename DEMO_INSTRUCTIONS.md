# Healthcare+ Demo Instructions

## 🚀 Quick Start

### Demo Account (Instant Login)
- **Email**: `demo@healthcare.com`
- **Password**: `demo123`
- **Role**: Patient
- **Status**: Pre-verified (no OTP needed)

### Demo OTP (For New Signups)
- **Demo OTP**: `123456` (bypasses verification)
- **Real OTP**: Check backend console for actual OTP codes

## 🌐 Access URLs

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5001

## 📱 How to Test

### Option 1: Demo Account (Fastest)
1. Go to http://localhost:5174
2. Click "Login"
3. Enter:
   - Email: `demo@healthcare.com`
   - Password: `demo123`
4. Click "Login" - you'll be logged in instantly!

### Option 2: Create New Account
1. Go to http://localhost:5174
2. Click "Sign Up"
3. Fill out the form with any details
4. Submit the form
5. Check the backend console for the OTP code OR use `123456`
6. Enter the OTP to verify your account

## 🎨 Features to Test

### ✅ Working Features
- **Bilingual Support**: Toggle between English (EN) and Hindi (हि)
- **Beautiful UI**: Hospital-themed green and white design
- **Responsive Design**: Works on desktop and mobile
- **Authentication Flow**: Signup → OTP Verification → Login
- **Role-based Access**: Patient, Family, Caregiver, Doctor roles
- **Demo Account**: Instant login without signup

### 🔧 Backend Features
- **OTP System**: Real OTP generation (logged to console in dev mode)
- **Demo Bypass**: Special demo account and OTP for testing
- **Role Management**: Different user roles with permissions
- **CORS Configured**: Supports multiple frontend ports
- **MongoDB Integration**: User data persistence
- **JWT Authentication**: Secure token-based auth

## 🛠 Technical Details

### Frontend (React + Vite)
- **Port**: 5174
- **Styling**: Inline CSS (no Tailwind dependency issues)
- **Animations**: GSAP for smooth interactions
- **Internationalization**: i18next for English/Hindi
- **API Client**: Axios for backend communication

### Backend (Node.js + Express)
- **Port**: 5001
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + OTP verification
- **Email**: Nodemailer (dev mode logs to console)
- **Security**: CORS, rate limiting, input validation

## 🎯 Demo Scenarios

### Scenario 1: Quick Demo
1. Use demo account to login instantly
2. Explore the dashboard
3. Test language switching
4. Navigate through different sections

### Scenario 2: Full Signup Flow
1. Create new account with your email
2. Check backend console for OTP
3. Complete verification
4. Experience the full onboarding

### Scenario 3: OTP Testing
1. Signup with any email
2. Use demo OTP `123456` for instant verification
3. Or use the real OTP from backend console

## 🔍 Troubleshooting

### ✅ Validation Fixed
- **Demo OTP**: `123456` now works correctly (bypasses validation)
- **Demo Account**: `demo@healthcare.com` / `demo123` works instantly
- **Parameter Fix**: Frontend now sends correct `otp` parameter (not `code`)
- **Debugging Added**: Backend logs all OTP verification attempts

### Common Issues
1. **CSS not loading**: Refresh the page (Ctrl+F5)
2. **CORS errors**: Make sure backend is running on port 5001
3. **OTP not working**: Use demo OTP `123456` or check console
4. **Login fails**: Use demo account or verify your account first

### Console Logs
- **Backend**: Shows OTP codes, demo account creation, API requests
- **Frontend**: Shows API responses and any errors

### Success Indicators in Console
```
🔍 OTP Verification Request: { email: 'user@example.com', otp: '123456' }
🔓 Demo OTP used: 123456 (bypassing verification)
✅ Demo account login successful for: demo@healthcare.com
```

## 📋 Next Steps

After testing the demo:
1. **Deployment**: Ready for Render/Heroku (backend) and Vercel/Netlify (frontend)
2. **Email Setup**: Configure real SMTP for production
3. **Database**: Set up production MongoDB
4. **Environment Variables**: Configure for production

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Login page loads with beautiful styling
- ✅ Demo account logs in instantly
- ✅ Language switcher works (EN ↔ हि)
- ✅ Signup creates new accounts
- ✅ OTP verification works (demo or real)
- ✅ Backend console shows OTP codes
- ✅ Responsive design works on mobile

---

**Healthcare+** - Your Advanced Healthcare Management System
*Built with React, Node.js, MongoDB, and lots of ❤️*
