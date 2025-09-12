# Healthcare+ Testing Guide

## 🚀 Current Status

**Both servers are running:**
- **Frontend**: http://localhost:5175 (React app)
- **Backend**: http://localhost:5001 (Healthcare+ API)

## 🧪 Testing Steps

### 1. **Demo Account Login**
1. Open http://localhost:5175
2. Click "Login" 
3. Use demo credentials:
   - **Email**: `demo@healthcare.com`
   - **Password**: `demo123`
4. Should redirect to `/dashboard` automatically

### 2. **Full Signup Flow**
1. Go to http://localhost:5175
2. Click "Sign Up"
3. Fill any details and submit
4. Use OTP: `123456` (demo OTP)
5. Should redirect to `/dashboard` after verification

### 3. **Dashboard Features**

**Vitals Tracker:**
- Add blood pressure, heart rate, blood sugar, weight, temperature, oxygen saturation
- View recent vitals history with color-coded status indicators
- Data stored in user's healthData.vitals array

**Medication Tracker:**
- Add medications with dosage, frequency, and times
- Gamified system with points (10 per dose) and streak tracking
- Mark medications as taken throughout the day
- Visual progress tracking

**Family Connections:**
- Invite family members and caregivers by email
- Set permissions for viewing vitals and medications
- Emergency contact information
- Medication alerts for missed doses

**Gemini AI Chatbot:**
- Click the 🤖 button in bottom-right corner
- Ask health-related questions
- Get AI-powered responses using Gemini API
- Quick question suggestions for new users

### 4. **Navigation**
- **Home**: http://localhost:5175/
- **Dashboard**: http://localhost:5175/dashboard
- **Emergency Videos**: http://localhost:5175/videos
- **Login**: http://localhost:5175/login
- **Signup**: http://localhost:5175/signup

### 5. **API Endpoints Working**
- `POST /api/health/vitals-simple` - Add vitals
- `GET /api/health/vitals-simple` - Get vitals
- `POST /api/health/medications` - Add medication
- `GET /api/health/medications` - Get medications
- `POST /api/health/medication-logs` - Log medication taken
- `GET /api/health/medication-stats` - Get gamification stats

## 🎯 Expected Behavior

1. **After Login**: User should be redirected to `/dashboard`
2. **Dashboard Tabs**: Should show Vitals, Medications, Family & Care, Reports
3. **Vitals Form**: Should accept input and save to database
4. **Medication Form**: Should allow adding medications with multiple times
5. **Gamification**: Should show streak and points
6. **Chatbot**: Should respond to health questions
7. **Responsive Design**: Should work on mobile and desktop

## 🐛 Known Issues Fixed

- ✅ CORS configuration updated for port 5175
- ✅ Demo account phone number format fixed
- ✅ OTP validation parameter mismatch resolved
- ✅ Dashboard routing properly configured
- ✅ Inline CSS styling (no Tailwind dependency issues)
- ✅ API endpoints for simplified health data storage

## 🔧 Troubleshooting

**If dashboard doesn't load:**
1. Check browser console for errors
2. Verify user is logged in (check localStorage)
3. Try refreshing the page
4. Check network tab for API call failures

**If API calls fail:**
1. Verify backend is running on port 5001
2. Check CORS configuration
3. Verify token is present in localStorage
4. Check backend console for errors

**If styling looks broken:**
1. Hard refresh (Ctrl+F5)
2. Check if CSS is loading properly
3. Verify inline styles are applied

## 🎉 Success Criteria

- [ ] Demo login works and redirects to dashboard
- [ ] All dashboard tabs are accessible
- [ ] Vitals can be added and displayed
- [ ] Medications can be added and marked as taken
- [ ] Gamification shows points and streak
- [ ] Chatbot responds to questions
- [ ] Family connections can be invited
- [ ] Emergency videos are accessible
- [ ] Bilingual support works (EN ↔ हि)
- [ ] Responsive design works on mobile
