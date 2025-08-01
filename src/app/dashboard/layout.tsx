import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-semibold">MediMemo</span>
        </div>
        
        {/* Simple Sign Out Button */}
        <Link href="/">
          <Button variant="outline" size="sm">
            Sign Out
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between p-6 border-t text-sm text-gray-500">
        <div>
          Powered by Together.ai & Qwen 2.5 72B
        </div>
        
        <div className="flex items-center gap-4">
          {/* TODO: Add GitHub and LinkedIn icons here */}
          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs">📁</span>
          </div>
          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs">💼</span>
          </div>
        </div>
      </footer>
    </div>
  );
} 