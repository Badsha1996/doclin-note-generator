import PageHeader from "@/components/common/PageHeader";
import { createFileRoute } from "@tanstack/react-router";

const dummyAPIRes = {
  success: true,
  data: {
    exam_paper: {
      id: "57e8a673-596a-4d44-994c-8c499b84a13c",
      board: "ICSE",
      subject: "Physics",
      paper: "Science Paper 1",
      code: "521 SCI1",
      year: 2026,
      max_marks: 80,
      time_allowed: "Two hours",
      instructions: [
        "Answers to this Paper must be written on the paper provided separately.",
        "You will not be allowed to write during first 15 minutes.",
        "This time is to be spent in reading the question paper.",
        "The time given at the head of this Paper is the time allowed for writing the answers.",
        "Section A is compulsory.",
        "Attempt any four questions from Section B.",
        "The intended marks for questions or parts of questions are given in brackets [ ].",
      ],
      sections: [
        {
          name: "Section A",
          marks: 40,
          questions: [
            {
              number: 1,
              type: "MCQ",
              marks: 15,
              instruction: null,
              subparts: [
                {
                  id: "i",
                  question:
                    "A body is acted upon by two equal and opposite forces, that are NOT along the same straight line. The body will:",
                  options: [
                    "remain stationary",
                    "have only rotational motion",
                    "have only rectilinear motion",
                    "have both rectilinear and rotational motion",
                  ],
                },
                {
                  id: "ii",
                  question:
                    "When the speed of a moving object is doubled, then its kinetic energy:",
                  options: [
                    "remains the same",
                    "decreases",
                    "is doubled",
                    "becomes four times",
                  ],
                },
                {
                  id: "iii",
                  question:
                    "A ray of light is incident normally on a face of an equilateral prism. The ray gets totally reflected at the second refracting surface. The total deviation produced is:",
                  options: ["30°", "60°", "90°", "120°"],
                },
                {
                  id: "iv",
                  question:
                    "As the level of water in a tall measuring cylinder rises, the pitch of sound increases. This is because:",
                  options: [
                    "frequency is directly proportional to water column length",
                    "frequency is inversely proportional to air column length",
                    "wavelength increases with water column length",
                    "speed of sound increases in water",
                  ],
                },
                {
                  id: "v",
                  question:
                    "Which of the following materials is preferred for making a calorimeter?",
                  options: ["Copper", "Glass", "Steel", "Aluminium"],
                },
                {
                  id: "vi",
                  question: "The S.I. unit of power of a lens is:",
                  options: ["metre", "centimetre", "dioptre", "watt"],
                },
                {
                  id: "vii",
                  question:
                    "For an ideal machine, the mechanical advantage is:",
                  options: [
                    "equal to its velocity ratio",
                    "greater than its velocity ratio",
                    "less than its velocity ratio",
                    "zero",
                  ],
                },
                {
                  id: "viii",
                  question:
                    "Work done by centripetal force on a body moving in a circular path is:",
                  options: ["positive", "negative", "zero", "depends on speed"],
                },
                {
                  id: "ix",
                  question:
                    "Which of the following colours of visible light has the maximum wavelength?",
                  options: ["Violet", "Green", "Yellow", "Red"],
                },
                {
                  id: "x",
                  question:
                    "The characteristic of sound that enables a person to distinguish between two sounds of the same loudness and pitch, but produced by different sources, is:",
                  options: [
                    "Loudness",
                    "Pitch",
                    "Quality (Timbre)",
                    "Intensity",
                  ],
                },
                {
                  id: "xi",
                  question: "A good absorber of heat is also a good:",
                  options: [
                    "reflector",
                    "transmitter",
                    "radiator",
                    "insulator",
                  ],
                },
                {
                  id: "xii",
                  question:
                    "The fuse wire is placed in the ______ wire of the main circuit.",
                  options: ["live", "neutral", "earth", "any of these"],
                },
                {
                  id: "xiii",
                  question:
                    "Which of the following radiations has the maximum penetrating power?",
                  options: [
                    "Alpha particles",
                    "Beta particles",
                    "Gamma radiations",
                    "Neutrons",
                  ],
                },
                {
                  id: "xiv",
                  question:
                    "The efficiency of a machine is always less than 100% due to:",
                  options: [
                    "friction",
                    "weight of moving parts",
                    "energy loss in various forms",
                    "all of the above",
                  ],
                },
                {
                  id: "xv",
                  question:
                    "A door lock is opened by turning the lever (handle) of length 0.2 m. If the moment of force produced is 1 Nm, then the minimum force required is:",
                  options: ["5 N", "10 N", "20 N", "0.2 N"],
                },
              ],
            },
            {
              number: 2,
              type: "Fill in the blanks + reasoning",
              marks: 10,
              instruction: null,
              subparts: [
                {
                  id: "a",
                  question:
                    "When a stone tied to a string is rotated in a horizontal plane, the tension provides __________ force. Work done by this force at any instant is __________ [2]",
                  options: [],
                },
                {
                  id: "b",
                  question:
                    "Why are the strings of a Sitar made of different thicknesses? [2]",
                  options: [],
                },
                {
                  id: "c",
                  question:
                    "The critical angle for a material is the angle of __________ in the denser medium for which the angle of __________ in the rarer medium is 90°. [2]",
                  options: [],
                },
                {
                  id: "d",
                  question:
                    "State one safety precaution against fire hazards in household wiring. [2]",
                  options: [],
                },
                {
                  id: "e",
                  question:
                    "Define specific heat capacity. State its S.I. unit. [2]",
                  options: [],
                },
              ],
            },
            {
              number: 3,
              type: "Diagram-based + Numericals",
              marks: 15,
              instruction: null,
              subparts: [
                {
                  id: "a",
                  question:
                    "A crane lifts a mass of 2000 kg to a height of 15 m in 30 seconds. Calculate: (i) The work done by the crane. (ii) The power of the crane. (Take g = 10 N/kg). [5]",
                  options: [],
                },
                {
                  id: "b",
                  question:
                    "A ray of monochromatic light enters a glass prism as shown in the diagram below (imagine a diagram showing a ray entering one face of a prism and emerging from another). Draw the ray diagram to show the path of the ray as it emerges from the prism. Mark the angle of deviation. State two factors on which the angle of deviation depends. [5]",
                  options: [],
                },
                {
                  id: "c",
                  question:
                    "A metal block of mass 100 g is heated to 100°C and then quickly transferred to a calorimeter containing 200 g of water at 20°C. If the final temperature of the mixture is 25°C, calculate the specific heat capacity of the metal. (Specific heat capacity of water = 4.2 J g⁻¹ °C⁻¹). [5]",
                  options: [],
                },
              ],
            },
          ],
        },
        {
          name: "Section B",
          marks: 40,
          questions: [
            {
              number: 8,
              type: "Diagram-based + Numericals",
              marks: 10,
              instruction: null,
              subparts: [
                {
                  id: "a",
                  question:
                    "An electric lamp is rated 100 W, 220 V. (i) What is the resistance of the lamp? (ii) What current does it draw when connected to a 220 V supply? (iii) If three such lamps are connected in series to a 220 V supply, what is the total power consumed? [6]",
                  options: [],
                },
                {
                  id: "b",
                  question:
                    "(i) Why is a fuse necessary in a household circuit? (ii) State one difference between AC and DC current. [4]",
                  options: [],
                },
              ],
            },
            {
              number: 9,
              type: "Fill in the blanks + reasoning",
              marks: 10,
              instruction: null,
              subparts: [
                {
                  id: "a",
                  question:
                    "State and explain Fleming's Left-Hand Rule. Draw a labelled diagram to illustrate the direction of force on a current-carrying conductor placed in a magnetic field. [5]",
                  options: [],
                },
                {
                  id: "b",
                  question:
                    "(i) Define radioactivity. (ii) Name three characteristics of alpha particles. (iii) What is the effect of an alpha emission on the mass number and atomic number of the parent nucleus? [5]",
                  options: [],
                },
              ],
            },
            {
              number: 4,
              type: "Diagram-based + Numericals",
              marks: 10,
              instruction: null,
              subparts: [
                {
                  id: "a",
                  question:
                    "Draw a labelled diagram of a block and tackle system with a velocity ratio of 5. In your diagram, indicate the direction of the effort and load. State how the mechanical advantage of this system can be increased. [6]",
                  options: [],
                },
                {
                  id: "b",
                  question:
                    "A force of 80 N is applied to the handle of a nutcracker, which has a length of 15 cm. The nut is placed at a distance of 3 cm from the hinge. Calculate the mechanical advantage and the force exerted on the nut. [4]",
                  options: [],
                },
              ],
            },
            {
              number: 5,
              type: "Diagram-based + Numericals",
              marks: 10,
              instruction: null,
              subparts: [
                {
                  id: "a",
                  question:
                    "(i) Draw the path of a ray of light through a rectangular glass slab, showing lateral displacement. (ii) Explain why a spoon appears bent when partially immersed in water. (iii) What is total internal reflection? State two conditions necessary for it to occur. [6]",
                  options: [],
                },
                {
                  id: "b",
                  question:
                    "An object is placed 15 cm from a convex lens of focal length 10 cm. (i) Find the position and nature of the image. (ii) Draw a ray diagram to show the formation of the image. [4]",
                  options: [],
                },
              ],
            },
            {
              number: 6,
              type: "Fill in the blanks + reasoning",
              marks: 10,
              instruction: null,
              subparts: [
                {
                  id: "a",
                  question:
                    "A boy stands at a distance of 170 m from a high wall and claps his hands. He hears an echo after 1 second. (i) Calculate the speed of sound in air. (ii) If he moves closer to the wall and claps again, how will the time taken to hear the echo change? [4]",
                  options: [],
                },
                {
                  id: "b",
                  question:
                    "Two sound boxes A and B are used. Box A has a wire of length L and box B has a wire of length 2L. Both wires are of the same material and tension. When a tuning fork of frequency 256 Hz is vibrated near box A, resonance occurs. (i) What is resonance? (ii) Will resonance occur if the same tuning fork is vibrated near box B? Justify your answer. (iii) How does increasing the tension in the wire affect the pitch of the sound produced? [6]",
                  options: [],
                },
              ],
            },
            {
              number: 7,
              type: "Fill in the blanks + reasoning",
              marks: 10,
              instruction: null,
              subparts: [
                {
                  id: "a",
                  question:
                    "(i) State the principle of calorimetry. (ii) Why is water used as a coolant in car radiators and as a heat reservoir in hot water bags? [5]",
                  options: [],
                },
                {
                  id: "b",
                  question:
                    "Calculate the amount of heat energy required to melt 500 g of ice at 0°C to water at 0°C. (Specific latent heat of fusion of ice = 336 J g⁻¹). If this water is further heated to 20°C, how much additional heat energy is required? (Specific heat capacity of water = 4.2 J g⁻¹ °C⁻¹). [5]",
                  options: [],
                },
              ],
            },
          ],
        },
      ],
      created_at: "2025-08-27T16:53:46.837240",
      updated_at: "2025-08-27T16:53:46.837246",
    },
  },
  message: "Exam Paper has been fetched",
};

type ExamData = typeof dummyAPIRes.data.exam_paper;

const ExamPaperComponent = () => {
  const examData: ExamData = dummyAPIRes.data.exam_paper;

  const renderMCQ = (question: ExamData["sections"][0]["questions"][0]) => (
    <div key={question.number} className="mb-6">
      <h4 className="text-lg font-bold underline mb-3">
        Question {question.number}
      </h4>
      {question.subparts.map((sub) => (
        <div key={sub.id} className="mb-4">
          <p className="mb-2">
            <span className="font-semibold">({sub.id})</span> {sub.question}
          </p>
          <div className="ml-6">
            {sub.options?.map((opt, i) => (
              <div key={i}>
                ({String.fromCharCode(97 + i)}) {opt}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="text-right font-semibold">[{question.marks}]</div>
    </div>
  );

  const renderRegular = (question: ExamData["sections"][0]["questions"][0]) => (
    <div key={question.number} className="mb-8">
      <h4 className="text-lg font-bold mb-3">Question {question.number}</h4>
      {question.subparts.map((sub) => (
        <div key={sub.id} className="mb-6">
          <p>
            <span className="font-semibold">({sub.id})</span> {sub.question}
          </p>
        </div>
      ))}
      <div className="text-right font-semibold">[{question.marks}]</div>
    </div>
  );

  return (
    <div className="mt-24 ">
      <PageHeader
        title="Exam Paper Generated"
        subTitle="Preview below or download in .pdf / .doc format"
      />
      <div className="space-y-8">
        {/* Printable Pages */}
        <div className="print-area max-w-4xl mx-auto text-black">
          <div className="exam-page">
            <div className="border-4 border-black p-6 mb-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">{examData.board}</h1>
                <h2 className="text-lg font-semibold">EXAMINATION</h2>
                <h3 className="text-base font-semibold">{examData.subject}</h3>
                <h4>{examData.paper}</h4>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <div>
                  <p>
                    <strong>Paper:</strong> {examData.code}
                  </p>
                  <p>
                    <strong>Time:</strong> {examData.time_allowed}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    <strong>Marks:</strong> {examData.max_marks}
                  </p>
                  <p>
                    <strong>Year:</strong> {examData.year}
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold underline mb-2">Instructions:</h3>
            <ul className="list-decimal pl-6 text-sm space-y-1">
              {examData.instructions.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Questions by Section (auto page break when needed) */}
          {examData.sections.map((section) => (
            <div key={section.name} className="exam-page">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold underline">{section.name}</h3>
                <p className="text-sm">[{section.marks} marks]</p>
              </div>
              {section.questions.map((q) =>
                q.type === "MCQ" ? renderMCQ(q) : renderRegular(q)
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export const Route = createFileRoute("/examPaper/")({
  component: ExamPaperComponent,
});

export default ExamPaperComponent;
