"use client";

import { useState } from "react";
import { Copy, Check, Wifi } from "lucide-react";
import { FcSimCardChip } from "react-icons/fc";
import { paymentMethods, type PaymentMethod } from "@/config/donations";
import { Reveal } from "@/components/shared/animations/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function PaymentCard({
  method,
  index,
}: {
  method: PaymentMethod;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(method.number.replace(/\s+/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  };

  return (
    <Reveal direction="up" delay={index * 0.12}>
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ background: method.gradient, boxShadow: method.shadow }}
      >
        {/* Decorative circles */}
        <div
          className="pointer-events-none absolute rounded-full bg-white/10"
          style={{ width: 290, height: 290, top: -90, right: -50 }}
        />
        <div
          className="pointer-events-none absolute rounded-full bg-white/8"
          style={{ width: 180, height: 180, top: 110, left: -50 }}
        />

        {/* Card content */}
        <div className="relative z-10 flex h-full flex-col p-5">
          {/* Brand name + type + optional purpose badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-baseline gap-2 mb-5">
              <span className="font-black text-white leading-none text-2xl">
                {method.name}
              </span>
              <span className="text-xs text-white/80">{method.type}</span>
            </div>
            {method.purpose && (
              <Badge className="shrink-0 bg-white/20 text-[10px] uppercase tracking-widest text-white">
                {method.purpose}
              </Badge>
            )}
          </div>

          {/* Chip + NFC */}
          <div className="mt-2 flex items-center justify-between">
            <FcSimCardChip className="size-12 opacity-90" />
            <Wifi className="size-6 rotate-90 text-white/70" />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Account number */}
          <div className="mt-2 mb-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              {method.numberLabel}
            </p>
            <p className="font-mono text-xl md:text-2xl font-semibold tracking-wider text-white">
              {method.number}
            </p>
          </div>

          {/* Account name + copy button */}
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold uppercase leading-snug text-white text-[11px]">
              {method.accountName}
            </p>
            <Button
              onClick={handleCopy}
              className="flex shrink-0 gap-2 rounded-full bg-white/20 px-3 py-2 text-[10px] transition-colors hover:bg-white/30"
            >
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied ? "Copied!" : "Tap to Copy"}
            </Button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function DonationsCards() {
  return (
    <section className="px-5 py-10 md:px-10 md:py-20">
      {/* Section header */}
      <Reveal
        direction="up"
        className="mx-auto mb-10 max-w-4xl space-y-5 text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <p className="text-xs font-bold uppercase tracking-[5px] text-primary">
            Payment Methods
          </p>
          <span className="h-px w-10 bg-primary" />
        </div>
        <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold">
          Choose Your Donation Channel
        </h2>
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
          Tap the account number to copy it instantly. All payment details are
          verified.
        </p>
      </Reveal>

      {/* Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {paymentMethods.map((method, i) => (
          <PaymentCard key={method.id} method={method} index={i} />
        ))}
      </div>
    </section>
  );
}
