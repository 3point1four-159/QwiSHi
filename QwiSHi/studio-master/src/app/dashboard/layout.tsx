
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Bell,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  Home,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import Logo from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { currentUser as staticUser, employees } from '@/lib/data';
import type { Employee } from '@/lib/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'employee';
    const user = employees.find(e => e.role === role);
    setCurrentUser(user || staticUser);
  }, []);

  if (!currentUser) {
    // You can render a loading skeleton here if you'd like
    return null; 
  }

  const isManager = currentUser.role === 'manager';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {!isManager && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="My Schedule">
                    <Link href="/dashboard/schedule">
                      <CalendarCheck />
                      <span>My Schedule</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Availability">
                    <Link href="/dashboard/availability">
                      <CalendarClock />
                      <span>Availability</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}

            {isManager && (
              <>
                <Separator className="my-2" />
                <p className="px-4 py-2 text-xs text-muted-foreground font-semibold">For Locations</p>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Shift Scheduler">
                    <Link href="/dashboard/schedule">
                      <Users />
                      <span>Shift Scheduler</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Openings">
                    <Link href="/dashboard/openings">
                      <Briefcase />
                      <span>Openings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="/dashboard/profile">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Logout">
                <Link href="/">
                  <LogOut />
                  <span>Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b h-16">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background/90">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
