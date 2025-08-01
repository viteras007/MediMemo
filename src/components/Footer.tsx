import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="flex items-center justify-between p-6 text-sm text-gray-500 max-w-4xl mx-auto w-full">
        <div>Powered by Together.ai & Qwen 2.5 72B</div>

        <div className="flex items-center gap-3">
          <Link
            href="https://github.com"
            target="_blank"
            className="cursor-pointer"
          >
            <Button variant="outline" size="sm">
              <Github className="h-4 w-4" />
            </Button>
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            className="cursor-pointer"
          >
            <Button variant="outline" size="sm">
              <Linkedin className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}
