import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  value: string | number;
};

type GlassDropdownProps = {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
};

function GlassDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
}: GlassDropdownProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div>
      <label className="text-gray-300 text-sm mb-1 block">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-full bg-white/10 backdrop-blur-md text-gray-100 p-2 rounded-lg border border-white/20 
                     focus:ring-2 focus:ring-indigo-400/40 flex items-center justify-between hover:bg-white/20 transition-colors"
          >
            <span className={value ? "text-gray-100" : "text-gray-400"}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg 
                   shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-1"
          align="start"
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className="text-gray-100 hover:bg-white/20 focus:bg-white/20 rounded-md cursor-pointer
                       transition-colors duration-200"
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default GlassDropdown;
