
'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { shifts as allShifts, employees, currentUser as staticUser } from '@/lib/data';
import type { Shift, Employee } from '@/lib/types';
import { Eye, MessageSquare, Star, UserPlus, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { isPast, format, startOfWeek, addDays, isSameDay } from 'date-fns';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

const statusColors: { [key in Shift['status']]: string } = {
  Open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Filled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'Approval Needed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Expired: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

// =================================================================
// Employee Schedule Component
// =================================================================

function EmployeeSchedule() {
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [week, setWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [employeeShifts, setEmployeeShifts] = useState<Shift[]>([]);

    useEffect(() => {
        const role = localStorage.getItem('userRole') || 'employee';
        const user = employees.find(e => e.role === role);
        setCurrentUser(user || staticUser);
    }, []);

    useEffect(() => {
        if (currentUser) {
            const assignedShifts = allShifts.filter(shift => shift.assignedTo?.id === currentUser.id);
            setEmployeeShifts(assignedShifts);
        }
    }, [currentUser]);

    const days = Array.from({ length: 7 }).map((_, i) => addDays(week, i));

    const shiftsForDay = (day: Date) => {
        return employeeShifts.filter(shift => isSameDay(shift.date, day));
    };

    const handleNextWeek = () => setWeek(addDays(week, 7));
    const handlePrevWeek = () => setWeek(addDays(week, -7));
    const handleToday = () => setWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

    if (!currentUser) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Schedule</h1>
                <p className="text-muted-foreground">
                    Here are your confirmed shifts for the week.
                </p>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-headline">
                        {format(week, 'MMMM yyyy')}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" onClick={handlePrevWeek}>Previous</Button>
                         <Button variant="outline" onClick={handleToday}>Today</Button>
                         <Button variant="outline" onClick={handleNextWeek}>Next</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 border-t border-l">
                        {days.map(day => (
                            <div key={day.toISOString()} className="border-b border-r min-h-[150px] p-2 flex flex-col">
                                <span className="font-semibold text-sm">{format(day, 'EEE d')}</span>
                                <div className="space-y-2 mt-2 flex-grow">
                                    {shiftsForDay(day).map(shift => (
                                        <div key={shift.id} className="bg-primary/10 p-2 rounded-lg text-xs">
                                            <p className="font-bold text-primary">{shift.role}</p>
                                            <p className="text-muted-foreground">{shift.location.name}</p>
                                            <p className="text-muted-foreground">{shift.startTime} - {shift.endTime}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                {isPast(shift.date) ? 
                                                    <><CheckCircle className="w-3 h-3 text-green-500" /> Completed</> : 
                                                    <><Calendar className="w-3 h-3 text-blue-500" /> Upcoming</>
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


// =================================================================
// Manager Scheduler Component
// =================================================================

function ManagerScheduler() {
  const [shifts, setShifts] = useState<Shift[]>(allShifts);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Employee | null>(null);
  const [isApplicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [isReviewsModalOpen, setReviewsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleApprove = (shiftId: string, employee: Employee) => {
    setShifts(prevShifts =>
      prevShifts.map(s =>
        s.id === shiftId ? { ...s, assignedTo: employee, status: 'Filled', applicants: s.applicants?.filter(a => a.id !== employee.id) } : s
      )
    );
     // This is a mock update. In a real app, you'd update your state management/API.
    allShifts.forEach((s, i) => { if(s.id === shiftId) allShifts[i] = shifts.find(u => u.id === s.id)!});

    setApplicantsModalOpen(false);
    toast({
      title: 'Shift Filled!',
      description: `${employee.name} has been assigned to the ${selectedShift?.role} shift.`,
    });
  };

  const openApplicantsModal = (shift: Shift) => {
    setSelectedShift(shift);
    setApplicantsModalOpen(true);
  };
  
  const openReviewModal = (shift: Shift) => {
    setSelectedShift(shift);
    setReviewModalOpen(true);
  };

  const openReviewsModal = (applicant: Employee) => {
    setSelectedApplicant(applicant);
    setReviewsModalOpen(true);
  };

  const getShiftStatus = (shift: Shift): Shift['status'] => {
    const shiftEndDateTime = new Date(`${shift.date.toISOString().split('T')[0]}T${shift.endTime}`);

    if (isPast(shiftEndDateTime)) {
        if(shift.assignedTo) return 'Completed';
        return 'Expired';
    }
    if (shift.status === 'Filled' && shift.assignedTo) return 'Filled';
    if (shift.applicants && shift.applicants.length > 0) return 'Approval Needed';
    return 'Open';
  }

  const processedShifts = shifts.map(s => ({...s, status: getShiftStatus(s)}));
  
  const filteredShifts = processedShifts.filter(shift => shift.location.name === 'Subway - Downtown Core');
  
  const upcomingShifts = filteredShifts.filter(s => s.status === 'Filled');
  const pastShifts = filteredShifts.filter(s => s.status === 'Completed' || s.status === 'Expired');
  const openShifts = filteredShifts.filter(s => s.status === 'Open' || s.status === 'Approval Needed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Shift Scheduler</h1>
        <p className="text-muted-foreground">
          Oversee and manage all work shifts for Subway - Downtown Core.
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="open">Open Shifts</TabsTrigger>
                <TabsTrigger value="past">Past Shifts</TabsTrigger>
            </TabsList>
        </div>

        <Card>
            <CardContent className="p-0">
        
        <TabsContent value="upcoming">
            <ShiftTable shifts={upcomingShifts} onReview={openReviewModal} onManageApplicants={openApplicantsModal} />
        </TabsContent>
        <TabsContent value="open">
            <ShiftTable shifts={openShifts} onReview={openReviewModal} onManageApplicants={openApplicantsModal} />
        </TabsContent>
        <TabsContent value="past">
            <ShiftTable shifts={pastShifts} onReview={openReviewModal} onManageApplicants={openApplicantsModal} />
        </TabsContent>

        </CardContent>
        </Card>
      </Tabs>

      {/* Applicants Modal */}
      <Dialog open={isApplicantsModalOpen} onOpenChange={setApplicantsModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Applicants for {selectedShift?.role}</DialogTitle>
            <DialogDescription>
              Review and approve an employee for this shift.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedShift?.applicants && selectedShift.applicants.length > 0 ? (
                selectedShift.applicants.map(applicant => (
                    <div key={applicant.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={applicant.avatarUrl} />
                                <AvatarFallback>{getInitials(applicant.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{applicant.name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {applicant.rating} ({applicant.reviews} reviews)
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                             <Button size="sm" variant="outline" onClick={() => openReviewsModal(applicant)}>
                                <Eye className="mr-2 h-4 w-4" /> Reviews
                            </Button>
                            <Button size="sm" onClick={() => selectedShift && handleApprove(selectedShift.id, applicant)}>
                                <UserPlus className="mr-2 h-4 w-4" /> Approve
                            </Button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground py-8">No applicants yet for this shift.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">Review {selectedShift?.assignedTo?.name}</DialogTitle>
                <DialogDescription>Rate the employee's performance for the {selectedShift?.role} shift.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="flex items-center justify-center gap-2">
                    {[1,2,3,4,5].map(star => (
                        <Star key={star} className="w-8 h-8 text-gray-300 cursor-pointer hover:text-amber-400" />
                    ))}
                </div>
                <Textarea placeholder="Add comments on their performance..." />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={() => {
                    setReviewModalOpen(false);
                    toast({ title: 'Review Submitted', description: `Your feedback for ${selectedShift?.assignedTo?.name} has been recorded.` });
                }}>Submit Review</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Employee Reviews Modal */}
       <Dialog open={isReviewsModalOpen} onOpenChange={setReviewsModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="font-headline">Reviews for {selectedApplicant?.name}</DialogTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 
                      Overall: {selectedApplicant?.rating} ({selectedApplicant?.reviews} reviews)
                  </div>
              </DialogHeader>
              <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto">
                  {selectedApplicant?.reviewDetails && selectedApplicant.reviewDetails.length > 0 ? (
                      selectedApplicant.reviewDetails.map((review, index) => (
                          <div key={index} className="p-3 bg-card rounded-lg border text-sm">
                              <div className="flex justify-between items-center mb-2">
                                  <p className="font-semibold">{review.reviewer}</p>
                                  <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                      <span>{review.rating.toFixed(1)}</span>
                                  </div>
                              </div>
                              <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                      ))
                  ) : (
                      <p className="text-center text-muted-foreground py-8">No detailed reviews available for this employee.</p>
                  )}
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}

function ShiftTableRow({ shift, onManageApplicants, onReview }: { shift: Shift, onManageApplicants: (shift: Shift) => void, onReview: (shift: Shift) => void }) {
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        if (shift && shift.date) {
           setFormattedDate(new Date(shift.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
        }
    }, [shift.date]);

    if (!shift) return null;

    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">{shift.role}</div>
                <div className="text-sm text-muted-foreground">{shift.location.name}</div>
            </TableCell>
            <TableCell>
                <div>{formattedDate}</div>
                <div className="text-sm text-muted-foreground">{shift.startTime} - {shift.endTime}</div>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className={statusColors[shift.status] || ''}>{shift.status}</Badge>
            </TableCell>
            <TableCell>
                {shift.assignedTo ? (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                    <AvatarImage src={shift.assignedTo.avatarUrl} />
                    <AvatarFallback>{getInitials(shift.assignedTo.name)}</AvatarFallback>
                    </Avatar>
                    <span>{shift.assignedTo.name}</span>
                </div>
                ) : (
                <span className="text-muted-foreground">{shift.applicants?.length || 0}</span>
                )}
            </TableCell>
            <TableCell className="text-right">
                {(shift.status === 'Open' || shift.status === 'Approval Needed') && (
                <Button variant="outline" size="sm" onClick={() => onManageApplicants(shift)}>
                    Applicants ({shift.applicants?.length || 0})
                </Button>
                )}
                {shift.status === 'Completed' && shift.assignedTo && (
                <Button variant="outline" size="sm" onClick={() => onReview(shift)}>
                    <Star className="mr-2 h-4 w-4" /> Review
                </Button>
                )}
                {shift.status === 'Filled' && (
                <Button variant="ghost" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                </Button>
                )}
            </TableCell>
        </TableRow>
    )
}

function ShiftTable({ shifts, onManageApplicants, onReview }: { shifts: Shift[], onManageApplicants: (shift: Shift) => void, onReview: (shift: Shift) => void }) {
    if (shifts.length === 0) {
        return <div className="text-center p-12 text-muted-foreground">No shifts to display in this category.</div>
    }
    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To / Applicants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map(shift => (
              <ShiftTableRow key={shift.id} shift={shift} onManageApplicants={onManageApplicants} onReview={onReview} />
            ))}
          </TableBody>
        </Table>
    );
}


// =================================================================
// Main Page Component with Role-based Rendering
// =================================================================

export default function SchedulePage() {
    const [isClient, setIsClient] = useState(false);
    const [userRole, setUserRole] = useState<'employee' | 'manager' | null>(null);

    useEffect(() => {
        const role = (localStorage.getItem('userRole') as 'employee' | 'manager') || 'employee';
        setUserRole(role);
        setIsClient(true);
    }, []);

    if (!isClient) {
        // Render nothing or a loading spinner on the server to avoid hydration mismatch
        return null;
    }

    return userRole === 'manager' ? <ManagerScheduler /> : <EmployeeSchedule />;
}

    