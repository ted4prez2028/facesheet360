
import { RecentPatient, TodayAppointment, PendingTask } from "@/types";

export const useMockRecentPatients = (): RecentPatient[] => {
  return [
    {
      id: "1",
      name: "John Doe",
      age: 65,
      condition: "Hypertension",
      lastVisit: "2 days ago",
      status: "Stable"
    },
    {
      id: "2", 
      name: "Jane Smith",
      age: 42,
      condition: "Diabetes",
      lastVisit: "1 week ago",
      status: "Follow-up"
    },
    {
      id: "3",
      name: "Bob Johnson", 
      age: 58,
      condition: "Asthma",
      lastVisit: "3 days ago",
      status: "Critical"
    }
  ];
};

export const useMockTodayAppointments = (): TodayAppointment[] => {
  return [
    {
      id: "1",
      time: "9:00 AM",
      patient: "Alice Brown",
      type: "Consultation",
      duration: 30
    },
    {
      id: "2", 
      time: "10:30 AM",
      patient: "Charlie Wilson",
      type: "Follow-up",
      duration: 15
    },
    {
      id: "3",
      time: "2:00 PM",
      patient: "Diana Miller",
      type: "Physical Exam",
      duration: 45
    }
  ];
};

export const useMockPendingTasks = (): PendingTask[] => {
  return [
    {
      id: "1",
      task: "Review lab results for Patient #1234",
      priority: "high",
      due: "Today"
    },
    {
      id: "2",
      task: "Update medication list for Patient #5678",
      priority: "medium", 
      due: "Tomorrow"
    },
    {
      id: "3",
      task: "Schedule follow-up appointment",
      priority: "low",
      due: "This week"
    }
  ];
};
