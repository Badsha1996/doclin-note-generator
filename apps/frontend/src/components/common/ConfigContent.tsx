import { motion } from "framer-motion";

interface ConfigContentProps {
  selectedBoard: string;
  selectedSubject: string;
  selectedMarks: string;
  selectedDuration: string;
}

function ConfigContent({
  selectedBoard,
  selectedSubject,
  selectedMarks,
  selectedDuration,
}: ConfigContentProps) {

  const year = new Date().getFullYear();
  const isCBSE = selectedBoard?.toUpperCase() === "CBSE";
  const isICSE = selectedBoard?.toUpperCase() === "ICSE";

  return (
    <div className="flex-1">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full p-6 rounded-3xl overflow-hidden"
      >
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-pink-500 via-rose-400 to-orange-400 p-2 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Selected Board
            </h2>
            <p className="text-white/80">{selectedBoard || "Not selected"}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-400 p-2 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Selected Subject
            </h2>
            <p className="text-white/80">{selectedSubject || "Not selected"}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-green-400 p-2 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Total Marks
            </h2>
            <p className="text-white/80">
              {selectedMarks ? `${selectedMarks} Marks` : "Not set"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-400 p-2 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Total Duration
            </h2>
            <p className="text-white/80">
              {selectedDuration ? `${selectedDuration} mins` : "Not set"}
            </p>
          </div>
        </div> */}
        <div className="bg-white border border-gray-300 shadow-lg rounded-xl p-8 max-w-3xl mx-auto text-gray-800">
          {isCBSE && (
            <>
              <h2 className="text-center font-bold text-lg uppercase">CBSE</h2>
              <h3 className="text-center font-semibold text-md uppercase">
                ANNUAL EXAMINATION ({year})
              </h3>
              <h4 className="text-center text-sm uppercase mb-2">
                SUBJECT: {selectedSubject || "Subject"} (SET–1)
              </h4>

              <div className="flex justify-between text-sm font-medium border-b border-gray-400 pb-1 mb-4">
                <span>CLASS: X</span>
                <span>MAXIMUM MARKS: {selectedMarks || "___"}</span>
                <span>TIME ALLOWED: {selectedDuration || "___"} HRS</span>
              </div>

              <h5 className="font-bold underline mb-2">General Instructions</h5>
              <ol className="list-decimal ml-6 text-sm space-y-1">
                <li>All questions are compulsory.</li>
                <li>This paper comprises four sections A, B, C, D.</li>
                <li>Internal choices are provided in sections B and C.</li>
                <li>Section D comprises multiple choice questions.</li>
              </ol>
              <h5 className="font-bold mb-2">Section A — MCQs</h5>
              <ol className="list-decimal ml-6 text-sm space-y-2">
                <li>
                  Which tag in HTML is used to create a numbered list?
                  <br /> A) &lt;UL&gt; B) &lt;OL&gt; C) &lt;DL&gt; D)
                  &lt;LIST&gt;
                </li>
              </ol>
              <h5 className="font-bold mb-2">Section B — 1 Mark Questions</h5>
              <ol className="list-decimal ml-6 text-sm space-y-2 mb-4">
                <li>
                  Define {selectedSubject || "the subject"} in one sentence.
                </li>
                <li>Which protocol is used for video conferencing?</li>
              </ol>

              <h5 className="font-bold mb-2">Section C — 3 Mark Questions</h5>
              <ol className="list-decimal ml-6 text-sm space-y-2 mb-4">
                <li>Explain the difference between HTTP and HTTPS.</li>
                <li>List three features of Object-Oriented Programming.</li>
              </ol>

              <h5 className="font-bold mb-2">Section D — 5 Mark Questions</h5>
              <ol className="list-decimal ml-6 text-sm space-y-2 mb-4">
                <li>
                  Describe a real-life case study where{" "}
                  {selectedSubject || "this subject"} is applied.
                </li>
              </ol>
            </>
          )}

          {isICSE && (
            <>
              <h2 className="text-center font-bold text-xl uppercase">
                {selectedSubject || ""}
              </h2>
              <h3 className="text-center font-semibold italic mb-2 pb-2 border-b border-gray-400">
                ( {selectedSubject || ""} Paper I)
              </h3>

              <div className="text-center text-sm mb-4">
                <p className="italic">
                  Maximum Marks: {selectedMarks || "___"}
                </p>
                <p className="italic font-medium">
                  Time allowed: {selectedDuration || "___"} hours
                </p>

                <p className="text-sm italic mb-2">
                  Answers to this Paper must be written on the paper provided
                  separately.
                </p>
                <p className="text-sm italic mb-2">
                  You will <span className="font-bold">not</span> be allowed to
                  write during first 15 minutes.
                </p>
                <p className="text-sm italic mb-4">
                  This time is to be spent in reading the question paper.
                </p>

                <p className="text-sm italic font-semibold mb-4 pb-2 border-b border-gray-400">
                  The time given at the head of this Paper is the time allowed
                  for writing the answers.
                </p>
              </div>
              <p className="text-sm mb-2 text-center">
                <span className="font-semibold italic">Section A</span> is
                compulsory. Attempt <span className="italic">any four</span>{" "}
                questions from <span className="italic">Section B</span>.
              </p>
              <p className="text-sm text-center ">
                The intended marks for questions or parts of questions are given
                in brackets [ ].
              </p>
              <h5 className="font-bold mb-2">Section A</h5>
              <ol className="list-decimal ml-6 text-sm space-y-2 mb-4">
                <li>Define {selectedSubject || "Physics"} [2]</li>
                <li>State two applications of Newton’s laws of motion. [2]</li>
              </ol>

              <h5 className="font-bold mb-2">Section B</h5>
              <ol className="list-decimal ml-6 text-sm space-y-2">
                <li>
                  Explain the principle of conservation of energy with an
                  example. [5]
                </li>
                <li>
                  A body of mass 2kg is lifted vertically upwards to a height of
                  5m. Calculate the work done. (g = 9.8m/s²) [5]
                </li>
              </ol>
            </>
          )}

          {!isCBSE && !isICSE && (
            <p className="text-center text-gray-500">
              Select a board to preview its template.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ConfigContent;
