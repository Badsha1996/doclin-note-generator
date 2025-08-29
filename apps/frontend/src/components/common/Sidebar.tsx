import { motion } from "framer-motion";
import { Search, X, Settings, User, Bell, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // dropdown states
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedMarks, setSelectedMarks] = useState("");

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <motion.div
      initial={{ x: isMobile ? -320 : 0 }}
      animate={{ x: 0 }}
      exit={{ x: isMobile ? -320 : 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed md:relative inset-y-0 left-0 z-50 w-80 
             bg-gradient-to-br from-slate-900/10 via-indigo-900/10 to-purple-900/10
             shadow-[0_8px_32px_rgba(0,0,0,0.35)]
             rounded-r-3xl md:rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10"
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/10 z-0"></div>

      {/* Close button for mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-300 hover:text-white 
                 bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/20 z-10"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Search section */}
      <div className="p-6 border-b border-white/10 relative z-10">
        <div className="relative"></div>
      </div>

      {/* Dropdown Navigation */}
      <nav className="p-5 flex-1 overflow-y-auto relative z-10">
        <ul className="space-y-4">
          {/* Board Dropdown */}
          <li>
            <label className="text-gray-300 text-sm mb-1 block">Board</label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="w-full bg-white/10 text-gray-100 p-2 rounded-lg border border-white/20 focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="">Select Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State">State Board</option>
            </select>
          </li>

          {/* Subject Dropdown */}
          <li>
            <label className="text-gray-300 text-sm mb-1 block">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-white/10 text-gray-100 p-2 rounded-lg border border-white/20 focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="">Select Subject</option>
              <option value="Maths">Maths</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </li>

          {/* Marks Dropdown */}
          <li>
            <label className="text-gray-300 text-sm mb-1 block">
              Total Marks
            </label>
            <select
              value={selectedMarks}
              onChange={(e) => setSelectedMarks(e.target.value)}
              className="w-full bg-white/10 text-gray-100 p-2 rounded-lg border border-white/20 focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="">Select Marks</option>
              <option value="50">50</option>
              <option value="80">80</option>
              <option value="100">100</option>
            </select>
          </li>
        </ul>

        {/* Previous Year Questions Section */}
        <div className="mt-8">
          <h3 className="text-gray-200 font-medium mb-3 flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-indigo-400" />
            Previous Year Questions
          </h3>
          <ul className="space-y-2">
            {["2021", "2020", "2019", "2018"].map((year) => (
              <motion.li
                key={year}
                whileHover={{ x: 5 }}
                className="px-3 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-indigo-600/40 cursor-pointer transition"
              >
                {year} Question Paper
              </motion.li>
            ))}
          </ul>
        </div>
      </nav>
    </motion.div>
  );
}

export default Sidebar;
