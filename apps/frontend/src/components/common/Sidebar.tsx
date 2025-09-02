import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Menu, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import GlassDropdown from "./GlassDropdown";
import { Input } from "../ui/input";
import { RiFileHistoryLine } from "react-icons/ri";
import type { Dispatch, SetStateAction } from "react";

interface SidebarProps {
  selectedBoard: string;
  setSelectedBoard: Dispatch<SetStateAction<string>>;
  selectedSubject: string;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  selectedMarks: string;
  setSelectedMarks: Dispatch<SetStateAction<string>>;
  selectedDuration: string;
  setSelectedDuration: Dispatch<SetStateAction<string>>;
}

// ************** Dummy Data ********************
const boardOptions = [
  { value: "", label: "Select Board" },
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE" },
];

const subjectOptions = [
  { value: "", label: "Select Subject" },
  { value: "Maths", label: "Maths" },
  { value: "Physics", label: "Physics" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Biology", label: "Biology" },
];

function Sidebar({
  selectedBoard,
  setSelectedBoard,
  selectedSubject,
  setSelectedSubject,
  selectedMarks,
  setSelectedMarks,
  selectedDuration,
  setSelectedDuration,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ********************  Dropdown states *******************************
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const boardOptions = [
    { value: "", label: "Select Board" },
    { value: "CBSE", label: "CBSE" },
    { value: "ICSE", label: "ICSE" },
    { value: "State", label: "State Board" },
  ];

  const subjectOptions = [
    { value: "", label: "Select Subject" },
    { value: "Maths", label: "Maths" },
    { value: "Physics", label: "Physics" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Biology", label: "Biology" },
  ];

  const marksOptions = [
    { value: "", label: "Select Marks" },
    { value: "50", label: "50" },
    { value: "80", label: "80" },
    { value: "100", label: "100" },
  ];

  return (
    <>
      {/* 🔑 Hamburger button for mobile */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 text-gray-300 hover:text-white 
          bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* 🔑 Background overlay for mobile */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: isMobile ? -320 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? -320 : 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed z-50 md:relative inset-y-0 left-0 w-80 
             bg-gradient-to-br from-slate-900/10 via-indigo-900/10 to-purple-900/10
             shadow-[0_8px_32px_rgba(0,0,0,0.35)]
             rounded-r-3xl md:rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10"
          >
            <div className="absolute inset-0 bg-white/10 z-0"></div>

            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="absolute z-100 top-4 right-4 text-gray-300 hover:text-white 
                 bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/20 "
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Dropdown Navigation */}
            <nav className="p-5 flex-1 overflow-y-auto relative z-10">
              <ul className="space-y-4">
                {/* Board Dropdown */}
                <li>
                  <GlassDropdown
                    label="Board"
                    value={selectedBoard}
                    onChange={(value) => setSelectedBoard(String(value))}
                    options={boardOptions}
                    placeholder="Select Board"
                  />
                </li>

                {/* Subject Dropdown */}
                <li>
                  <GlassDropdown
                    label="Subject"
                    value={selectedSubject}
                    onChange={(value) => setSelectedSubject(String(value))}
                    options={subjectOptions}
                    placeholder="Select Subject"
                  />
                </li>

                {/* Marks Input */}
                <li>
                  <label className="text-gray-300 text-sm mb-1 block">
                    Total Marks
                  </label>
                  <Input
                    type="number"
                    value={selectedMarks}
                    onChange={(e) => setSelectedMarks(e.target.value)}
                    placeholder="Enter total marks"
                    className="w-full bg-white/10 backdrop-blur-md text-gray-100 p-2 rounded-lg border border-white/20 
                       focus:ring-2 focus:ring-indigo-400/40 hover:bg-white/20 transition-colors
                       placeholder:text-gray-400"
                  />
                </li>
                <li>
                  <label className="text-gray-300 text-sm mb-1 block">
                    Total Duration
                  </label>
                  <Input
                    type="number"
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    placeholder="Enter total duration"
                    className="w-full bg-white/10 backdrop-blur-md text-gray-100 p-2 rounded-lg border border-white/20 
                       focus:ring-2 focus:ring-indigo-400/40 hover:bg-white/20 transition-colors
                       placeholder:text-gray-400"
                  />
                </li>
              </ul>

              {/* Previous Year Questions Section */}
              <div className="mt-8">
                <h3
                  className="text-gray-200 font-medium mb-3 flex items-center cursor-pointer select-none"
                  onClick={() => setOpen(!open)}
                >
                  <BookOpen className="h-4 w-4 mr-2 text-indigo-400" />
                  Previous Year Questions
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-2"
                  >
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </motion.span>
                </h3>

                <AnimatePresence>
                  {open && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {["2021", "2020", "2019", "2018"].map((year) => (
                        <motion.li
                          key={year}
                          whileHover={{ x: 5 }}
                          className="px-3 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-indigo-600/40 cursor-pointer transition"
                        >
                          {year} Question Paper
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-8">
                <h3 className="text-gray-200 font-medium mb-3 flex items-center">
                  <RiFileHistoryLine className="h-4 w-4 mr-2 text-indigo-400" />
                  Previous Generated Questions
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-2"
                  >
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </motion.span>
                </h3>
                <AnimatePresence>
                  {open && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {["2021", "2020", "2019", "2018"].map((year) => (
                        <motion.li
                          key={year}
                          whileHover={{ x: 5 }}
                          className="px-3 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-indigo-600/40 cursor-pointer transition"
                        >
                          {year} Question Paper
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
