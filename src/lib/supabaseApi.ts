
// This file is kept for backward compatibility
// Import new API modules and re-export them
import * as patientApi from './api/patientApi';
import * as chartApi from './api/chartApi';
import * as appointmentApi from './api/appointmentApi';
import * as userApi from './api/userApi';
import * as careCoinsApi from './api/careCoinsApi';
import * as notificationApi from './api/notificationApi';
import * as woundCareApi from './api/woundCareApi';

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

// Chart API functions
export const getPatientCharts = chartApi.chartApi.getChartRecords;
export const addChartRecord = chartApi.chartApi.createChartRecord;
export const updateChartRecord = chartApi.chartApi.updateChartRecord;
export const createChartRecord = chartApi.chartApi.createChartRecord;
export const getChartRecordById = chartApi.chartApi.getChartRecordById;
export const getChartRecordsByPatientId = chartApi.chartApi.getChartRecords;
export const deleteChartRecord = chartApi.chartApi.deleteChartRecord;

export const {
  getPatientAppointments,
  addAppointment,
  updateAppointment
} = appointmentApi;

export const {
  getUsers,
  getUserById,
  getUserProfile,
  updateUser,
  updateUserOnlineStatus
} = userApi;

// CareCoins API functions
export const transferCareCoins = async (fromId: string, toId: string, amount: number) => {
  return careCoinsApi.careCoinsApi.createTransaction({
    from_user_id: fromId,
    to_user_id: toId,
    amount,
    transaction_type: 'transfer'
  });
};

export const getCareCoinsBalance = async (userId: string) => {
  const transactions = await careCoinsApi.careCoinsApi.getTransactions(userId);
  return transactions.reduce((balance, tx) => {
    if (tx.to_user_id === userId) return balance + tx.amount;
    if (tx.from_user_id === userId) return balance - tx.amount;
    return balance;
  }, 0);
};

export const {
  getNotifications
} = notificationApi;

export const {
  getWoundRecordsByPatientId,
  createWoundRecord,
  updateWoundRecord,
  deleteWoundRecord,
  uploadWoundImage
} = woundCareApi;
