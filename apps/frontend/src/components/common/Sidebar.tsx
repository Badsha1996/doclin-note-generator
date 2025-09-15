import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Menu, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { RiFileHistoryLine } from "react-icons/ri";
import { Input } from "../ui/input";
import type { Dispatch, SetStateAction } from "react";

import GlassDropdown from "./GlassDropdown";
import { useApi } from "@/hook/useApi";

interface SidebarProps {
  selectedBoard: string;
  setSelectedBoard: Dispatch<SetStateAction<string>>;
  selectedSubject: string;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  selectedMarks: string;
  setSelectedMarks: Dispatch<SetStateAction<string>>;
  selectedDuration: string;
  setSelectedDuration: Dispatch<SetStateAction<string>>;
  selectedUnit: string;
  setSelectedUnit: Dispatch<SetStateAction<string>>;
}

// ************** Dummy Data ********************

interface Board {
  value: string;
  label: string;
}
// Inside Sidebar component
const {
  data: boards = [],
  isLoading: isLoadingBoards,
  isError: isErrorBoards,
} = useApi<Board[]>({
  endpoint: "/boards",
  method: "GET",
});

const boardOptions = [{ value: "", label: "Select Board" }, ...(boards || [])];
const { data: subjects = [], isLoading: isLoadingSubjects } = useApi<Board[]>(
  {
    endpoint: "/subjects",
    method: "GET",
    // queryParams: { board: selectedBoard }, // assuming your API accepts ?board=CBSE
  }
  // {
  //   enabled: !!selectedBoard && !isCustom, // only fetch if board selected and not custom
  // }
);

const subjectOptions = [
  { value: "", label: "Select Subject" },
  ...(subjects || []),
];
const { data: previousPapers = [], isLoading: isLoadingPapers } = useApi<
  { year: string; title: string }[]
>(
  {
    endpoint: "/papers/previous",
    method: "GET",
    // queryParams: {
    //   board: selectedBoard,
    //   subject: selectedSubject,
    // },
  }
  // {
  //   enabled: !!selectedBoard && !!selectedSubject && open, // only fetch when section is open and filters are set
  // }
);
const timeUnit = [
  { value: "", label: "unit" },
  { value: "hrs", label: "hrs" },
  { value: "mins", label: "mins" },
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
  selectedUnit,
  setSelectedUnit,
}: SidebarProps) {
  // ****************** All states ********************
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  //Dropdown
  const [open, setOpen] = useState<boolean>(false);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // ******** Functions ***************
  const checkIsMobile = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) setIsOpen(true);
  };

  // *********** Effects ***************
  useEffect(() => {
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

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
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="absolute z-100 top-4 right-4 text-gray-300 hover:text-white 
                 bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/20 "
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/*************** Dropdown Navigation ***************/}
            <nav className="p-5 flex-1 overflow-y-auto relative z-10">
              <ul className="space-y-4">
                <li>
                  {isLoadingBoards ? (
                    <p className="text-gray-400">Loading boards...</p>
                  ) : isErrorBoards ? (
                    <p className="text-red-400">Failed to load boards</p>
                  ) : (
                    <GlassDropdown
                      label="Board"
                      value={isCustom ? "" : selectedBoard}
                      onChange={(value) => {
                        if (value === "Custom") {
                          setIsCustom(true);
                          setSelectedBoard("");
                        } else {
                          setIsCustom(false);
                          setSelectedBoard(String(value));
                        }
                      }}
                      options={boardOptions}
                      placeholder="Select Board"
                    />
                  )}

                  {isCustom && (
                    <Input
                      type="text"
                      value={selectedBoard}
                      onChange={(e) => setSelectedBoard(e.target.value)}
                      placeholder="Enter Title"
                      className="mt-2 w-full bg-white/10 backdrop-blur-md text-gray-100 p-2 rounded-lg border border-white/20 
focus:ring-2 focus:ring-indigo-400/40 hover:bg-white/20 transition-colors placeholder:text-white"
                    />
                  )}
                </li>
                <li>
                  {isLoadingSubjects ? (
                    <p className="text-gray-400">Loading subjects...</p>
                  ) : (
                    <GlassDropdown
                      label="Subject"
                      value={selectedSubject}
                      onChange={(value) => setSelectedSubject(String(value))}
                      options={subjectOptions}
                      placeholder="Select Subject"
                    />
                  )}
                </li>

                <li>
                  <label className="text-white text-base mb-1 block">
                    Total Marks
                  </label>
                  <Input
                    type="number"
                    value={selectedMarks}
                    onChange={(e) => setSelectedMarks(e.target.value)}
                    placeholder="Enter total marks"
                    className="w-full bg-white/10 backdrop-blur-md text-gray-100 p-2 rounded-lg border border-white/20 
     focus:ring-2 focus:ring-indigo-400/40 hover:bg-white/20 transition-colors
     placeholder:text-white
     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </li>
                <li>
                  <label className="text-white text-base mb-1 block">
                    Total Duration
                  </label>
                  <div className="flex flex-row items-center gap-2">
                    <Input
                      type="number"
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      placeholder="Enter total duration"
                      className="flex-1 bg-white/10 backdrop-blur-md text-white p-5 rounded-lg border border-white/20 
       focus:ring-2 focus:ring-indigo-400/40 hover:bg-white/20 transition-colors
       placeholder:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="flex-1">
                      <li>
                        <GlassDropdown
                          label=""
                          value={selectedUnit}
                          onChange={(value) => setSelectedUnit(String(value))}
                          options={timeUnit}
                          placeholder="Unit"
                        />
                      </li>
                    </div>
                  </div>
                </li>
              </ul>

              {/************* Previous Year Questions Section ***************/}
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
                      {isLoadingPapers ? (
                        <p className="px-3 py-2 text-gray-400">
                          Loading papers...
                        </p>
                      ) : (
                        previousPapers.map((paper) => (
                          <motion.li
                            key={paper.year}
                            whileHover={{ x: 5 }}
                            className="px-3 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-indigo-600/40 cursor-pointer transition"
                          >
                            {paper.title || `${paper.year} Question Paper`}
                          </motion.li>
                        ))
                      )}
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
