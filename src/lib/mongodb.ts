
import { toast } from "sonner";

// MongoDB connection URL - This would normally be in an environment variable
// For development purposes, we're using a placeholder
const MONGODB_API_URL = "https://data.mongodb-api.com/app/healthtrack-api/endpoint";

// Error handling wrapper for fetch
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Error: ${response.status}`);
  }
  return response.json();
};

// Generic fetch wrapper with error handling
export const fetchWithErrorHandling = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  try {
    const response = await fetch(`${MONGODB_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    toast.error('Error connecting to database');
    throw error;
  }
};

// Authentication functions
export const authenticateUser = async (email: string, password: string) => {
  return fetchWithErrorHandling('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (userData: any) => {
  return fetchWithErrorHandling('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Patient-related functions
export const getPatients = async (query = {}) => {
  const queryString = new URLSearchParams(query as Record<string, string>).toString();
  const endpoint = `/patients${queryString ? `?${queryString}` : ''}`;
  return fetchWithErrorHandling(endpoint);
};

export const getPatientById = async (id: string) => {
  return fetchWithErrorHandling(`/patients/${id}`);
};

export const getPatientByFace = async (faceData: string) => {
  return fetchWithErrorHandling('/patients/face-recognition', {
    method: 'POST',
    body: JSON.stringify({ faceData }),
  });
};

export const createPatient = async (patientData: any) => {
  return fetchWithErrorHandling('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
};

export const updatePatient = async (id: string, patientData: any) => {
  return fetchWithErrorHandling(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patientData),
  });
};

// Appointment-related functions
export const getAppointments = async (query = {}) => {
  const queryString = new URLSearchParams(query as Record<string, string>).toString();
  const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;
  return fetchWithErrorHandling(endpoint);
};

export const createAppointment = async (appointmentData: any) => {
  return fetchWithErrorHandling('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
};

// Chart-related functions
export const getChartRecords = async (patientId: string) => {
  return fetchWithErrorHandling(`/charts/${patientId}`);
};

export const createChartEntry = async (chartData: any) => {
  return fetchWithErrorHandling('/charts', {
    method: 'POST',
    body: JSON.stringify(chartData),
  });
};

// Analytics functions
export const getAnalyticsData = async (query = {}) => {
  const queryString = new URLSearchParams(query as Record<string, string>).toString();
  const endpoint = `/analytics${queryString ? `?${queryString}` : ''}`;
  return fetchWithErrorHandling(endpoint);
};

// CareCoins functions
export const getCareCoinsBalance = async (userId: string) => {
  return fetchWithErrorHandling(`/carecoins/balance/${userId}`);
};

export const getCareCoinsTransactions = async (userId: string) => {
  return fetchWithErrorHandling(`/carecoins/transactions/${userId}`);
};

export const transferCareCoins = async (fromUserId: string, toAddress: string, amount: number) => {
  return fetchWithErrorHandling('/carecoins/transfer', {
    method: 'POST',
    body: JSON.stringify({ fromUserId, toAddress, amount }),
  });
};

// User management functions
export const getUsers = async () => {
  return fetchWithErrorHandling('/users');
};

export const getUserById = async (id: string) => {
  return fetchWithErrorHandling(`/users/${id}`);
};

export const updateUser = async (id: string, userData: any) => {
  return fetchWithErrorHandling(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

// For facial recognition
export const storeFacialData = async (userId: string, facialData: string) => {
  return fetchWithErrorHandling('/facial-recognition/store', {
    method: 'POST',
    body: JSON.stringify({ userId, facialData }),
  });
};

export const recognizeFace = async (facialData: string) => {
  return fetchWithErrorHandling('/facial-recognition/recognize', {
    method: 'POST',
    body: JSON.stringify({ facialData }),
  });
};
