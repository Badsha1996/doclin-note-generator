import { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { cn } from "@/lib/utils";

type RatingProps = {
  max?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  className?: string;
  readOnly?: boolean;
};

export function Rating({
  max = 5,
  value,
  defaultValue = 0,
  onChange,
  className,
  readOnly = false,
}: RatingProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const rating = value ?? internalValue;

  const updateValue = (val: number) => {
    if (readOnly) return;
    setInternalValue(val);
    onChange?.(val);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, i) => {
        const index = i + 1;
        let starIcon;
        if (rating >= index) {
          starIcon = <FaStar />;
        } else if (rating >= index - 0.5) {
          starIcon = <FaStarHalfAlt />;
        } else {
          starIcon = <FaRegStar />;
        }

        return (
          <div key={index} className="relative text-2xl text-yellow-600">
            {starIcon}
            {!readOnly && (
              <div className="absolute inset-0 flex">
                <button
                  type="button"
                  className="w-1/2 h-full cursor-pointer"
                  onClick={() => updateValue(index - 0.5)}
                />
                <button
                  type="button"
                  className="w-1/2 h-full cursor-pointer"
                  onClick={() => updateValue(index)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
