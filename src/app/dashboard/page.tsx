import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { Search } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="max-w-md mx-auto space-y-6">
          {/* Upload Instructions */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Upload your medical report
            </h1>
            <p className="text-gray-600">
              Get a clear, easy-to-understand explanation of your medical
              results
            </p>
          </div>

          {/* Upload Area */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                {/* Medical document icon */}
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Upload PDF</h3>
                  <p className="text-sm text-gray-500">
                    Medical report or lab results
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate button */}
          <div className="flex justify-center">
            <Button className="cursor-pointer relative group flex items-center bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 h-auto text-base overflow-hidden">
              <div className="h-[120px] w-10 bg-gradient-to-r from-white/10 via-white/50 to-white/10 absolute blur-sm -rotate-45 -left-16 group-hover:left-[150%] duration-500 delay-200" />
              <Search className="h-5 w-5 mr-2 relative" />
              <span className="relative">Analyze Report</span>
              <BorderBeam colorFrom="#5d5d5d" colorTo="#ffffff" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
