
'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Briefcase, Calendar, Clock, Eye, MoreHorizontal, Star, UserPlus, Edit } from 'lucide-react';
import { shifts as allShifts, currentUser as staticUser, employees } from '@/lib/data';
import type { Employee, Shift } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

function ShiftCard({ shift }: { shift: Shift }) {
    const { toast } = useToast();
    const [formattedDate, setFormattedDate] = useState('');
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);

    useEffect(() => {
        const userFromStorage = localStorage.getItem('userRole');
        const user = employees.find(e => e.role === (userFromStorage || 'employee'));
        setCurrentUser(user || staticUser);
    }, []);

    useEffect(() => {
        setFormattedDate(new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    }, [shift.date]);

    const handleAccept = () => {
        const updatedShifts = allShifts.map(s => {
            if (s.id === shift.id) {
                const newApplicants = s.applicants ? [...s.applicants] : [];
                if (currentUser && !newApplicants.find(a => a.id === currentUser.id)) {
                    newApplicants.push(currentUser);
                }
                return { ...s, applicants: newApplicants, status: newApplicants.length > 0 ? 'Approval Needed' : 'Open' };
            }
            return s;
        });

        // In a real app, this would be an API call
        Object.assign(allShifts, updatedShifts);

        toast({
            title: "Shift Application Submitted!",
            description: `You've applied for the ${shift.role} shift at ${shift.location.name}.`,
        });
        setConfirmOpen(false);
    }

    return (
        <>
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-xl">{shift.role}</CardTitle>
                            <CardDescription>{shift.location.name}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-accent/30 text-accent-foreground">{`$${shift.hourlyRate.toFixed(2)}/hr`}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{shift.startTime} - {shift.endTime}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={() => setConfirmOpen(true)}>
                        Accept Shift
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </CardFooter>
            </Card>
            <Dialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Confirm Shift Application</DialogTitle>
                        <DialogDescription>
                            Please confirm you want to apply for this shift.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <p><strong>Role:</strong> {shift.role}</p>
                        <p><strong>Location:</strong> {shift.location.name}</p>
                        <p><strong>Date:</strong> {formattedDate}</p>
                        <p><strong>Time:</strong> {shift.startTime} - {shift.endTime}</p>
                        <p><strong>Rate:</strong> ${shift.hourlyRate.toFixed(2)}/hr</p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAccept}>Confirm Application</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ManagerDashboard() {
    const { toast } = useToast();
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [filterDays, setFilterDays] = useState('7');
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [selectedApplicant, setSelectedApplicant] = useState<Employee | null>(null);
    const [isApplicantsModalOpen, setApplicantsModalOpen] = useState(false);
    const [isReviewsModalOpen, setReviewsModalOpen] = useState(false);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);


    const processShifts = (currentShifts: Shift[], days: string) => {
        const now = new Date();
        const daysToFilter = parseInt(days, 10);
        const dateLimit = subDays(now, daysToFilter);

        return currentShifts
            .filter(shift => shift.location.name === 'Subway - Downtown Core')
            .map(shift => {
                const shiftDateTimeString = `${shift.date.toISOString().split('T')[0]}T${shift.endTime}`;
                const shiftEndDateTime = new Date(shiftDateTimeString);
                
                let status: Shift['status'] = shift.status;

                if (isPast(shiftEndDateTime)) {
                    if (shift.assignedTo) {
                        status = 'Completed'
                    } else if (status === 'Open') {
                         status = 'Expired';
                    }
                } else if (status === 'Open' && shift.applicants && shift.applicants.length > 0) {
                    status = 'Approval Needed';
                }

                return { ...shift, status };
            })
            .filter(shift => {
                 if (days === 'all') return true;
                 const shiftDate = new Date(shift.date);
                 return shiftDate >= dateLimit && shiftDate <= now;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    useEffect(() => {
        setShifts(processShifts(allShifts, filterDays));
    }, [filterDays]);

     const handleApprove = (shiftId: string, employee: Employee) => {
        const updatedShifts = allShifts.map(s =>
            s.id === shiftId ? { ...s, assignedTo: employee, status: 'Filled', applicants: s.applicants?.filter(a => a.id !== employee.id) } : s
        );
        // This is a mock update. In a real app, you'd update your state management/API.
        allShifts.forEach((s, i) => { if(s.id === shiftId) allShifts[i] = updatedShifts.find(u => u.id === s.id)!});
        setShifts(processShifts(updatedShifts, filterDays));
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

    const openReviewsModal = (applicant: Employee) => {
        setSelectedApplicant(applicant);
        setReviewsModalOpen(true);
    };

    const openReviewModal = (shift: Shift) => {
        setSelectedShift(shift);
        setReviewModalOpen(true);
    }

    const getStatusClass = (status: Shift['status']) => {
        switch (status) {
            case 'Open': return 'text-green-600 bg-green-100 border-green-200';
            case 'Approval Needed': return 'text-red-600 bg-red-100 border-red-200';
            case 'Filled': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'Expired': return 'text-gray-600 bg-gray-100 border-gray-200';
            case 'Completed': return 'text-gray-600 bg-gray-100 border-gray-200';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Shift Overview</h1>
                    <p className="text-muted-foreground">
                        Review and manage recently posted shifts for Subway - Downtown Core.
                    </p>
                </div>
                 <div className="flex items-center gap-4">
                    <Select value={filterDays} onValueChange={setFilterDays}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 Days</SelectItem>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                     <Button asChild>
                        <Link href="/dashboard/openings">
                            <Edit className="mr-2 h-4 w-4" />
                            Manage Postings
                        </Link>
                    </Button>
                </div>
            </div>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To/Applicants</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shifts.map((shift) => (
                                <TableRow key={shift.id}>
                                    <TableCell>
                                        <div className="font-medium">{shift.role}</div>
                                        <div className="text-sm text-muted-foreground">{shift.location.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div>{new Date(shift.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                        <div className="text-sm text-muted-foreground">{shift.startTime} - {shift.endTime}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusClass(shift.status)}>
                                            {shift.status}
                                        </Badge>
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
                                            <span>{shift.applicants?.length || 0}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                {shift.status === 'Approval Needed' && (
                                                    <DropdownMenuItem onClick={() => openApplicantsModal(shift)}>View Applicants</DropdownMenuItem>
                                                )}
                                                {shift.status === 'Completed' && shift.assignedTo && (
                                                    <DropdownMenuItem onClick={() => openReviewModal(shift)}>Review Employee</DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem>Edit Shift</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
        </div>
    );
}

export default function DashboardPage() {
    const [isClient, setIsClient] = useState(false);
    const [userRole, setUserRole] = useState<'employee' | 'manager' | null>(null);
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);

    useEffect(() => {
        const role = (localStorage.getItem('userRole') as 'employee' | 'manager') || 'employee';
        const user = employees.find(e => e.role === role);
        setUserRole(role);
        setCurrentUser(user || staticUser);
        setIsClient(true);
    }, []);

    if (!isClient) {
        // Render nothing or a loading spinner on the server to avoid hydration mismatch
        return null;
    }

    if (userRole === 'manager') {
        return <ManagerDashboard />;
    }

    // Default Employee Dashboard
    return (
        <div className="space-y-8">
            <div>
                 {currentUser && <h1 className="text-3xl font-bold font-headline">Welcome back, {currentUser.name.split(' ')[0]}!</h1>}
                <p className="text-muted-foreground">
                    Here are shifts available for you.
                </p>
            </div>

            <section>
                <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                    <Briefcase className="w-6 h-6" />
                    All Open Shifts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allShifts.filter(shift => shift.status === 'Open' && (!currentUser || !shift.applicants?.find(a => a.id === currentUser.id))).map(shift => (
                        <ShiftCard key={shift.id} shift={shift} />
                    ))}
                </div>
            </section>
        </div>
    );
}
