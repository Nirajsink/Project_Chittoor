"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { LogOut } from "lucide-react";

export default function AppHeader({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-primary">Student Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            {user?.fullName ? `Welcome, ${user.fullName} - Class ${user.class}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="outline" size="icon" onClick={onLogout} aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
