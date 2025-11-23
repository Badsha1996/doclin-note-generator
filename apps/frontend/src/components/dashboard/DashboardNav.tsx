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
      className="bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.1)_100%)]
               rounded-xl w-full lg:w-56 h-12 lg:h-full lg:pt-4"
    >
      <div className="relative top-[10%] flex lg:block">
        {options.map((menu_option, idx) => (
          <div
            key={idx}
            onClick={() => onChange(menu_option.key)}
            className="cursor-pointer relative overflow-hidden mb-2 py-1 flex-1"
          >
            <motion.div
              animate={{
                backgroundColor:
                  menu_option.key === selectedOption?.key
                    ? "rgba(255, 255, 255, 0.10)"
                    : "transparent",
                x: menu_option.key === selectedOption?.key ? 20 : 0,
                scale: menu_option.key === selectedOption?.key ? 1.05 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className={`text-white p-2 ml-5 relative rounded-l-3xl`}
            >
              <motion.div
                animate={{
                  x: menu_option.key === selectedOption?.key ? 5 : 0,
                }}
                transition={{ duration: 0.3 }}
                className={`flex gap-2 items-center ${menu_option.key === selectedOption?.key ? "text-indigo-200" : ""}`}
              >
                {menu_option.icon}
                {menu_option.key}
              </motion.div>
            </motion.div>

            {menu_option.key === selectedOption?.key && (
              <motion.div
                layoutId="sidebar-indicator"
                className="hidden lg:block absolute top-0 left-0 h-full w-2 bg-indigo-200 rounded-r-lg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardNav;
