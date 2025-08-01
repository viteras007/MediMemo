"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, User } from "lucide-react";
import { usePathname } from "next/navigation";

export function TopMenu() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <header className="flex items-center justify-between p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="text-xl font-semibold">MediMemo</span>
      </div>

      <div className="flex items-center gap-3">
        {!isDashboard ? (
          <>
            <Link href="https://github.com" target="_blank">
              <Button variant="outline" size="sm">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button size="sm">Sign Up</Button>
            </Link>
          </>
        ) : (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        )}
      </div>
    </header>
  );
}
