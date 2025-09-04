
'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Logo from "@/components/logo"
import Link from "next/link"
import { setCurrentUser } from "@/lib/data"
import { useRouter } from "next/navigation"

export default function ManagerLoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    setCurrentUser('manager');
    router.push('/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
         <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
                 <Logo />
            </div>
          <CardTitle className="text-2xl font-bold font-headline">Manager Login</CardTitle>
          <CardDescription>Enter your credentials to manage your locations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="manager@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
           <Button className="w-full" onClick={handleLogin}>
            Login
          </Button>
          <div className="text-center text-sm">
            Not a manager?{" "}
            <Link href="/login/employee" className="underline">
              Login as an employee
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
