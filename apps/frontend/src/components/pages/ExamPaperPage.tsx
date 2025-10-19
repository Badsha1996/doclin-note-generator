import { useApi } from "@/hook/useApi";
import { useLocation } from "@tanstack/react-router";
import { useMemo, useRef, useState, useCallback } from "react";
import GlassmorphicLoader from "../common/GlassLoader";
import ExamPaperPDFViewer from "../common/ExamPaperPDFViewer";
import PageHeader from "../common/PageHeader";
import GlassLayout from "@/layouts/GlassLayout";
import { motion, AnimatePresence } from "framer-motion";

const ExamPaperPage = () => {
  const location = useLocation();
  const [retryKey, setRetryKey] = useState(0);

  // --- Parse search params ---
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
        retryKey, // include retry key to re-trigger API
      };
    } else {
      return {
        subject: searchParams.get("subject") ?? "",
        board: searchParams.get("board") ?? "",
        paper: searchParams.get("paper") ?? "",
        code: searchParams.get("code") ?? "",
        year: Number(searchParams.get("year")) || new Date().getFullYear(),
        retryKey,
      };
    }
  }, [location.search, prevShow, retryKey]);

  const endpoint = prevShow
    ? "/exam-paper/get/prev-exam-paper"
    : "/llm/gen-question-paper";

  const isEnabled = useMemo(() => {
    if (prevShow) return !!apiPayload.subject;
    return !!(
      apiPayload.subject ||
      apiPayload.board ||
      apiPayload.paper ||
      apiPayload.code
    );
  }, [prevShow, apiPayload]);

  const hasSuccessfullyLoaded = useRef(false);

  const {
    data: examPaperData,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  } = useApi<
    {
      data?: {
        exam_paper?: { exam?: any; sections?: any[] };
      };
    },
    any
  >(
    {
      endpoint,
      method: "POST",
      payload: apiPayload,
    },
    {
      enabled: isEnabled,
      staleTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isSuccess && examPaperData && !hasSuccessfullyLoaded.current) {
    hasSuccessfullyLoaded.current = true;
  }

  const examPaperResponse = examPaperData?.data?.exam_paper;
  const examData = examPaperResponse?.exam;
  const sections = examPaperResponse?.sections;

  const handleRetry = useCallback(() => {
    hasSuccessfullyLoaded.current = false;
    setRetryKey((prev) => prev + 1);
    refetch?.();
  }, [refetch]);

  // --- Reusable UI blocks ---
  const LoaderOverlay = ({ message }: { message: string }) => (
    <GlassmorphicLoader size="lg" fullScreen message={message} />
  );

  const RetryButton = ({ label }: { label: string }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleRetry}
      className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-medium px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
    >
      {label}
    </motion.button>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center bg-white/10 min-h-screen gap-6 text-center px-6">
      <div className="bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl p-8 backdrop-blur-md shadow-lg">
        <h2 className="text-xl font-semibold text-red-600 mb-3">
          {prevShow ? "Error Loading Exam Paper" : "Error Generating Paper"}
        </h2>
        <p className="text-gray-300 max-w-md mb-6">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <RetryButton label="Try Again" />
      </div>
    </div>
  );

  const NoPayloadState = () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-6">
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-8 backdrop-blur-md shadow-lg">
        <h2 className="text-xl font-semibold text-blue-600 mb-3">
          No Configuration Found
        </h2>
        <p className="text-gray-300 max-w-md mb-6">
          Please go back and configure your exam parameters.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-300 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  const NoDataState = () => (
    <div className="flex flex-col items-center bg-white/10 justify-center min-h-screen gap-6 text-center px-6">
      <div className="bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl p-8 backdrop-blur-md shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-3">
          No Exam Paper Data
        </h2>
        <p className="text-gray-300 max-w-md mb-6">
          No valid exam paper data was found. Please try again.
        </p>
        <RetryButton label="OPPS! Please Try Again" />
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isLoading && <LoaderOverlay message="Generating Exam Paper..." />}

      {!isLoading && isError && <ErrorState />}
      {!isLoading && !isEnabled && <NoPayloadState />}
      {!isLoading &&
        !isError &&
        isEnabled &&
        (!examData || (sections?.length ?? 0) === 0) && <NoDataState />}

      {!isLoading && isSuccess && examData && (sections?.length ?? 0) > 0 && (
        <motion.div
          key="exam-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 mt-24"
        >
          <PageHeader title="AI Generated Paper" subTitle="" />
          <GlassLayout>
            <ExamPaperPDFViewer examData={examData} sections={sections} />
          </GlassLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExamPaperPage;
