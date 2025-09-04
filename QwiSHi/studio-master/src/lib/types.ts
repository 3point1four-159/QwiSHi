
export type Employee = {
  id: string;
  name: string;
  avatarUrl: string;
  skills: string[];
  availability: string;
  rating: number;
  reviews: number;
  reviewDetails?: { reviewer: string; comment: string; rating: number }[];
  associatedLocationIds?: string[];
  role: 'employee' | 'manager';
};

export type Location = {
  id:string;
  name: string;
};

export type Shift = {
  id: string;
  location: Location;
  role: string;
  date: Date;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  applicants?: Employee[];
  assignedTo?: Employee;
  status: 'Open' | 'Filled' | 'Completed' | 'Approval Needed' | 'Expired';
};
