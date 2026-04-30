"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/utils";

export interface AccordionItemData {
  id: string;
  title: string;
  imageUrl: string;
}

interface AccordionItemProps {
  item: AccordionItemData;
  isActive: boolean;
  onActivate: () => void;
}

function AccordionItem({ item, isActive, onActivate }: AccordionItemProps) {
  return (
    <button
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      aria-pressed={isActive}
      aria-label={item.title}
      className={cn(
        "group relative w-full shrink-0 cursor-pointer overflow-hidden rounded-xl",
        "transition-[width,height] duration-700 ease-in-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isActive
          ? "h-[360px] md:h-[500px] md:w-[600px]"
          : "h-[60px] md:h-[500px] md:w-[50px]",
      )}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          const target = e.currentTarget;
          target.onerror = null;
          target.src =
            "https://placehold.co/400x600/2d3748/ffffff?text=Image+Error";
        }}
      />

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isActive
            ? "bg-linear-to-t from-black/70 via-black/20 to-transparent"
            : "bg-black/55",
        )}
      />

      <div
        className={cn(
          "absolute right-1/2 flex items-center justify-center transition-all duration-500 ease-in-out",
          isActive
            ? "bottom-5 translate-x-1/2 translate-y-0"
            : "bottom-1/2 translate-x-1/2 translate-y-1/2 md:bottom-5 md:translate-x-0 md:translate-y-0",
        )}
      >
        <span
          className={cn(
            "font-semibold whitespace-nowrap text-white",
            "transition-all duration-500 ease-in-out md:origin-right",
            isActive
              ? "rotate-0 text-base md:text-lg"
              : "rotate-0 py-1 text-sm md:rotate-90 md:text-base",
          )}
        >
          {item.title}
        </span>
      </div>
    </button>
  );
}

interface InteractiveImageAccordionProps {
  items: AccordionItemData[];
  defaultActiveIndex?: number;
  className?: string;
  onActiveChange?: (index: number) => void;
}

export function InteractiveImageAccordion({
  items,
  defaultActiveIndex = 0,
  className,
  onActiveChange,
}: InteractiveImageAccordionProps) {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

  function handleActivate(index: number) {
    setActiveIndex(index);
    onActiveChange?.(index);
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-stretch justify-center gap-2 md:flex-row md:items-center",
        className,
      )}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onActivate={() => handleActivate(index)}
        />
      ))}
    </div>
  );
}
