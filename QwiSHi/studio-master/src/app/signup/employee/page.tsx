
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Logo from "@/components/logo"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const formSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
    businessName: z.string().optional(),
    taxClassification: z.enum(["individual", "c-corp", "s-corp", "partnership", "trust", "llc"], {
        required_error: "You need to select a tax classification."
    }),
    address: z.string().min(5, { message: "A valid address is required." }),
    city: z.string().min(2, { message: "A valid city is required." }),
    state: z.string().min(2, { message: "A valid state is required." }),
    zip: z.string().regex(/^\d{5}(?:[-\s]\d{4})?$/, { message: "Invalid ZIP code format." }),
    tinType: z.enum(["ssn", "ein"]),
    tin: z.string().regex(/^\d{2}-\d{7}$|^\d{3}-\d{2}-\d{4}$/, {
        message: "Invalid SSN (XXX-XX-XXXX) or EIN (XX-XXXXXXX) format.",
    }),
    certification: z.boolean().refine(val => val === true, {
        message: "You must certify that the information provided is correct.",
    }),
});

export default function EmployeeOnboardingPage() {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            businessName: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            tinType: "ssn",
            tin: "",
            certification: false,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast({
            title: "Onboarding Complete!",
            description: "Your information has been submitted successfully. Welcome to QwiSHi!",
        });
        // Redirect to login after successful submission
        router.push('/login/employee');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
            <Card className="w-full max-w-2xl">
                 <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <CardTitle className="text-2xl font-bold font-headline">Employee Onboarding</CardTitle>
                    <CardDescription>Please provide the following information to get started. Fields marked with <span className="text-destructive">*</span> are required.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name (as shown on your income tax return) <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="John M. Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="businessName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Name / Disregarded Entity Name (if different from above)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Optional" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                control={form.control}
                                name="taxClassification"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Federal Tax Classification <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="individual" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Individual/sole proprietor or single-member LLC
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="c-corp" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            C Corporation
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="s-corp" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            S Corporation
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="partnership" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Partnership
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="trust" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Trust/estate
                                            </FormLabel>
                                        </FormItem>
                                         <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="llc" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Limited liability company
                                            </FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                            <div className="space-y-4">
                                <Label>Address <span className="text-destructive">*</span></Label>
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Street Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Street Address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">City</FormLabel>
                                                <FormControl><Input placeholder="City" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                 <FormLabel className="sr-only">State</FormLabel>
                                                <FormControl><Input placeholder="State" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="zip"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">ZIP Code</FormLabel>
                                                <FormControl><Input placeholder="ZIP Code" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <FormField
                                control={form.control}
                                name="tin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Taxpayer Identification Number (TIN) <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="XXX-XX-XXXX or XX-XXXXXXX" {...field} />
                                        </FormControl>
                                         <FormDescription>
                                            This is required for tax purposes. We do not store this information.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="certification"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                               Certification <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormDescription>
                                                Under penalties of perjury, I certify that the information provided is true, correct, and complete.
                                            </FormDescription>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            
                            <div className="flex flex-col gap-4">
                                <Button type="submit" className="w-full">Create Account</Button>
                                <div className="text-center text-sm">
                                    Already have an account?{" "}
                                    <Link href="/login/employee" className="underline">
                                    Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );

    