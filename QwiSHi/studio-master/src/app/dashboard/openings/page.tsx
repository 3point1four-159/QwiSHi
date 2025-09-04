
'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { shifts } from "@/lib/data"
import { PlusCircle, Calendar, Clock, Users, Edit } from "lucide-react"

export default function OpeningsPage() {
    // Mocking for one location, but we can imagine this being dynamic based on manager's locations.
    const myOpenings = shifts.filter(s => s.location.name === 'Subway - Downtown Core'); 

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Your Openings</h1>
                    <p className="text-muted-foreground">
                        Manage your location's posted shifts for Subway - Downtown Core.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/openings/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Post New Opening
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myOpenings.map(shift => (
                    <Card key={shift.id} className="flex flex-col">
                        <CardHeader>
                             <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="font-headline text-xl">{shift.role}</CardTitle>
                                    <CardDescription>{shift.location.name}</CardDescription>
                                </div>
                                <Badge variant={shift.status === 'Open' ? 'secondary' : 'outline'} className={
                                    shift.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                                    shift.status === 'Filled' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }>{shift.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                             <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{shift.startTime} - {shift.endTime}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{shift.applicants?.length || 0} Applicants</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Shift
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
