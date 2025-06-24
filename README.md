# Facesheet360 - Healthcare Management Platform

Facesheet360 is a comprehensive healthcare management platform designed for medical professionals to streamline patient care, appointment scheduling, charting, and more.

## Features

### Patient Management
- **Patient Records**: Create and manage detailed patient profiles
- **Facial Recognition**: Identify patients using facial recognition technology
- **Medical History**: Track comprehensive patient medical histories
- **Care Team Assignment**: Assign healthcare professionals to specific patients

### Charting & Documentation
- **Digital Charting**: Comprehensive electronic health records
- **Vital Signs Tracking**: Record and monitor patient vital signs
- **Lab Results**: Manage and view laboratory test results
- **Medication Management**: Prescribe and track patient medications
- **Imaging Records**: Store and view patient imaging studies
- **Wound Care**: Document and track wound healing with AI analysis
- **Care Plans**: Create and manage patient care plans with AI assistance

### Appointments & Scheduling
- **Calendar View**: View appointments in day, week, or month format
- **Appointment Scheduling**: Create and manage patient appointments
- **Reminders**: Automated appointment reminders

### Communication
- **Secure Messaging**: Chat with other healthcare professionals
- **Video Calls**: Conduct telemedicine sessions with patients
- **Group Calls**: Host multi-participant video conferences
- **Call Light System**: Respond to patient assistance requests

### Pharmacy Integration
- **Prescription Management**: Create and track prescriptions
- **Medication Administration**: Record when medications are administered
- **Pharmacy Dashboard**: View and manage prescriptions from a pharmacist perspective

### Food Service
- **Dietary Management**: Track patient dietary restrictions
- **Meal Ordering**: Order meals for patients
- **Menu Synchronization**: Automatically sync with food service providers

### Analytics & Reporting
- **Health Metrics**: Track key health metrics and trends
- **Patient Statistics**: View patient demographic information
- **Appointment Analytics**: Monitor appointment statistics

### CareCoins Rewards
- **Digital Wallet**: Manage CareCoins digital currency
- **Rewards System**: Earn CareCoins for healthcare activities
- **Bill Payments**: Use CareCoins to pay medical bills
- **Virtual Cards**: Create virtual payment cards backed by CareCoins

### User Management
- **Role-Based Access**: Different permissions for doctors, nurses, therapists, and CNAs
- **User Profiles**: Customizable user profiles
- **Subscription Management**: Manage subscription plans and billing

### Security & Compliance
- **Authentication**: Secure login and authentication
- **Role-Based Permissions**: Control access based on user roles
- **Data Protection**: Secure storage of patient information
Pandemic Trend Analytics - A powerful dashboard that visualizes disease patterns over time, showing distribution across demographics, severity levels, and geographic regions. It includes anomaly detection to highlight unusual increases in specific illnesses.

Interactive Illness Heat Map - A geographic visualization that displays disease hotspots on a map, with color-coding for severity and interactive popups showing detailed information about each outbreak location.

Disease Outbreak Alerts - Real-time notifications about critical health events in your area, with severity ratings, detailed information, and specific recommendations for healthcare providers.

Regional Health Trends - Comparative analysis of disease patterns across different regions, with demographic breakdowns and year-over-year comparisons to identify emerging health concerns.

Dashboard Integration - Added pandemic monitoring to the main dashboard with critical alerts and local trends to keep providers informed of important health events in their area.

The system includes:

Filtering by region, timeframe, and illness type
Severity indicators and growth rate tracking
Demographic analysis of affected populations
Comparative analytics across regions and time periods
Subscription options for real-time alerts
Export functionality for reports
## Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Edge Functions)
- **State Management**: React Query, Context API
- **Real-time Features**: Supabase Realtime
- **AI Integration**: OpenAI for care plan generation and wound analysis
- **Communication**: WebRTC for video calls
- **Deployment**: Netlify

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
```sh
git clone <repository-url>
cd facesheet360
```

2. Install dependencies
```sh
npm install
```

3. Start the development server
```sh
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Environment Setup

The application requires the following environment variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key (for AI features)
```

## Deployment

The application can be deployed to Netlify:

```sh
npm run build
netlify deploy --prod
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact support@facesheet360.com
