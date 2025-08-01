import { TopMenu } from "@/components/TopMenu";
import { Footer } from "@/components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopMenu />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
