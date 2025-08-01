import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TopMenu } from "@/components/TopMenu";
import { Footer } from "@/components/Footer";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { BlurFade } from "@/components/ui/BlurFade";
import { NewspaperIcon } from "lucide-react";

export default function Home() {
  return (
    <>
      <TopMenu />

      <section className="flex-1 flex flex-col">
        <div className="flex flex-col min-h-[80vh]">
          {/* Main content */}
          <div className="flex-1 flex flex-col md:flex-row max-w-4xl mx-auto items-center py-8 md:pt-0">
            {/* Left side - Call to action */}
            <div className="w-full md:w-1/2 max-w-[378px] flex flex-col justify-center items-center md:items-start">
              <div className="max-w-md text-center md:text-left">
                <div className="inline-block font-mono gap-2.5 px-2.5 py-1.5 rounded bg-gray-100 text-sm mb-5 text-gray-600">
                  100% free & open source
                </div>

                <h1 className="text-[32px] font-bold mb-4 flex items-center justify-center md:justify-start gap-4 flex-wrap text-gray-900 font-mono leading-4">
                  <span>Medical Report</span>
                  <span className="inline-flex items-center">→</span>
                  <span>Plain English</span>
                  <br />
                  <span>
                    in one <span className="hidden sm:inline">minute</span>
                  </span>
                </h1>

                <p className="text-base text-gray-600 mb-[30px] font-mono text-center md:text-left">
                  Upload your medical reports and get clear, easy-to-understand
                  <br /> explanations in plain English.
                </p>

                <div className="relative flex flex-col items-center font-mono w-full md:w-fit">
                  <Link href="/dashboard">
                    <Button className="cursor-pointer relative group flex items-center bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 h-auto text-base overflow-hidden">
                      <div className="h-[120px] w-10 bg-gradient-to-r from-white/10 via-white/50 to-white/10 absolute blur-sm -rotate-45 -left-16 group-hover:left-[150%] duration-500 delay-200" />
                      <NewspaperIcon className="h-5 w-5 mr-2 relative" />
                      <span className="relative">Upload Medical Report</span>
                      <BorderBeam colorFrom="#5d5d5d" colorTo="#ffffff" />
                    </Button>
                  </Link>

                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Takes 1 minute!
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="w-full md:w-1/2 flex justify-center items-center flex-1 relative max-h-[900px] min-w-[60%] lg:min-w-[600px]">
              <div className="absolute inset-0 -bottom-4 rounded-3xl bg-black/5 blur-xl h-full"></div>
              <BlurFade delay={0.25} inView>
                <div className="relative w-full max-w-[900px] h-full rounded-lg overflow-hidden">
                  <img
                    src="/images/image-landing.png"
                    alt="Medical Report Analysis Preview"
                    className="w-full h-full object-contain object-center"
                    style={{
                      maxHeight: "900px",
                      maxWidth: "900px",
                      minHeight: "600px",
                    }}
                  />
                </div>
              </BlurFade>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
