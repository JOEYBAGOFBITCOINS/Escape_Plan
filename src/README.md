# 🚗 FuelTrakr - Napleton Automotive Group

> **Sophisticated fuel expense tracking app with glassmorphic design, biometric auth, and real-time GPS tracking**

![FuelTrakr](https://img.shields.io/badge/FuelTrakr-Production%20Ready-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)

## ✨ Features

### 🎨 **Premium UI/UX**
- **Glassmorphic design** with blue-tinted gradients
- **Animated borders** and glass effects
- **Mobile-first optimization** for field use
- **Dark automotive theme** throughout

### 🔐 **Authentication & Security**
- **Role-based access control** (Admin/Porter)
- **Biometric authentication** support
- **Email domain restrictions** (@napleton.com only)
- **Auto-login demo mode** for testing

### ⛽ **Fuel Tracking**
- **Stock number workflow** (primary method)
- **VIN photo capture** (backup option)  
- **Receipt photo integration** with camera
- **GPS location capture** for tracking
- **Real-time statistics** and reporting

### 👥 **Admin Features**
- **User management** dashboard
- **Data export** to CSV
- **Comprehensive reporting**
- **Multi-user oversight**

### 📱 **Mobile Optimized**
- **Quick field entry** with minimal taps
- **Numeric keypad defaults**
- **Camera integration** for photos
- **Offline-capable** with local storage

## 🚀 Quick Start

### **Demo Mode (No Setup Required)**
```bash
npm install
npm run dev
```
**No login required!** Auto-logs in as "John Porter" for immediate testing.

### **Production Setup**
1. **Configure Supabase** (optional - demo works without it)
2. **Deploy Edge Functions** for full backend
3. **Enable email domain restrictions**
4. **Set up user roles** and permissions

## 📦 Deployment

### **Vercel (Recommended)**
```bash
git push origin main
# Deploy via Vercel dashboard
```

### **Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS 4.0
- **Backend**: Supabase Edge Functions + PostgreSQL
- **Storage**: Supabase Storage for photos + KV Store
- **Auth**: Supabase Auth with custom user profiles
- **Styling**: Glassmorphic components with custom animations

## 🔧 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18.2, TypeScript 5.0 |
| **Styling** | Tailwind CSS 4.0, Custom Glassmorphic |
| **Backend** | Supabase Edge Functions (Hono) |
| **Database** | PostgreSQL + KV Store |
| **Storage** | Supabase Storage (Photos) |
| **Auth** | Supabase Auth + Custom Profiles |
| **Build** | Vite 4.4 |
| **Deployment** | Vercel / Netlify |

## 📁 Project Structure

```
├── App.tsx                 # Main application component
├── components/            
│   ├── AdminPanel.tsx     # Admin dashboard
│   ├── FuelEntryForm.tsx  # Fuel entry interface
│   ├── MainApp.tsx        # Primary app interface
│   └── ui/                # Shadcn/ui components
├── services/              
│   ├── authService.ts     # Authentication logic
│   ├── fuelService.ts     # Fuel entry management
│   └── adminService.ts    # Admin functionality
├── supabase/functions/    
│   └── make-server-218dc5b7/  # Edge function backend
└── utils/supabase/        # Supabase configuration
```

## 🎯 Key Features Demo

1. **No-Login Demo** - Automatic porter login
2. **Fuel Entry** - Stock number or VIN photo workflow  
3. **Photo Capture** - Receipt and VIN documentation
4. **GPS Tracking** - Location-based fuel purchases
5. **Admin Panel** - User management and data export
6. **Statistics** - Real-time tracking and reporting

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Porter** | `porter@napleton.com` | `porter123` |
| **Admin** | `admin@napleton.com` | `admin123` |

## 📄 License

© 2024 Napleton Automotive Group. All rights reserved.

---

**Built for Napleton Automotive Group** with ❤️ by the FuelTrakr team