
import { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const sampleDoctors: Partial<User>[] = [
  {
    id: uuidv4(),
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@healthcare.org',
    role: 'doctor',
    specialty: 'Cardiology',
    license_number: 'MD12345',
    profile_image: 'https://randomuser.me/api/portraits/women/23.jpg',
    online_status: true,
    organization: 'Memorial Healthcare'
  },
  {
    id: uuidv4(),
    name: 'Dr. Michael Chen',
    email: 'michael.chen@healthcare.org',
    role: 'doctor',
    specialty: 'Neurology',
    license_number: 'MD23456',
    profile_image: 'https://randomuser.me/api/portraits/men/44.jpg',
    online_status: true,
    organization: 'Memorial Healthcare'
  },
  {
    id: uuidv4(),
    name: 'Nurse Jessica Williams',
    email: 'jessica.williams@healthcare.org',
    role: 'nurse',
    license_number: 'RN78901',
    profile_image: 'https://randomuser.me/api/portraits/women/45.jpg',
    online_status: false,
    organization: 'Memorial Healthcare'
  },
  {
    id: uuidv4(),
    name: 'Dr. Robert Davis',
    email: 'robert.davis@healthcare.org',
    role: 'doctor',
    specialty: 'Pediatrics',
    license_number: 'MD34567',
    profile_image: 'https://randomuser.me/api/portraits/men/32.jpg',
    online_status: true,
    organization: 'City Medical Center'
  },
  {
    id: uuidv4(),
    name: 'Dr. Amanda Lee',
    email: 'amanda.lee@healthcare.org',
    role: 'doctor',
    specialty: 'Dermatology',
    license_number: 'MD45678',
    profile_image: 'https://randomuser.me/api/portraits/women/28.jpg',
    online_status: false,
    organization: 'City Medical Center'
  }
];
