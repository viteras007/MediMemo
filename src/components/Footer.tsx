export function Footer() {
  return (
    <footer className="border-t">
      <div className="flex items-center justify-between p-6 text-sm text-gray-500 max-w-4xl mx-auto w-full">
        <div>Powered by Together.ai & Qwen 2.5 72B</div>

        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs">📁</span>
          </div>
          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs">💼</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
