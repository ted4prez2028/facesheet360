# Batch Update useAuth Imports

These files need their useAuth imports updated from '@/context/AuthContext' to '@/hooks/useAuth':

## Hook Files
- src/hooks/useAppointmentsToday.tsx
- src/hooks/useBillPayment.ts  
- src/hooks/useCallLights.tsx
- src/hooks/useCareCoinsTransactions.tsx
- src/hooks/useCarePlans.tsx
- src/hooks/useCashOut.ts
- src/hooks/useCommunication.ts
- src/hooks/useCommunicationService.tsx
- src/hooks/useDashboardData.tsx
- src/hooks/usePatientsPage.tsx
- src/hooks/usePendingTasks.tsx
- src/hooks/usePrescriptions.tsx
- src/hooks/useQuickActions.tsx
- src/hooks/useRealPatientData.tsx
- src/hooks/useRolePermissions.ts
- src/hooks/useTransactionForm.ts
- src/hooks/useUserAchievements.ts
- src/hooks/useVirtualCard.ts
- src/hooks/useWallet.tsx
- src/hooks/useWalletSetup.tsx

## Page Files
- src/pages/Charting.tsx
- src/pages/DoctorAccounts.tsx
- src/pages/Login.tsx
- src/pages/PatientList.tsx
- src/pages/Patients.tsx
- src/pages/PostPaymentAuth.tsx
- src/pages/ProfilePage.tsx
- src/pages/Subscription.tsx

## Component Files
- src/components/ai/AIWoundAssessment.tsx
- src/components/appointments/AppointmentForm.tsx
- src/components/care-plan/AICareplanButton.tsx
- src/components/care-plan/CarePlanForm.tsx
- src/components/care-plan/CarePlanList.tsx
- src/components/care-plan/CarePlanViewer.tsx
- src/components/charting/ImagingPanel.tsx
- src/components/charting/LabResultsPanel.tsx
- src/components/charting/MedicationsPanel.tsx
- src/components/charting/VitalSignsPanel.tsx
- src/components/communication/ChatWindow.tsx
- src/components/dashboard/QuickActions.tsx
- src/components/ehr/PointClickCareEHR.tsx
- src/components/notifications/MedicationReminders.tsx
- src/components/notifications/NotificationCenter.tsx
- src/components/patients/AddPatientDrawer.tsx
- src/components/patients/CareTeamAssignments.tsx
- src/components/pharmacy/EnhancedPharmacyDashboard.tsx
- src/components/prescriptions/PrescriptionForm.tsx
- src/components/settings/ProfileTab.tsx
- src/components/wallet/AchievementsView.tsx
- src/components/wallet/BillPaymentView.tsx
- src/components/wallet/CareCoinsRewards.tsx
- src/components/wallet/HealthcareTransferView.tsx
- src/components/wallet/transaction/PlatformTransferForm.tsx
- src/components/wallet/transaction/UserTransferForm.tsx