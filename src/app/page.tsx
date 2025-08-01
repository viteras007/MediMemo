import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NewspaperIcon, ArrowRightIcon } from "lucide-react";

export default function LandingPage() {
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

        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
      </header>

      {/* Main Content - Split Layout */}
      <main className="flex-1 flex max-w-4xl mx-auto items-center px-5 md:px-2 py-8 md:pt-0">
        {/* Left Side - Call to Action */}
        <div className="w-full md:w-1/2 max-w-[400px] flex flex-col justify-center items-center md:items-start">
          <div className="max-w-md text-center md:text-left">
            <div className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-sm text-sm mb-5">
              100% free & open source
            </div>

            {/* Main Headline */}
            <div className="space-y-4 mb-6">
              <h1 className="text-[32px] font-bold flex items-center justify-center md:justify-start gap-4 flex-wrap text-gray-900 font-mono leading-4">
                <span>Medical Report</span>
                <span className="inline-flex items-center">→</span>
                <span>Plain English</span>
              </h1>
              <p className="text-xl text-gray-600">
                Upload your medical reports and get clear, easy-to-understand
                explanations.
              </p>
            </div>

            {/* Upload Button */}
            <div className="flex justify-center md:justify-start">
              <div className="flex flex-col items-center">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gray-900 hover:bg-gray-800 text-white h-12 px-6 cursor-pointer"
                  >
                    <NewspaperIcon className="mr-2" /> Upload Medical Report
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-2">Takes 1 minute!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image Placeholder */}
        <div className="w-full md:w-1/2 flex justify-center items-center flex-1 relative max-h-[700px] min-w-[50%] lg:min-w-[500px]">
          <div className="w-full max-w-[350px] h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h1>image</h1>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between p-6 border-t text-sm text-gray-500">
        <div>Powered by Together.ai & Qwen 2.5 72B</div>

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
