import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useNavigate } from "@tanstack/react-router";

interface ConfigContentProps {
  selectedBoard: string;
  selectedSubject: string;
  selectedMarks: string;
  selectedDuration: string;
  selectedUnit: string;
}

function ConfigContent({
  selectedBoard,
  selectedSubject,
  selectedMarks,
  selectedDuration,
  selectedUnit,
}: ConfigContentProps) {
  const year = new Date().getFullYear();
  const boardUpper = selectedBoard?.toUpperCase();
  const isCBSE = boardUpper === "CBSE";
  const isICSE = boardUpper === "ICSE";
  const isCustom = !isCBSE && !isICSE && selectedBoard;

  const navigate = useNavigate();

  const handleGenerateExamPaper = () => {
    const payload = {
      subject: selectedSubject || "",
      board: selectedBoard || "",
      paper: "PHYSICS (SCIENCE PAPER 1)", // Consider making this dynamic based on selectedSubject
      code: "T26 521", // Consider making this dynamic or configurable
      year: new Date().getFullYear(),
      prev: false,
    };

    navigate({
      to: "/examPaper",
      search: payload,
    });
  };

  return (
    <div className="flex-1">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full p-6 rounded-3xl overflow-hidden"
      >
        <div className="bg-white border border-gray-300 shadow-lg rounded-xl p-8 max-w-3xl mx-auto text-gray-800">
          {/************* Default Message **************/}
          {(!selectedBoard || !selectedSubject) && (
            <p className="text-center text-gray-500">
              Select a board and subject to preview the template.
            </p>
          )}

          {/************* CBSE Template **************/}
          {isCBSE && selectedSubject && (
            <>
              <h2 className="text-center font-bold text-lg uppercase">CBSE</h2>
              <h3 className="text-center font-semibold text-md uppercase">
                ANNUAL EXAMINATION ({year})
              </h3>
              <h4 className="text-center text-sm uppercase mb-2">
                SUBJECT: {selectedSubject} (SET–1)
              </h4>

              <div className="flex justify-between text-sm font-medium border-b border-gray-400 pb-1 mb-4">
                <span>CLASS: X</span>
                <span>MAXIMUM MARKS: {selectedMarks || "___"}</span>
                <span>
                  TIME ALLOWED: {selectedDuration || "___"} {selectedUnit || ""}
                </span>
              </div>

              <h5 className="font-bold underline mb-2">General Instructions</h5>
              <ul className="list-decimal ml-6 text-sm space-y-1">
                <li>All questions are compulsory.</li>
                <li>This paper comprises four sections A, B, C, D.</li>
                <li>Internal choices are provided in sections B and C.</li>
                <li>Section D comprises multiple choice questions.</li>
              </ul>
            </>
          )}

          {/*************** ICSE Template *******************/}
          {isICSE && selectedSubject && (
            <>
              <h2 className="text-center font-bold text-xl uppercase">
                {selectedSubject}
              </h2>
              <h3 className="text-center font-semibold italic mb-2 pb-2 border-b border-gray-400">
                ({selectedSubject})
              </h3>

              <div className="text-center text-sm mb-4">
                <p className="italic">
                  Maximum Marks: {selectedMarks || "___"}
                </p>
                <p className="italic font-medium">
                  Time allowed: {selectedDuration || "___"}{" "}
                  {selectedUnit || "hours"}
                </p>
                <p className="text-sm italic mb-2">
                  Answers to this Paper must be written on the paper provided
                  separately.
                </p>
                <p className="text-sm italic mb-2">
                  You will <span className="font-bold">not</span> be allowed to
                  write during the first 15 minutes.
                </p>
                <p className="text-sm italic mb-4">
                  This time is to be spent in reading the question paper.
                </p>
                <p className="text-sm italic font-semibold mb-4 pb-2 border-b border-gray-400">
                  The time given at the head of this Paper is the time allowed
                  for writing the answers.
                </p>

                <p className="text-sm italic mb-4 pb-1">
                  <strong>Section A</strong> is compulsory. Attempt{" "}
                  <strong>any four</strong> questions from{" "}
                  <strong>Section B.</strong>
                </p>

                <p className="text-sm italic mb-4 pb-1 border-b border-gray-400">
                  The intended marks for questions or parts of questions are
                  given in brackets [ ].
                </p>
              </div>
            </>
          )}

          {/************* Custom Board Template **************/}
          {isCustom && selectedSubject && (
            <>
              <h2 className="text-center font-bold text-lg uppercase">
                {selectedBoard}
              </h2>
              <h3 className="text-center font-semibold text-md uppercase">
                EXAMINATION ({year})
              </h3>
              <h4 className="text-center text-sm uppercase mb-2">
                SUBJECT: {selectedSubject}
              </h4>

              <div className="flex justify-between text-sm font-medium border-b border-gray-400 pb-1 mb-4">
                <span>MAXIMUM MARKS: {selectedMarks || "___"}</span>
                <span>
                  TIME ALLOWED: {selectedDuration || "___"} {selectedUnit || ""}
                </span>
              </div>

              <h5 className="font-bold underline mb-2">Instructions</h5>
              <ul className="list-decimal ml-6 text-sm space-y-1">
                <li>Read all questions carefully before answering.</li>
                <li>Answer all questions as instructed.</li>
                <li>Write clearly and legibly.</li>
              </ul>
            </>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center mt-4">
        <Button
          className="w-80 bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            !selectedBoard ||
            !selectedSubject ||
            !selectedMarks ||
            !selectedDuration
          }
          onClick={handleGenerateExamPaper}
        >
          Generate Exam Paper
        </Button>
      </div>
    </div>
  );
}

export default ConfigContent;
