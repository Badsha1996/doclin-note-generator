import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Options } from "@/types/type";
import { ChevronDown } from "lucide-react";

type GlassDropdownProps = {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Options[];
  placeholder?: string;
  disabled?: boolean;
};

function GlassDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: GlassDropdownProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div>
      <label className="text-white text-base mb-1 block">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={disabled}
            className="w-full bg-white/10 backdrop-blur-md text-white p-2 rounded-lg border border-white/20 
                     focus:ring-2 focus:ring-indigo-400/40 flex items-center justify-between hover:bg-white/20 transition-colors"
          >
            <span className={value ? "text-white" : "text-white text-sm"}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        {!disabled && (
          <DropdownMenuContent
            className="w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg 
                   shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-1"
            align="start"
          >
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onChange(option.value)}
                className="text-white hover:bg-white/20 focus:bg-white/20 rounded-md cursor-pointer
                       transition-colors duration-200"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}

export default GlassDropdown;
