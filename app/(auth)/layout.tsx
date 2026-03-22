import Image from "next/image";
import { Plus } from "lucide-react";
import divineMercy from "@/app/assets/media/divine-mercy.png";
import { Reveal } from "@/components/shared/animations/reveal";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen max-w-480 mx-auto border-x">
      {/* Banner Pane */}
      <div className="relative hidden lg:w-[60%] overflow-hidden lg:block">
        <div className="absolute inset-0 h-full w-full">
          <Image
            src={divineMercy}
            alt="Divine Mercy"
            fill
            sizes="(max-width: 1024px) 1px, 60vw"
            className="object-contain"
            placeholder="blur"
          />
        </div>

        {/* Static Overlays */}
        <div className="absolute inset-0 bg-primary/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t from-primary/70 via-primary/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col p-10 text-white">
          <Reveal
            direction="none"
            immediate
            className="flex items-center justify-between"
          >
            <Plus className="h-6 w-6 opacity-70" />
          </Reveal>

          <div className="mt-auto max-w-lg">
            <Reveal direction="left" immediate className="space-y-2">
              <p className="mb-3 text-xs font-semibold uppercase opacity-70">
                Community Management
              </p>
              <h1 className="font-serif text-5xl font-extrabold md:text-6xl lg:text-7xl">
                Friends of the <br />
                <span className="italic">Divine Mercy</span>
              </h1>
              <div className="my-10 h-px w-20 bg-white/30" />
              <p className="max-w-md text-sm leading-relaxed opacity-80">
                A community united in faith, prayer, and the mission of
                spreading God's mercy to all.
              </p>
            </Reveal>

            <Reveal
              direction="left"
              delay={0.3}
              immediate
              className="mt-20 space-y-1 border-l border-white/30 pl-5 italic opacity-80"
            >
              <p className="text-sm"> &ldquo;Jesus, I trust in You.&rdquo;</p>
              <p className="text-[10px] not-italic pl-5">
                &mdash; St. Faustina Kowalska
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Form Pane - Animated Form Area */}
      <div className="flex w-full flex-col justify-center px-5 md:px-8 lg:w-[40%]">
        <Reveal direction="up" immediate>
          {children}
        </Reveal>
      </div>
    </div>
  );
}
