import Image from "next/image";
import { Plus } from "lucide-react";
import divineMercy from "@/app/assets/icons/divine_mercy.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Banner Pane */}
      <div className="relative hidden lg:w-[60%] overflow-hidden lg:block">
        <Image
          src={divineMercy}
          alt="Divine Mercy"
          fill
          sizes="(max-width: 1024px) 1px, 60vw"
          className="object-contain"
        />
        <div className="absolute inset-0 bg-primary/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t from-primary/70 via-primary/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col p-10 text-white">
          <div className="flex items-center justify-between">
            <Plus className="h-6 w-6 opacity-70" />
          </div>

          <div className="mt-auto max-w-lg">
            <p className="mb-3 text-xs font-semibold uppercase opacity-70">
              Community Management
            </p>
            <h1 className="font-serif text-5xl font-extrabold md:text-6xl lg:text-7xl">
              Friends of the <br />
              <span className="italic">Divine Mercy</span>
            </h1>
            <div className="my-10 h-px w-20 bg-white/30" />
            <p className="max-w-md text-sm leading-relaxed opacity-80">
              A community united in faith, prayer, and the mission of spreading
              God's mercy to all.
            </p>

            <div className="mt-20 space-y-1 border-l border-white/30 pl-5 italic opacity-80">
              <p className="text-sm">"Jesus, I trust in You."</p>
              <p className="text-[10px] not-italic pl-5">
                — St. Faustina Kowalska
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Pane */}
      <div className="flex w-full flex-col justify-center px-5 lg:w-[40%]">
        <div className="mx-auto w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}
