import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="flex items-center justify-between p-6 text-sm text-gray-500 max-w-4xl mx-auto w-full">
        <div>Powered by Together.ai & Llama 3.3</div>

        <div className="flex items-center gap-3">
          <Link href="https://github.com" target="_blank">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Github className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="https://linkedin.com" target="_blank">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Linkedin className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}
