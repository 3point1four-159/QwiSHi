
'use client';
import type { Employee, Location, Shift } from './types';

// This function now runs on the client-side to access localStorage
function getCurrentUserFromStorage(): Employee {
  if (typeof window === 'undefined') {
    // Return a default employee on the server
    return employees.find(e => e.role === 'employee')!;
  }
  const role = localStorage.getItem('userRole') || 'employee';
  const user = employees.find(e => e.role === role);
  return user || employees.find(e => e.role === 'employee')!;
}

export const locations: Location[] = [
  { id: 'loc1', name: 'Subway - Downtown Core' },
  { id: 'loc2', name: 'Subway - North Suburbs' },
  { id: 'loc3', name: 'Subway - Exhibition Center' },
  { id: 'loc4', name: 'Subway - Financial District' },
];

export const employees: Employee[] = [
  {
    id: 'emp1',
    name: 'Alice Johnson',
    avatarUrl: 'https://placehold.co/100x100/E8D3FF/6D28D9',
    skills: ['Server', 'Bartender', 'Host'],
    availability: 'Weekends, weekday evenings',
    rating: 4.8,
    reviews: 2,
    reviewDetails: [
        { reviewer: 'Downtown Core Manager', comment: 'Alice is a fantastic bartender, very reliable.', rating: 5 },
        { reviewer: 'Financial District Manager', comment: 'Great team player, always on time.', rating: 4.6 },
    ],
    associatedLocationIds: ['loc1', 'loc4'],
    role: 'employee',
  },
  {
    id: 'emp2',
    name: 'Bob Williams',
    avatarUrl: 'https://placehold.co/100x100/D1FAE5/065F46',
    skills: ['Barista', 'Cashier'],
    availability: 'Anytime',
    rating: 4.5,
    reviews: 1,
    reviewDetails: [
        { reviewer: 'Downtown Core Manager', comment: 'Bob is great with customers.', rating: 4.5 },
    ],
    associatedLocationIds: ['loc1'],
    role: 'employee',
  },
  {
    id: 'emp3',
    name: 'Charlie Brown',
    avatarUrl: 'https://placehold.co/100x100/FEE2E2/991B1B',
    skills: ['Line Cook', 'Prep Cook'],
    availability: 'Weekday mornings',
    rating: 4.9,
    reviews: 2,
     reviewDetails: [
        { reviewer: 'North Suburbs Manager', comment: 'Charlie is our best line cook. Incredibly fast and consistent.', rating: 5 },
        { reviewer: 'Exhibition Center Manager', comment: 'Always willing to help out and pick up extra shifts.', rating: 4.8 },
    ],
    associatedLocationIds: ['loc2', 'loc3'],
    role: 'employee',
  },
  {
    id: 'emp4',
    name: 'Diana Prince',
    avatarUrl: 'https://placehold.co/100x100/DBEAFE/1E40AF',
    skills: ['Server', 'Host', 'Barista'],
    availability: 'Weekend mornings and afternoons',
    rating: 4.7,
    reviews: 1,
    reviewDetails: [
        { reviewer: 'Downtown Core Manager', comment: 'A true professional, our customers love her.', rating: 4.7 },
    ],
    associatedLocationIds: ['loc1', 'loc2', 'loc3', 'loc4'],
    role: 'employee',
  },
  {
    id: 'mgr1',
    name: 'Michael Scott',
    avatarUrl: 'https://placehold.co/100x100/FEF9C3/854D0E',
    skills: ['Management', 'Scheduling', 'Customer Service'],
    availability: 'Weekdays',
    rating: 5.0,
    reviews: 0,
    reviewDetails: [],
    associatedLocationIds: ['loc1', 'loc2', 'loc3', 'loc4'],
    role: 'manager',
  },
];

export const shifts: Shift[] = [
  {
    id: 'shift1',
    location: locations[0],
    role: 'Senior Barista',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    startTime: '08:00',
    endTime: '16:00',
    hourlyRate: 22.5,
    status: 'Open',
    applicants: [employees[1], employees[3]],
  },
  {
    id: 'shift2',
    location: locations[1],
    role: 'Line Cook',
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    startTime: '17:00',
    endTime: '23:00',
    hourlyRate: 25,
    status: 'Open',
    applicants: [employees[2]],
  },
  {
    id: 'shift3',
    location: locations[2],
    role: 'Event Server',
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    startTime: '18:00',
    endTime: '01:00',
    hourlyRate: 28,
    status: 'Open',
    applicants: [],
  },
  {
    id: 'shift4',
    location: locations[3],
    role: 'Host/Hostess',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    startTime: '16:00',
    endTime: '22:00',
    hourlyRate: 19,
    status: 'Filled',
    assignedTo: employees[0],
  },
  {
    id: 'shift5',
    location: locations[0],
    role: 'Prep Cook',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    startTime: '07:00',
    endTime: '15:00',
    hourlyRate: 21,
    status: 'Completed',
    assignedTo: employees[2],
  },
    {
    id: 'shift6',
    location: locations[1],
    role: 'Bartender',
    date: new Date(new Date().setDate(new Date().getDate() + 4)),
    startTime: '19:00',
    endTime: '02:00',
    hourlyRate: 30,
    status: 'Open',
    applicants: [employees[0], employees[3]],
  },
];

// This is now a reactive variable that reads from localStorage.
export let currentUser: Employee = getCurrentUserFromStorage();

// This function now persists the role to localStorage.
export const setCurrentUser = (role: 'employee' | 'manager') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userRole', role);
    const user = employees.find(e => e.role === role);
    if (user) {
      currentUser = user;
    } else {
      console.error(`No user found with role: ${role}`);
      // Fallback to a default user
      currentUser = employees[0];
      localStorage.setItem('userRole', currentUser.role);
    }
  }
}
