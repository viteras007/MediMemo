import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        {/* Upload Instructions */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Upload your medical report
          </h1>
          <p className="text-gray-600">
            Get a clear, easy-to-understand explanation of your medical results
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
                <p className="text-sm text-gray-500">Medical report or lab results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helper link */}
        <div className="text-center">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
            <span className="text-xs">ℹ️</span>
            How to upload medical reports
          </a>
        </div>

        {/* Generate button */}
        <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white">
          <span className="mr-2">🔍</span>
          Analyze Report
        </Button>
      </div>
    </div>
  );
} 