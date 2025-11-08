# Health Rewards System Documentation

## Overview
The Health Rewards System automatically awards CareCoins to patients for completing health-related goals and activities, encouraging positive health behaviors and engagement.

## Features Implemented

### 1. Real-Time Balance Updates
- **Technology**: Supabase Realtime subscriptions
- **Components**: `useRealtimeBalance` hook, updated `WalletBalance` component
- **Behavior**: Balance updates instantly across all devices when transactions occur
- **Visual Indicator**: Green "Live" indicator shows real-time sync status

### 2. Health Goals System

#### Database Tables
- **`health_goals`**: Stores patient health goals with progress tracking
- **`goal_achievements`**: Records completed goals and rewards earned

#### Goal Types
1. **Appointment Attendance** - Rewards for attending scheduled appointments
2. **Medication Adherence** - Rewards for taking medications as prescribed
3. **Vital Signs Tracking** - Rewards for regular vital signs monitoring
4. **Therapy Attendance** - Rewards for attending therapy sessions
5. **Custom Goals** - Flexible goals defined by healthcare staff

#### Components
- **`HealthGoalsDashboard`**: Main dashboard showing active and completed goals
- **`CreateHealthGoalDialog`**: Interface for healthcare staff to create new goals
- **`useHealthGoals`**: React Query hook for goal management

### 3. Automatic Reward Distribution

#### Trigger Mechanism
Database trigger `on_goal_completed` automatically:
1. Detects when a goal is marked as completed
2. Creates a CareCoins transaction
3. Updates patient's balance
4. Records achievement in `goal_achievements` table

#### Edge Function: `track-health-progress`
Automatically tracks patient activities and updates goal progress:

**Tracked Activities:**
- `appointment_completed` - Updates appointment attendance goals
- `medication_taken` - Updates medication adherence goals
- `vitals_recorded` - Updates vital signs tracking goals
- `therapy_attended` - Updates therapy attendance goals

**Usage Example:**
```typescript
await supabase.functions.invoke('track-health-progress', {
  body: {
    patientId: 'patient-uuid',
    activityType: 'appointment_completed',
    metadata: { appointmentId: 'appointment-uuid' }
  }
});
```

## Reward Distribution Formula

### Default Charting Profits (40/50/10 split):
- **40%** to Patient
- **50%** to Healthcare Provider
- **10%** to Platform/Admin

### Health Goal Rewards:
- Configurable per goal (default: 10-50 CareCoins)
- 100% goes to patient upon goal completion

## Patient Journey

### Step 1: Goal Creation
Healthcare provider creates health goal:
- Sets goal type and target (e.g., "Attend 5 appointments")
- Defines reward amount (e.g., 25 CareCoins)
- Optional end date

### Step 2: Progress Tracking
Patient completes activities (appointments, medications, etc.):
- System automatically tracks progress
- Patient can view progress in real-time
- Visual progress bars show completion status

### Step 3: Goal Completion & Reward
When target is reached:
- Goal automatically marked as completed
- CareCoins instantly credited to patient's account
- Achievement notification sent
- Real-time balance update across all devices

## Integration Points

### Appointment System
- Appointments marked as "completed" trigger goal progress
- Located in: `src/hooks/useAppointments.tsx` (to be updated)

### Medication Administration
- Medication administration triggers adherence goals
- Located in: `src/components/prescriptions/AdministerMedicationDialog.tsx` (to be updated)

### Vital Signs Recording
- Recording vitals triggers tracking goals
- Integration point: Patient vital signs forms

## Access Control

### Patient Access:
- View own health goals and progress
- See completed goals and earned rewards
- Real-time balance updates

### Healthcare Staff (Doctor/Nurse):
- Create and manage patient health goals
- View all patient goals and progress
- Update goal progress manually if needed

### Admin Access:
- View all goals across all patients
- Monitor reward distribution
- Access analytics dashboard

## UI Locations

1. **Patient View**: 
   - Path: `/patients/:id` → "Health Goals" tab
   - Shows active goals, progress, and completed achievements

2. **Wallet Balance**:
   - Component: `WalletBalance`
   - Shows real-time balance with live indicator

3. **Transaction History**:
   - Path: `/carecoins-history`
   - Filter by "reward" type to see goal completions

4. **Analytics Dashboard** (Admin):
   - Path: `/carecoins-analytics`
   - View total rewards distributed and goal completion rates

## Testing the System

### Test Scenario 1: Appointment Attendance Goal
1. Create goal: "Attend 3 appointments" (30 CareCoins reward)
2. Schedule 3 appointments for patient
3. Mark each appointment as "completed"
4. Verify progress updates after each completion
5. On 3rd completion, verify 30 CareCoins credited instantly

### Test Scenario 2: Medication Adherence Goal
1. Create goal: "Take medications 10 times" (20 CareCoins reward)
2. Administer medications through the system
3. Each administration increments progress
4. On 10th administration, verify reward distribution

### Test Scenario 3: Real-time Balance Updates
1. Open patient wallet on Device A
2. Complete goal or receive CareCoins on Device B
3. Verify balance updates instantly on Device A without refresh

## Future Enhancements

### Potential Additions:
1. **Streaks**: Bonus rewards for consecutive completions
2. **Leaderboards**: Gamification with patient rankings
3. **Badges**: Visual achievements for milestones
4. **Family Goals**: Shared goals for family members
5. **Social Sharing**: Share achievements with care team
6. **Challenge Events**: Time-limited bonus reward events

### Advanced Goal Types:
- Weight management goals
- Exercise tracking integration
- Diet adherence goals
- Sleep quality goals
- Social interaction goals

## Troubleshooting

### Issue: Balance not updating in real-time
**Solution**: Check browser console for WebSocket connection errors. Ensure Supabase realtime is enabled on `profiles` and `care_coins_transactions` tables.

### Issue: Goal not completing automatically
**Solution**: Verify the database trigger is active. Check edge function logs at: `/dashboard/project/{project-id}/functions/track-health-progress/logs`

### Issue: Rewards not being distributed
**Solution**: Check `award_goal_completion()` function logs. Verify patient has valid `user_id` in profiles table.

## Security Considerations

1. **RLS Policies**: All tables have Row Level Security enabled
2. **Role-Based Access**: Only authorized staff can create goals
3. **Audit Trail**: All goal completions and rewards logged
4. **Balance Validation**: Server-side validation prevents manipulation

## Performance Optimization

1. **Real-time Subscriptions**: Uses efficient WebSocket connections
2. **Query Invalidation**: React Query ensures fresh data without over-fetching
3. **Indexed Queries**: Database indexes on patient_id and status fields
4. **Edge Functions**: Serverless auto-scaling for reward distribution
