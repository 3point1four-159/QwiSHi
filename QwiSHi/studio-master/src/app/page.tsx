
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login/employee">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup/employee">Sign Up <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="relative py-20 md:py-32 bg-card border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
              Flexible Work, Instantly Filled.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              QwiSHi connects skilled employees with companies needing to fill shifts quickly. Find work that fits your schedule, or find the right people to keep your business running smoothly.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/login/employee">Find a Shift <Briefcase className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login/manager">Fill a Shift <Users className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">How It Works</h2>
              <p className="mt-2 text-muted-foreground">A simple process for both employees and businesses.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-3">
                    <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full w-10 h-10">
                      1
                    </div>
                    Post & Browse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Locations post open shifts. Employees browse and apply for positions that match their skills and availability.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-3">
                    <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full w-10 h-10">
                      2
                    </div>
                    AI-Powered Matching
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Our smart system suggests the best candidates for shifts and the most relevant shifts for employees, ensuring a perfect fit.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-3">
                    <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full w-10 h-10">
                      3
                    </div>
                    Accept & Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Managers approve applicants, and employees get notified. It's that easy to schedule and get to work.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} QwiSHi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
