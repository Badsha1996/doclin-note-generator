import { type JSX } from "react";
import { motion } from "framer-motion";

type Option = {
  key: string;
  icon: JSX.Element;
};
type DashboardNavProps = {
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
};
function DashboardNav({ value, onChange, options }: DashboardNavProps) {
  const selectedOption = options.find((opt) => opt.key === value);
  return (
    <div
      className="bg-gray-100 backdrop-blur-md 
               rounded-xl w-56 h-full pt-4"
    >
      <div className="relative top-[10%]">
        {options.map((menu_option, idx) => (
          <div
            key={idx}
            onClick={() => onChange(menu_option.key)}
            className="cursor-pointer relative overflow-hidden mb-2 py-1"
          >
            <motion.div
              animate={{
                backgroundColor:
                  menu_option.key === selectedOption?.key
                    ? "#ffffff"
                    : "transparent",
                x: menu_option.key === selectedOption?.key ? 20 : 0,
                scale: menu_option.key === selectedOption?.key ? 1.05 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className={`text-slate-700 p-2 ml-5 relative rounded-l-3xl `}
            >
              <motion.div
                animate={{
                  x: menu_option.key === selectedOption?.key ? 5 : 0,
                }}
                transition={{ duration: 0.3 }}
                className={`flex gap-2 items-center ${menu_option.key === selectedOption?.key ? "text-indigo-500" : ""}`}
              >
                {menu_option.icon}
                {menu_option.key}
              </motion.div>
            </motion.div>

            {menu_option.key === selectedOption?.key && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute top-0 left-0 h-full w-2 bg-indigo-500 rounded-r-lg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardNav;
