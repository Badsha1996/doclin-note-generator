import React, { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MinusIcon } from "lucide-react";

interface CustomOTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export const InputOTP: React.FC<CustomOTPInputProps> = ({
  value,
  onChange,
  length = 6,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Build fixed-length array representation (can include undefineds)
  const valueArray = Array.from({ length }, (_, i) =>
    value[i] !== "_" ? value[i] : undefined
  );

  const handleChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const newValueArray = [...valueArray];
    if (char) newValueArray[index] = char;
    else newValueArray[index] = undefined;

    onChange(newValueArray.map((c) => (c === undefined ? "_" : c)).join(""));

    // Move to next if user entered a value
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const key = e.key;

    if (key === "Backspace") {
      const newValueArray = [...valueArray];
      newValueArray[index] = undefined;
      onChange(newValueArray.map((c) => (c === undefined ? "_" : c)).join(""));
      if (index > 0 && !valueArray[index]) {
        inputsRef.current[index - 1]?.focus();
      }
      e.preventDefault();
    } else if (key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim().slice(0, length);
    const newArr = Array.from({ length }, (_, i) => paste[i] ?? undefined);
    onChange(newArr.map((c) => (c === undefined ? "_" : c)).join(""));
    const next = paste.length < length ? paste.length : length - 1;
    inputsRef.current[next]?.focus();
  };
  const handleFocus = (index: number) => {
    const input = inputsRef.current[index];
    if (!input) return;

    // Defer until after render
    requestAnimationFrame(() => {
      const length = input.value.length;
      input.setSelectionRange(length, length);
    });
  };

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div className="flex items-center gap-2" data-slot="input-otp">
      {Array.from({ length }).map((_, i) => (
        <>
          <Input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="text"
            maxLength={1}
            value={valueArray[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(i)}
            className="w-10 h-10 text-center text-lg font-semibold bg-white/20 border-white/30 text-white rounded-md focus:ring-2 focus:ring-purple-400"
          />

          {i === 2 && (
            <div data-slot="input-otp-separator" role="separator">
              <MinusIcon />
            </div>
          )}
        </>
      ))}
    </div>
  );
};
