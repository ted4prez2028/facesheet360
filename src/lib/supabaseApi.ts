
// This file is kept for backward compatibility
// Import new API modules and re-export them
import * as patientApi from './api/patientApi';
import * as chartApi from './api/chartApi';
import * as appointmentApi from './api/appointmentApi';
import * as userApi from './api/userApi';
import * as careCoinsApi from './api/careCoinsApi';
import * as notificationApi from './api/notificationApi';

// Re-export all functions from the new modules
export const {
  getPatients,
  getPatientById,
  addPatient,
  updatePatient,
  deletePatient,
  getPatientByFacialData,
  storeFacialData,
  getPatient,
  createPatient
} = patientApi;

export const {
  getPatientCharts,
  addChartRecord,
  updateChartRecord
} = chartApi;

export const {
  getPatientAppointments,
  addAppointment,
  updateAppointment
} = appointmentApi;

export const {
  getUsers,
  getUserById,
  getUserProfile,
  updateUser
} = userApi;

export const {
  transferCareCoins,
  getCareCoinsBalance
} = careCoinsApi;

export const {
  getNotifications
} = notificationApi;
