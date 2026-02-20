"use client";

import * as React from "react";
import { Dot } from "lucide-react";
import { cn } from "@/app/lib/utils";

// ------------------
// Types
// ------------------
type OTPSlot = {
  char: string;
  isActive: boolean;
  hasFakeCaret: boolean;
};

type OTPInputContextType = {
  slots: OTPSlot[];
  setChar: (index: number, char: string) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
};

// ------------------
// Context
// ------------------
const OTPInputContext = React.createContext<OTPInputContextType | null>(null);

// ------------------
// InputOTP Component
// ------------------
type InputOTPProps = {
  length: number;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  containerClassName?: string;
};

const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  ({ length, value = "", onChange, className, containerClassName }, ref) => {
    const [chars, setChars] = React.useState<string[]>(Array.from({ length }, (_, i) => value[i] || ""));
    const [activeIndex, setActiveIndex] = React.useState(0);

    const setChar = (index: number, char: string) => {
      const newChars = [...chars];
      newChars[index] = char;
      setChars(newChars);
      onChange?.(newChars.join(""));
      if (char && index < length - 1) setActiveIndex(index + 1);
    };

    const contextValue: OTPInputContextType = {
      slots: chars.map((char, i) => ({
        char,
        isActive: i === activeIndex,
        hasFakeCaret: i === activeIndex,
      })),
      setChar,
      activeIndex,
      setActiveIndex,
    };

    return (
      <OTPInputContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("flex items-center gap-2", containerClassName)}
        >
          {Array.from({ length }).map((_, index) => (
            <InputOTPSlot key={index} index={index} className={className} />
          ))}
        </div>
      </OTPInputContext.Provider>
    );
  }
);
InputOTP.displayName = "InputOTP";

// ------------------
// OTP Slot Component
// ------------------
type InputOTPSlotProps = {
  index: number;
  className?: string;
};

const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ index, className, ...props }, ref) => {
    const context = React.useContext(OTPInputContext);
    if (!context) throw new Error("InputOTPSlot must be used inside InputOTP");

    const { slots, setChar, setActiveIndex } = context;
    const { char, isActive, hasFakeCaret } = slots[index];

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Backspace") {
        setChar(index, "");
        setActiveIndex(Math.max(index - 1, 0));
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, "").slice(-1);
      setChar(index, val);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center border text-sm transition-all first:rounded-l-md last:rounded-r-md",
          isActive && "z-10 ring-2 ring-ring ring-offset-background",
          className
        )}
        {...props}
      >
        <input
          className="absolute inset-0 w-full h-full opacity-0 text-center"
          value={char}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus={isActive}
        />
        {char}
        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
          </div>
        )}
      </div>
    );
  }
);
InputOTPSlot.displayName = "InputOTPSlot";

// ------------------
// OTP Separator (optional)
// ------------------
const InputOTPSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <Dot />
    </div>
  )
);
InputOTPSeparator.displayName = "InputOTPSeparator";

// ------------------
// Exports
// ------------------
export { InputOTP, InputOTPSlot, InputOTPSeparator, OTPInputContext };
