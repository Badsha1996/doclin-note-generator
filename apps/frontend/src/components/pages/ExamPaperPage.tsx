import { useApi } from "@/hook/useApi";
import { useLocation } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import GlassmorphicLoader from "../common/GlassLoader";
import ExamPaperPDFViewer from "../common/ExamPaperPDFViewer";
import PageHeader from "../common/PageHeader";
import GlassLayout from "@/layouts/GlassLayout";

const ExamPaperPage = () => {
  const location = useLocation();

  const searchString =
    typeof location.search === "string"
      ? location.search
      : new URLSearchParams(
          Object.entries(location.search).reduce(
            (acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString();

  const searchParams = new URLSearchParams(searchString);
  const prevShow = searchParams.get("prev") === "true";

  const apiPayload = useMemo(() => {
    if (prevShow) {
      return {
        subject: searchParams.get("subject") ?? "",
        year: Number(searchParams.get("year")) || new Date().getFullYear(),
      };
    } else {
      return {
        subject: searchParams.get("subject") ?? "",
        board: searchParams.get("board") ?? "",
        paper: searchParams.get("paper") ?? "",
        code: searchParams.get("code") ?? "",
        year: Number(searchParams.get("year")) || new Date().getFullYear(),
      };
    }
  }, [location.search, prevShow]);

  const endpoint = prevShow
    ? "/exam-paper/get/prev-exam-paper"
    : "/llm/gen-question-paper";

  // Create stable enabled condition based on payload values
  const isEnabled = useMemo(() => {
    if (prevShow) {
      return !!apiPayload.subject;
    } else {
      return !!(
        apiPayload.subject ||
        apiPayload.board ||
        apiPayload.paper ||
        apiPayload.code
      );
    }
  }, [
    prevShow,
    apiPayload.subject,
    apiPayload.board,
    apiPayload.paper,
    apiPayload.code,
  ]);

  // Track successful API calls
  const hasSuccessfullyLoaded = useRef(false);

  const {
    data: examPaperData,
    isLoading: isLoadingExamPaper,
    isError: isExamPaperError,
    error: examPaperError,
    isSuccess,
  } = useApi<
    {
      data?: {
        exam_paper?: {
          exam?: any;
          sections?: any[];
        };
      };
    },
    | { subject: string; year: number }
    | {
        subject: string;
        board: string;
        paper: string;
        code: string;
        year: number;
      }
  >(
    {
      endpoint,
      method: "POST",
      payload: apiPayload,
      // responseSchema: examPaperResponseSchema, // COMMENTED OUT TO BYPASS VALIDATION
    },
    {
      enabled: isEnabled,
      staleTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Mark as successfully loaded when we get data
  if (isSuccess && examPaperData && !hasSuccessfullyLoaded.current) {
    hasSuccessfullyLoaded.current = true;
  }

  // Extract data from response - fix the data path
  const examPaperResponse = examPaperData?.data?.exam_paper;
  const examData = examPaperResponse?.exam;
  const sections = examPaperResponse?.sections;

  const SimpleLoader = () => (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center p-8">
        <GlassmorphicLoader
          size="lg"
          message="Loading Exam Paper for ICSE..."
        />
      </div>
    </div>
  );

  const ErrorState = () => {
    hasSuccessfullyLoaded.current = false;
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md p-8">
          <div className="text-red-600 mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg fill="currentColor" viewBox="0 0 20 20" className="w-8 h-8">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              {prevShow
                ? "Error Loading Exam Paper"
                : "Error Generating Exam Paper"}
            </h2>
            <p className="text-gray-600 mb-6">
              {examPaperError?.message ||
                "An unexpected error occurred. Please try again."}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };

  const NoPayloadState = () => (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md p-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            className="w-8 h-8 text-blue-600"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          No Configuration Found
        </h2>
        <p className="text-gray-600 mb-6">
          Please go back and configure your exam parameters.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (isLoadingExamPaper) {
    return <SimpleLoader />;
  }

  // Error state
  if (isExamPaperError) {
    return <ErrorState />;
  }

  // No payload state
  if (!isEnabled) {
    return <NoPayloadState />;
  }

  // No data state
  if (!examData || !sections || sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              className="w-8 h-8 text-yellow-600"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            No Exam Paper Data
          </h2>
          <p className="text-gray-600 mb-6">
            No valid exam paper data was found. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-24">
      <PageHeader title="AI Generated Paper" subTitle="" />
      <GlassLayout>
        <ExamPaperPDFViewer examData={examData} sections={sections} />
      </GlassLayout>
    </div>
  );
};

export default ExamPaperPage;
