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

const ExamPaperPDFViewer = ({ examData, sections }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState("double"); // 'single' or 'double'
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

        const checkPageBreak = (needed) => {
          if (yPos + needed > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
            return true;
          }
          return false;
        };

        // ============ FIRST PAGE - Paper Info ============
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        doc.text(
          "This Paper consists of 11 printed pages and 1 blank page.",
          margin,
          yPos
        );
        yPos += 15;

        doc.setFontSize(9);
        doc.text(`T23 ${examData.paper_code}`, margin, yPos);
        doc.text("Turn Over", 190, yPos, { align: "right" });
        yPos += 15;

        doc.text("© Copyright reserved.", 105, yPos, { align: "center" });
        yPos += 15;

        doc.setFontSize(16);
        doc.setFont("times", "bold");
        doc.text(examData.subject?.toUpperCase() || "PHYSICS", 105, yPos, {
          align: "center",
        });
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont("times", "normal");
        doc.text(`(${examData.paper_name || "SCIENCE PAPER 1"})`, 105, yPos, {
          align: "center",
        });
        yPos += 15;

        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.text(`Maximum Marks: ${examData.maximum_marks}`, 105, yPos, {
          align: "center",
        });
        yPos += 6;
        doc.text(`Time allowed: ${examData.time_allowed}`, 105, yPos, {
          align: "center",
        });
        yPos += 15;

        doc.setFont("times", "normal");
        doc.setFontSize(10);
        const instructions = [
          "Answers to this Paper must be written on the paper provided separately.",
          "",
          "You will not be allowed to write during first 15 minutes.",
          "This time is to be spent in reading the question paper.",
          "The time given at the head of this Paper is the time allowed for writing the answers.",
          "",
          "Section A is compulsory. Attempt any four questions from Section B.",
          "The intended marks for questions or parts of questions are given in brackets [ ].",
        ];

        instructions.forEach((instruction) => {
          if (instruction === "") {
            yPos += 4;
          } else {
            checkPageBreak(8);
            const lines = doc.splitTextToSize(instruction, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5;
          }
        });

        // ============ SECTIONS ============
        sections.forEach((section) => {
          doc.addPage();
          yPos = 15;

          doc.setFontSize(9);
          doc.setFont("times", "normal");
          doc.text(`T23 ${examData.paper_code}`, margin, yPos);
          const pageNum = doc.internal.pages.length - 1;
          doc.text(`${pageNum}`, 105, yPos, { align: "center" });
          if (pageNum < doc.internal.pages.length) {
            doc.text("Turn Over", 190, yPos, { align: "right" });
          }
          yPos += 10;

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

          (section.questions || []).forEach((question) => {
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

            (question.parts || []).forEach((part) => {
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
                  yPos += 2;
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
                  yPos += 2;
                } else {
                  doc.text(partLabel, margin, yPos);
                  yPos += 6;
                }
              }

              if (part.sub_parts && part.sub_parts.length > 0) {
                part.sub_parts.forEach((subPart) => {
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
                    doc.text(subLabel, margin + 8, yPos);
                    const subLines = doc.splitTextToSize(
                      subPart.question,
                      maxWidth - 18
                    );
                    doc.text(subLines, margin + 18, yPos);
                    yPos += subLines.length * 5 + 2;
                  }
                });
                yPos += 2;
              }

              if (part.options && part.options.length > 0) {
                part.options.forEach((option) => {
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
        setPdfUrl(url);
        setTotalPages(doc.internal.pages.length - 1);
        setIsGenerating(false);
      } catch (error) {
        console.error("Error generating PDF:", error);
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

        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        pdfDocRef.current = pdf;

        // Render left page
        if (currentPage > 0 && leftCanvasRef.current) {
          const page = await pdf.getPage(currentPage);
          const viewport = page.getViewport({ scale: zoom * 1.5 });

          const context = leftCanvasRef.current.getContext("2d");
          leftCanvasRef.current.height = viewport.height;
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

          const context = rightCanvasRef.current.getContext("2d");
          rightCanvasRef.current.height = viewport.height;
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
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => Math.min(prev + increment, totalPages));
        setIsFlipping(false);
      }, 400);
    }
  };

  const prevPage = () => {
    const decrement = viewMode === "double" ? 2 : 1;
    if (currentPage - decrement >= 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => Math.max(prev - decrement, 1));
        setIsFlipping(false);
      }, 400);
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
      containerRef.current?.requestFullscreen?.() ||
        containerRef.current?.webkitRequestFullscreen?.();
      setIsFullscreen(true);
    } else {
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
    const handleKeyPress = (e) => {
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
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
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

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto">
        {currentPage === 0 ? (
          /* Cover Page */
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl shadow-2xl p-20 w-full max-w-[700px] min-h-[800px] flex items-center justify-center border-4 border-purple-200 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="text-center space-y-8">
                <div className="text-xs text-purple-600 font-medium tracking-wide">
                  © Copyright reserved.
                </div>

                <div>
                  <h1 className="text-6xl font-bold text-purple-900 mb-6 tracking-tight">
                    {examData?.subject?.toUpperCase()}
                  </h1>
                  <p className="text-3xl text-purple-700 font-light">
                    ({examData?.paper_name})
                  </p>
                </div>

                <div className="text-xl text-purple-800 space-y-3 py-6 border-t border-b border-purple-200">
                  <p>
                    <strong className="font-semibold">Maximum Marks:</strong>{" "}
                    {examData?.maximum_marks}
                  </p>
                  <p>
                    <strong className="font-semibold">Time allowed:</strong>{" "}
                    {examData?.time_allowed}
                  </p>
                </div>

                <button
                  onClick={() => setCurrentPage(1)}
                  className="mt-8 px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all text-xl font-semibold shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 duration-300"
                >
                  Open Exam Paper
                </button>

                <p className="text-sm text-purple-600 font-medium pt-4">
                  Paper Code: {examData?.paper_code} • Year {examData?.year}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* PDF Pages */
          <div
            className={`flex justify-center gap-6 ${isFlipping ? "animate-fadeIn" : ""}`}
          >
            {/* Left Page */}
            <div className="relative">
              <div
                className="bg-white rounded-xl shadow-2xl overflow-hidden"
                style={{
                  boxShadow:
                    "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset -5px 0 15px rgba(0, 0, 0, 0.1)",
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

            {/* Right Page (only in double mode) */}
            {viewMode === "double" && currentPage + 1 <= totalPages && (
              <div className="relative">
                <div
                  className="bg-white rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 5px 0 15px rgba(0, 0, 0, 0.1)",
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
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center mt-8">
        <p className="text-white/60 text-sm">
          {currentPage === 0
            ? "Click 'Open Exam Paper' to begin • Use navigation controls above"
            : "Use arrow keys (← →) or Space to navigate • Press ESC to exit fullscreen"}
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0.5;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
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
