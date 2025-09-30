import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Menu, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

import { Input } from "../ui/input";
import type { Dispatch, SetStateAction } from "react";

import GlassDropdown from "./GlassDropdown";
import { useApi } from "@/hook/useApi";
import {
  boardResponseSchema,
  prevExamPaperResponseSchema,
  prevYearsResponseSchema,
  subjectResponseSchema,
} from "@/types/api";
import { useNavigate } from "@tanstack/react-router";

// ************** Props ********************
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

// *************** Dummy Data *********************

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
}: SidebarProps) {
  // ****************** All states ********************
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  //Dropdown
  const [openYear, setOpenYear] = useState<boolean>(false);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const navigate = useNavigate();

  // ***************** API Hook Calls *****************

  const {
    data: subjectData,
    isLoading: isSubjectsLoading,
    isError: isSubjectsError,
    error: subjectsError,
  } = useApi({
    endpoint: "/exam-paper/get/subjects",
    method: "GET",
    responseSchema: subjectResponseSchema,
  });

  const {
    data: boardData,
    isLoading: isBoardsLoading,
    isError: isBoardsError,
    error: boardsError,
  } = useApi({
    endpoint: "/exam-paper/get/boards",
    method: "GET",
    responseSchema: boardResponseSchema,
  });

  const boardOptions = (boardData?.data.exam_boards ?? []).map((b) => ({
    label: b,
    value: b,
  }));

  const subjectOptions = (subjectData?.data.exam_subjects ?? []).map((s) => ({
    label: s,
    value: s,
  }));

  const { refetch: refetchPrevYears } = useApi(
    {
      endpoint: "/exam-paper/get/prev-years",
      method: "POST",
      payload: {
        subject: selectedSubject, // Use payload for request body
      },
      responseSchema: prevYearsResponseSchema,
    },
    {
      enabled: false, // Disable automatic fetching, we'll control it manually
    }
  );

  // Replace the existing useEffect for years with:
  useEffect(() => {
    if (selectedSubject) {
      refetchPrevYears()
        .then((response) => {
          // The response.data should contain your API response directly
          const yearsData = response.data?.data?.prev_years ?? [];
          setAvailableYears(yearsData);
        })
        .catch(() => {
          setAvailableYears([]);
        });
    } else {
      setAvailableYears([]);
      setSelectedYear(null);
    }
  }, [selectedSubject, refetchPrevYears]);

  // Also add this effect to reset year when subject changes:
  useEffect(() => {
    setSelectedYear(null);
  }, [selectedSubject]);

  useApi(
    {
      endpoint: "/exam-paper/get/prev-exam-paper",
      method: "POST",
      payload: { subject: selectedSubject, year: selectedYear },
      responseSchema: prevExamPaperResponseSchema,
    },
    {
      enabled: !!selectedSubject && !!selectedYear,
    }
  );

  // ******** Functions ***************
  const checkIsMobile = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) setIsOpen(true);
  };

  const HandlePrevYearRoute = (year: number) => {
    const payload = {
      subject: selectedSubject || "",
      year: year || "",
      prev: true,
    };

    navigate({
      to: "/examPaper",
      search: payload,
    });
  };

  // *********** Effects ***************
  useEffect(() => {
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // *********** Skeleton Loader ***********
  const Skeleton = ({ className }: { className?: string }) => (
    <div
      className={`animate-pulse rounded-lg bg-white/10 backdrop-blur-md ${className}`}
    />
  );

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
                {/* Board */}
                <li>
                  {isBoardsLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : isBoardsError ? (
                    <p className="text-red-400 text-sm">
                      {boardsError?.message || "Failed to load boards"}
                    </p>
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

                {/* Subject */}
                <li>
                  {isSubjectsLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : isSubjectsError ? (
                    <p className="text-red-400 text-sm">
                      {subjectsError?.message || "Failed to load subjects"}
                    </p>
                  ) : (
                    <GlassDropdown
                      label="Subject"
                      value={selectedSubject}
                      onChange={(value) => {
                        setSelectedSubject(String(value));
                      }}
                      options={subjectOptions}
                      placeholder="Select Subject"
                    />
                  )}
                </li>

                {/* Marks */}
                <li>
                  <label className="text-white text-base mb-1 block">
                    Total Marks
                  </label>
                  <Input
                    type="number"
                    value={selectedMarks}
                    onChange={(e) => setSelectedMarks(e.target.value)}
                    placeholder="Enter total marks"
                    disabled
                    className="w-full bg-white/10 backdrop-blur-md text-gray-100 p-2 rounded-lg border border-white/20 
                    focus:ring-2 focus:ring-indigo-400/40 hover:bg-white/20 transition-colors
                    placeholder:text-white
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </li>

                {/* Duration */}
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
                      disabled
                      className="flex-1 bg-white/10 backdrop-blur-md text-white p-5 rounded-lg border border-white/20 
                      focus:ring-2 focus:ring-indigo-400/40 hover:bg-white/20 transition-colors
                      placeholder:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="flex-1">
                      {/* <GlassDropdown
                        label=""
                        value={selectedUnit}
                        onChange={(value) => setSelectedUnit(String(value))}
                        options={timeUnit}
                        placeholder="Unit"
                        disabled
                      /> */}
                      <span className="text-white font-semibold text-lg">
                        {selectedUnit}
                      </span>
                    </div>
                  </div>
                </li>
              </ul>

              {/************* Previous Year Questions Section ***************/}
              <div className="mt-8">
                <h3
                  className="text-gray-200 font-medium mb-3 flex items-center cursor-pointer select-none"
                  onClick={() => setOpenYear((prev) => !prev)}
                >
                  <BookOpen className="h-4 w-4 mr-2 text-indigo-400" />
                  Previous Year Questions
                  <motion.span
                    animate={{ rotate: openYear ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-2"
                  >
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </motion.span>
                </h3>
                <AnimatePresence>
                  {openYear && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {availableYears.length > 0 ? (
                        availableYears.map((year) => (
                          <li
                            key={year}
                            className="px-3 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-indigo-600/40 cursor-pointer transition"
                            onClick={() => HandlePrevYearRoute(year)}
                          >
                            {year} Question Paper
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-gray-400 text-sm">
                          No previous years found
                        </li>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/************** Previous Generated Questions ***************/}
              {/* <div className="mt-8">
                <h3
                  className="text-gray-200 font-medium mb-3 flex items-center cursor-pointer select-none"
                  onClick={() => setOpenGenerated((prev) => !prev)}
                >
                  <RiFileHistoryLine className="h-4 w-4 mr-2 text-indigo-400" />
                  Previous Generated Questions
                  <motion.span
                    animate={{ rotate: openGenerated ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-2"
                  >
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </motion.span>
                </h3>
                <AnimatePresence>
                  {openGenerated && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {["2021", "2020", "2019", "2018"].map((year) => (
                        <li
                          key={year}
                          className="px-3 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-indigo-600/40 cursor-pointer transition"
                        >
                          {year} Question Paper
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div> */}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
