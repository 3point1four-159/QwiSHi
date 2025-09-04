'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import React, { useState } from "react"

const timeSlots = [
    "Morning (6am - 12pm)",
    "Afternoon (12pm - 5pm)",
    "Evening (5pm - 10pm)",
    "Late Night (10pm - 4am)",
]

export default function AvailabilityPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const { toast } = useToast()

    const handleSave = () => {
        toast({
            title: "Availability Updated",
            description: "Your new availability has been saved successfully.",
        })
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Set Your Availability</h1>
                <p className="text-muted-foreground">
                    Let companies know when you're available to pick up shifts.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Weekly Template</CardTitle>
                    <CardDescription>Select the days and times you are typically available to work.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-4">Availability</h3>
                            {timeSlots.map(slot => (
                                <div key={slot} className="flex items-center space-x-2 mb-2">
                                    <Checkbox id={slot} />
                                    <label htmlFor={slot} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {slot}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div>
                             <h3 className="font-semibold mb-4">Days of the Week</h3>
                             <div className="flex items-center space-x-2 mb-2">
                                <Checkbox id="monday" />
                                <label htmlFor="monday">Monday</label>
                             </div>
                             <div className="flex items-center space-x-2 mb-2">
                                <Checkbox id="tuesday" />
                                <label htmlFor="tuesday">Tuesday</label>
                             </div>
                             <div className="flex items-center space-x-2 mb-2">
                                <Checkbox id="wednesday" />
                                <label htmlFor="wednesday">Wednesday</label>
                             </div>
                              <div className="flex items-center space-x-2 mb-2">
                                <Checkbox id="thursday" />
                                <label htmlFor="thursday">Thursday</label>
                             </div>
                             <div className="flex items-center space-x-2 mb-2">
                                <Checkbox id="friday" />
                                <label htmlFor="friday">Friday</label>
                             </div>
                             <div className="flex items-center space-x-2 mb-2">
                                <Checkbox id="saturday" />
                                <label htmlFor="saturday">Saturday</label>
                             </div>
                             <div className="flex items-center space-x-2 mb-2">
                                <Checkbox id="sunday" />
                                <label htmlFor="sunday">Sunday</label>
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Specific Dates</CardTitle>
                    <CardDescription>Add or override your availability for specific dates.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
