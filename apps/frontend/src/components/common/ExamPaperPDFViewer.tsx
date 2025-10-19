import { useState, useEffect, useRef } from "react";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Loader2,
  Home,
  BookOpen,
  FileText,
} from "lucide-react";
import { Button } from "../ui/button";
type ExamPaperPDFViewerProps = {
  examData: any;
  sections: any;
};
const ExamPaperPDFViewer = ({
  examData,
  sections,
}: ExamPaperPDFViewerProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState("double");
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!examData || !sections || sections.length === 0) {
      setIsGenerating(false);
      return;
    }

    const generatePDF = async () => {
      try {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.async = true;

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        // @ts-ignore
        const { jsPDF } = window.jspdf;

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        let yPos = 20;
        const pageHeight = 297;
        const margin = 20;
        const maxWidth = 170;

        const checkPageBreak = (needed: number) => {
          if (yPos + needed > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
            return true;
          }
          return false;
        };

        // ============ FIRST PAGE - ICSE Style Header ============
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        doc.text(
          "This Paper consists of 11 printed pages and 1 blank page.",
          margin,
          yPos
        );
        yPos += 10;

        doc.text(`T23 ${examData.paper_code}`, margin, yPos);
        doc.text("Turn Over", 190, yPos, { align: "right" });
        yPos += 10;

        doc.text("© Copyright reserved.", 105, yPos, { align: "center" });
        yPos += 15;

        doc.setFontSize(16);
        doc.setFont("times", "bold");
        doc.text(examData.subject?.toUpperCase() || "PHYSICS", 105, yPos, {
          align: "center",
        });
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont("times", "italic");
        doc.text(`(${examData.paper_name || "SCIENCE PAPER 1"})`, 105, yPos, {
          align: "center",
        });
        yPos += 8;

        // Horizontal line
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, 190, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont("times", "italic");
        doc.text(`Maximum Marks: ${examData.maximum_marks}`, 105, yPos, {
          align: "center",
        });
        yPos += 6;
        doc.setFont("times", "bold");
        doc.text(`Time allowed: ${examData.time_allowed}`, 105, yPos, {
          align: "center",
        });
        yPos += 8;

        doc.setFont("times", "italic");
        doc.setFontSize(9);
        const headerInstructions = [
          "Answers to this Paper must be written on the paper provided separately.",
          "",
          "You will not be allowed to write during first 15 minutes.",
          "This time is to be spent in reading the question paper.",
          "",
          "The time given at the head of this Paper is the time allowed for writing the answers.",
        ];

        headerInstructions.forEach((instruction) => {
          if (instruction === "") {
            yPos += 3;
          } else {
            checkPageBreak(6);
            const lines = doc.splitTextToSize(instruction, maxWidth);
            doc.text(lines, 105, yPos, { align: "center" });
            yPos += lines.length * 5;
          }
        });

        yPos += 5;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, 190, yPos);
        yPos += 8;

        doc.setFont("times", "bold");
        doc.setFontSize(10);
        const sectionInstruction =
          "Section A is compulsory. Attempt any four questions from Section B.";
        const sectionLines = doc.splitTextToSize(sectionInstruction, maxWidth);
        doc.text(sectionLines, 105, yPos, { align: "center" });
        yPos += sectionLines.length * 5 + 5;

        doc.setFont("times", "italic");
        doc.setFontSize(9);
        const marksInstruction =
          "The intended marks for questions or parts of questions are given in brackets [ ].";
        const marksLines = doc.splitTextToSize(marksInstruction, maxWidth);
        doc.text(marksLines, 105, yPos, { align: "center" });
        yPos += marksLines.length * 5 + 5;

        doc.setLineWidth(0.5);
        doc.line(margin, yPos, 190, yPos);
        yPos += 15;

        // ============ SECTIONS (Continue on same page if space available) ============
        sections.forEach((section: any, sectionIndex: any) => {
          // Only add new page if not the first section or if no space
          if (sectionIndex > 0 || yPos > pageHeight - 80) {
            doc.addPage();
            yPos = 15;

            // Add page header
            doc.setFontSize(9);
            doc.setFont("times", "normal");
            doc.text(`T23 ${examData.paper_code}`, margin, yPos);
            const pageNum = doc.internal.pages.length - 1;
            doc.text(`${pageNum}`, 105, yPos, { align: "center" });
            doc.text("Turn Over", 190, yPos, { align: "right" });
            yPos += 10;
          }

          doc.setFontSize(11);
          doc.setFont("times", "bold");
          doc.text(
            `${section.name.toUpperCase()} (${section.marks} Marks)`,
            105,
            yPos,
            { align: "center" }
          );
          yPos += 6;

          doc.setFontSize(10);
          doc.setFont("times", "italic");
          if (section.instruction) {
            const instrLines = doc.splitTextToSize(
              `(${section.instruction})`,
              maxWidth
            );
            doc.text(instrLines, 105, yPos, { align: "center" });
            yPos += instrLines.length * 5;
          }
          yPos += 8;

          (section.questions || []).forEach((question: any) => {
            checkPageBreak(20);

            if (yPos === margin) {
              doc.setFontSize(9);
              doc.setFont("times", "normal");
              doc.text(`T23 ${examData.paper_code}`, margin, 15);
              const currentPageNum = doc.internal.pages.length - 1;
              doc.text(`${currentPageNum}`, 105, 15, { align: "center" });
              doc.text("Turn Over", 190, 15, { align: "right" });
              yPos = 25;
            }

            doc.setFont("times", "bold");
            doc.setFontSize(11);
            doc.text(`Question ${question.number}`, margin, yPos);
            doc.setFont("times", "normal");
            doc.setFontSize(10);
            doc.text(`[${question.total_marks}]`, 190, yPos, {
              align: "right",
            });
            yPos += 7;

            if (question.instruction) {
              doc.setFont("times", "normal");
              doc.setFontSize(10);
              const instrLines = doc.splitTextToSize(
                question.instruction,
                maxWidth
              );
              doc.text(instrLines, margin, yPos);
              yPos += instrLines.length * 5 + 3;
            }

            (question.parts || []).forEach((part: any) => {
              checkPageBreak(15);

              if (yPos === margin) {
                doc.setFontSize(9);
                doc.setFont("times", "normal");
                doc.text(`T23 ${examData.paper_code}`, margin, 15);
                const currentPageNum = doc.internal.pages.length - 1;
                doc.text(`${currentPageNum}`, 105, 15, { align: "center" });
                doc.text("Turn Over", 190, 15, { align: "right" });
                yPos = 25;
              }

              doc.setFont("times", "normal");
              doc.setFontSize(10);

              if (part.number) {
                const partLabel = `(${part.number})`;
                if (part.marks) {
                  doc.text(`[${part.marks}]`, 190, yPos, { align: "right" });
                }

                const contentIndent = margin + 12;

                if (part.description) {
                  doc.text(partLabel, margin, yPos);
                  const descLines = doc.splitTextToSize(
                    part.description,
                    maxWidth - 12
                  );
                  doc.text(descLines[0], contentIndent, yPos);
                  yPos += 5;

                  for (let i = 1; i < descLines.length; i++) {
                    doc.text(descLines[i], contentIndent, yPos);
                    yPos += 5;
                  }
                } else if (part.question && !part.sub_parts?.length) {
                  doc.text(partLabel, margin, yPos);
                  const qLines = doc.splitTextToSize(
                    part.question,
                    maxWidth - 12
                  );
                  doc.text(qLines[0], contentIndent, yPos);
                  yPos += 5;

                  for (let i = 1; i < qLines.length; i++) {
                    doc.text(qLines[i], contentIndent, yPos);
                    yPos += 5;
                  }
                } else {
                  doc.text(partLabel, margin, yPos);
                }
                yPos += 3;
              }

              if (part.sub_parts && part.sub_parts.length > 0) {
                part.sub_parts.forEach((subPart: any, idx: number) => {
                  checkPageBreak(10);

                  if (yPos === margin) {
                    doc.setFontSize(9);
                    doc.setFont("times", "normal");
                    doc.text(`T23 ${examData.paper_code}`, margin, 15);
                    const currentPageNum = doc.internal.pages.length - 1;
                    doc.text(`${currentPageNum}`, 105, 15, { align: "center" });
                    doc.text("Turn Over", 190, 15, { align: "right" });
                    yPos = 25;
                  }

                  if (subPart.question) {
                    const subLabel = `${subPart.letter}`;
                    const subIndent = part.description
                      ? margin + 8
                      : margin + 12;
                    const textIndent = part.description
                      ? margin + 18
                      : margin + 22;

                    doc.text(subLabel, subIndent, yPos);
                    const subLines = doc.splitTextToSize(
                      subPart.question,
                      maxWidth - (textIndent - margin)
                    );
                    doc.text(subLines, textIndent, yPos);
                    yPos +=
                      subLines.length * 5 +
                      (idx < part.sub_parts.length - 1 ? 1 : 2);
                  }
                });
              }

              if (part.options && part.options.length > 0) {
                part.options.forEach((option: any) => {
                  checkPageBreak(6);
                  const optText = `${option.option_letter} ${option.text}`;
                  const optLines = doc.splitTextToSize(optText, maxWidth - 12);
                  doc.text(optLines, margin + 8, yPos);
                  yPos += optLines.length * 5;
                });
                yPos += 3;
              }

              if (part.diagram) {
                checkPageBreak(30);
                yPos += 2;
                doc.setLineWidth(0.3);
                doc.rect(margin + 8, yPos, 80, 25);
                doc.setFont("times", "italic");
                doc.setFontSize(9);
                doc.text("[Diagram]", margin + 48, yPos + 13, {
                  align: "center",
                });
                yPos += 28;
                doc.setFont("times", "normal");
                doc.setFontSize(10);
              }

              yPos += 3;
            });

            yPos += 5;
          });
        });

        const pdfBlob = doc.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        // @ts-ignore
        setPdfUrl(url);
        setTotalPages(doc.internal.pages.length - 1);
        setIsGenerating(false);
      } catch (error) {
        console.error("Error generating PDF:", error);
        // @ts-ignore
        setError(error.message);
        setIsGenerating(false);
      }
    };

    generatePDF();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [examData, sections]);

  // Render PDF pages
  useEffect(() => {
    if (!pdfUrl || currentPage === 0) return;

    const loadPDF = async () => {
      try {
        // @ts-ignore
        if (!window["pdfjs-dist/build/pdf"]) {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        // @ts-ignore
        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        pdfDocRef.current = pdf;

        // Render left page
        if (currentPage > 0 && leftCanvasRef.current) {
          const page = await pdf.getPage(currentPage);
          const viewport = page.getViewport({ scale: zoom * 1.5 });
          // @ts-ignore
          const context = leftCanvasRef.current.getContext("2d");
          // @ts-ignore
          leftCanvasRef.current.height = viewport.height;
          // @ts-ignore
          leftCanvasRef.current.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
        }

        // Render right page (if in double mode and page exists)
        if (
          viewMode === "double" &&
          currentPage + 1 <= totalPages &&
          rightCanvasRef.current
        ) {
          const page = await pdf.getPage(currentPage + 1);
          const viewport = page.getViewport({ scale: zoom * 1.5 });
          // @ts-ignore
          const context = rightCanvasRef.current.getContext("2d");
          // @ts-ignore
          rightCanvasRef.current.height = viewport.height;
          // @ts-ignore
          rightCanvasRef.current.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    loadPDF();
  }, [pdfUrl, currentPage, zoom, viewMode, totalPages]);

  const nextPage = () => {
    const increment = viewMode === "double" ? 2 : 1;
    if (currentPage + increment <= totalPages && !isFlipping) {
      // @ts-ignore
      setFlipDirection("next");
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => Math.min(prev + increment, totalPages));
        setIsFlipping(false);
        setFlipDirection(null);
      }, 800);
    }
  };

  const prevPage = () => {
    const decrement = viewMode === "double" ? 2 : 1;
    if (currentPage - decrement >= 1 && !isFlipping) {
      // @ts-ignore
      setFlipDirection("prev");
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => Math.max(prev - decrement, 1));
        setIsFlipping(false);
        setFlipDirection(null);
      }, 800);
    }
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `${examData?.subject}_${examData?.year}_Paper.pdf`;
      a.click();
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // @ts-ignore
      containerRef.current?.requestFullscreen?.() ||
        // @ts-ignore
        containerRef.current?.webkitRequestFullscreen?.();
      setIsFullscreen(true);
    } else {
      // @ts-ignore
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: any) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prevPage();
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentPage(0);
      } else if (e.key === "End") {
        e.preventDefault();
        if (!isFlipping) {
          setCurrentPage(totalPages);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, totalPages, isFlipping, viewMode]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2, prev + 0.15));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.6, prev - 0.15));
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Generating PDF Exam Paper...</p>
          <p className="text-purple-300 text-sm mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center bg-red-500/10 border border-red-500/50 rounded-lg p-8 max-w-md">
          <p className="text-red-400 text-lg mb-4">Error generating PDF</p>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={` py-6  px-4 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      {/* Controls Bar */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-white/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className="p-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all hover:scale-105"
                title="Go to Cover"
              >
                <Home className="w-5 h-5 text-white" />
              </button>

              <div className="w-px h-8 bg-white/30"></div>

              <button
                onClick={prevPage}
                disabled={currentPage <= 1 || isFlipping}
                className="p-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all hover:scale-105"
                title="Previous Page"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[140px] text-center">
                <span className="text-white font-semibold">
                  {currentPage === 0
                    ? "Cover"
                    : viewMode === "double" && currentPage + 1 <= totalPages
                      ? `${currentPage}-${currentPage + 1} / ${totalPages}`
                      : `${currentPage} / ${totalPages}`}
                </span>
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages || isFlipping}
                className="p-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all hover:scale-105"
                title="Next Page"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setViewMode(viewMode === "single" ? "double" : "single")
                }
                className={`p-2.5 rounded-lg transition-all hover:scale-105 ${
                  viewMode === "double"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-white/20 hover:bg-white/30"
                }`}
                title={
                  viewMode === "single"
                    ? "Double Page View"
                    : "Single Page View"
                }
              >
                {viewMode === "double" ? (
                  <BookOpen className="w-5 h-5 text-white" />
                ) : (
                  <FileText className="w-5 h-5 text-white" />
                )}
              </button>

              <div className="w-px h-8 bg-white/30"></div>

              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.6}
                className="p-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-30 rounded-lg transition-all hover:scale-105"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5 text-white" />
              </button>

              <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[70px] text-center">
                <span className="text-white font-semibold text-sm">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <button
                onClick={handleZoomIn}
                disabled={zoom >= 2}
                className="p-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-30 rounded-lg transition-all hover:scale-105"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5 text-white" />
              </button>

              <div className="w-px h-8 bg-white/30"></div>

              <button
                onClick={toggleFullscreen}
                className="p-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all hover:scale-105"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-white" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white" />
                )}
              </button>

              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all hover:scale-105 shadow-lg"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8 mb-6">
        <p className="text-white/60 text-base">
          {currentPage === 0
            ? "Click 'Open Exam Paper' to begin • Use navigation controls above"
            : "Use arrow keys (← →) or Space to navigate • Press ESC to exit fullscreen"}
        </p>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto perspective-2000">
        {currentPage === 0 ? (
          /* Cover Page */
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl shadow-2xl  w-full max-w-[700px] max-h-max flex justify-center items-center p-4  border-4 border-purple-200 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="text-center ">
                <div>
                  <h1 className="text-3xl font-bold  mb-6 tracking-tight">
                    {examData?.subject?.toUpperCase()}
                  </h1>
                  <p className="text-xl  font-light">{examData?.paper_name}</p>
                </div>

                <div className="text-xl space-y-3 py-6 border-t border-b border-purple-200">
                  <p>
                    <strong className="font-semibold">Maximum Marks:</strong>{" "}
                    {examData?.maximum_marks}
                  </p>
                  <p>
                    <strong className="font-semibold">Time allowed:</strong>{" "}
                    {examData?.time_allowed}
                  </p>
                </div>
                <p className="text-sm mb-4 font-medium pt-4">
                  Paper Code: {examData?.paper_code} • Year {examData?.year}
                </p>

                <Button
                  onClick={() => setCurrentPage(1)}
                  type="button"
                  className="w-full py-2 rounded-md font-semibold cursor-pointer 
                             bg-gradient-to-r from-purple-600 to-pink-500 
                             text-white shadow-md hover:opacity-90 transition"
                >
                  Open Exam Paper
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* PDF Pages with Realistic Book Flip Animation */
          <div className="flex justify-center gap-1 relative">
            {/* Left Page (Static) */}
            <div className="relative preserve-3d">
              <div
                className="bg-white rounded-l-xl shadow-2xl overflow-hidden"
                style={{
                  boxShadow:
                    "-15px 0 30px -10px rgba(0, 0, 0, 0.3), inset -8px 0 20px rgba(0, 0, 0, 0.05)",
                }}
              >
                <canvas
                  ref={leftCanvasRef}
                  className="max-w-full h-auto block"
                  style={{
                    maxHeight: isFullscreen ? "90vh" : "80vh",
                    width: "auto",
                  }}
                />
              </div>
            </div>

            {/* Right Page (Flipping) - Only in double mode */}
            {viewMode === "double" && currentPage + 1 <= totalPages && (
              <div
                className={`relative preserve-3d origin-left ${
                  isFlipping && flipDirection === "next"
                    ? "animate-pageFlipNext"
                    : isFlipping && flipDirection === "prev"
                      ? "animate-pageFlipPrev"
                      : ""
                }`}
              >
                <div
                  className="bg-white rounded-r-xl shadow-2xl overflow-hidden"
                  style={{
                    boxShadow:
                      "15px 0 30px -10px rgba(0, 0, 0, 0.3), inset 8px 0 20px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <canvas
                    ref={rightCanvasRef}
                    className="max-w-full h-auto block"
                    style={{
                      maxHeight: isFullscreen ? "90vh" : "80vh",
                      width: "auto",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Center Spine Shadow */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-full pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.2), transparent, rgba(0,0,0,0.2))",
                zIndex: 10,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        .perspective-2000 {
          perspective: 2000px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        .origin-left {
          transform-origin: left center;
        }

        @keyframes pageFlipNext {
          0% {
            transform: rotateY(0deg);
            box-shadow: 15px 0 30px -10px rgba(0, 0, 0, 0.3);
          }
          25% {
            box-shadow: 20px 0 40px -5px rgba(0, 0, 0, 0.5);
          }
          50% {
            transform: rotateY(-90deg);
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.7);
          }
          51% {
            transform: rotateY(-90deg);
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.7);
          }
          75% {
            transform: rotateY(-180deg);
            box-shadow: -20px 0 40px -5px rgba(0, 0, 0, 0.5);
          }
          100% {
            transform: rotateY(-180deg);
            box-shadow: -15px 0 30px -10px rgba(0, 0, 0, 0.3);
          }
        }

        @keyframes pageFlipPrev {
          0% {
            transform: rotateY(-180deg);
            box-shadow: -15px 0 30px -10px rgba(0, 0, 0, 0.3);
          }
          25% {
            transform: rotateY(-90deg);
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.7);
          }
          50% {
            transform: rotateY(-90deg);
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.7);
          }
          75% {
            box-shadow: 20px 0 40px -5px rgba(0, 0, 0, 0.5);
          }
          100% {
            transform: rotateY(0deg);
            box-shadow: 15px 0 30px -10px rgba(0, 0, 0, 0.3);
          }
        }

        .animate-pageFlipNext {
          animation: pageFlipNext 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
          backface-visibility: hidden;
        }

        .animate-pageFlipPrev {
          animation: pageFlipPrev 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
          backface-visibility: hidden;
        }

        canvas {
          image-rendering: crisp-edges;
          image-rendering: -webkit-optimize-contrast;
        }
      `}</style>
    </div>
  );
};

export default ExamPaperPDFViewer;
