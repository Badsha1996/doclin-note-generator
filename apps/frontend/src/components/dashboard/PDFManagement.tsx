import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  Trash,
  CloudAlert,
  Loader2,
  EllipsisVertical,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApi, useApiMutation } from "@/hook/useApi";
import {
  pdfDeleteResponseSchema,
  pdfUploadResposeSchema,
  type AllPDFResponse,
  type ApiError,
  type PDFDelteResponse,
  type PDFUploadResponse,
} from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deletePdfSchema,
  pdfUploadSchema,
  type pdfDeleteType,
  type pdfUploadType,
} from "@/types/type";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
export default function PDF() {
  const [open, setOpen] = useState(false);
  const [fileToBeDeleted, setFileToBeDeleted] = useState<{
    id: string;
    filename: string;
    publicId: string;
  } | null>(null);
  const [openConfirmationPopup, setOpenConfirmationPopup] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const form = useForm<pdfUploadType>({
    resolver: zodResolver(pdfUploadSchema),
    defaultValues: {
      board: "",
      subject: "",
      paper_code: "",
      paper_name: "",
      year: undefined,
      file: null,
    },
  });

  const handleUploadClick = () => {
    if (mutation.isPending) return;
    ref.current?.click();
  };
  const handleCloseDialog = () => {
    form.reset({
      file: null,
      board: "",
      subject: "",
      paper_code: "",
      paper_name: "",
      year: undefined,
    });
    setOpen(false);
  };
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
    return (bytes / 1024).toFixed(1) + " KB";
  };
  function formatDate(dateString: string | Date) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const getOrdinal = (n: number) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinal(day)} ${month}, ${year}`;
  }
  const mutation = useApiMutation<PDFUploadResponse, FormData>(
    {
      endpoint: "/prev-year-pdf/upload",
      method: "POST",
      responseSchema: pdfUploadResposeSchema,
    },
    {
      onSuccess: (data) => {
        toast.success(data.message || "Registration successful!");
        form.reset({
          file: null,
          board: "",
          subject: "",
          paper_code: "",
          paper_name: "",
          year: undefined,
        });
        handleCloseDialog();
        refetch();
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Registration failed. Please try again.");
      },
    }
  );
  const deleteFile = useApiMutation<PDFDelteResponse, pdfDeleteType>(
    {
      endpoint: `/prev-year-pdf/delete/${fileToBeDeleted?.id}`,
      method: "DELETE",
      responseSchema: pdfDeleteResponseSchema,
      payloadSchema: deletePdfSchema,
    },
    {
      onSuccess: () => {
        toast.success("File removed successfully");
        setOpenConfirmationPopup(false);
        setFileToBeDeleted(null);
        refetch();
      },
      onError: (error: ApiError) => {
        toast.error(
          error.message || "Failed to delete file. Please try again."
        );
        setOpenConfirmationPopup(false);
        setFileToBeDeleted(null);
      },
    }
  );
  const { data, isLoading, isError, refetch } = useApi<AllPDFResponse>({
    endpoint: "/prev-year-pdf/all",
    method: "GET",
    queryParams: {
      skip: 0,
      limit: 100,
    },
  });

  function handleSubmit(data: pdfUploadType) {
    const formData = new FormData();

    formData.append("board", data.board);
    formData.append("subject", data.subject);
    formData.append("paper_code", data.paper_code);
    formData.append("paper_name", data.paper_name);
    formData.append("year", String(data.year));

    formData.append("file", data.file as File);

    mutation.mutate(formData);
  }
  function handleDelete(data: pdfDeleteType) {
    deleteFile.mutate(data);
  }
  function getFilename(public_id: string): string {
    const withoutPath = public_id.replace("pdf_uploads/", "");
    const lastUnderscoreIndex = withoutPath.lastIndexOf("_");
    const originalFilename = withoutPath.substring(0, lastUnderscoreIndex);
    return originalFilename;
  }
  const pdfs = data?.data.pdfs || [];
  return (
    <div className="">
      <Dialog
        open={open}
        onOpenChange={(_open) => {
          setOpen(_open);
          form.reset({
            file: null,
            board: "",
            subject: "",
            paper_code: "",
            paper_name: "",
            year: undefined,
          });
        }}
      >
        <DialogTrigger className="  backdrop-blur-md bg-[#e4558d]/70 border border-[#e4558d]/40 text-white hover:bg-[#e4558d]/80 shadow-lg transition-all duration-300 rounded-sm">
          <div className="rounded-sm h-9 px-4 py-1 has-[>svg]:px-3 relative overflow-hidden group shadow-lg ml-auto">
            <motion.div className=""></motion.div>
            <span className="relative z-10 text-white">Upload a new file</span>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-white border-none">
          <DialogHeader>
            <DialogTitle className="text-slate-800 my-3">
              Upload File
            </DialogTitle>
            {/* <DialogDescription> */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                  console.error("FORM ERRORS:", errors);
                })}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg ">
                          <CardContent>
                            {!field.value && (
                              <motion.label
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const dropped = e.dataTransfer.files?.[0];
                                  if (
                                    dropped &&
                                    dropped.type === "application/pdf"
                                  ) {
                                    form.setValue("file", dropped, {
                                      shouldValidate: true,
                                    });
                                  }
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleUploadClick}
                                className={`flex flex-col items-center justify-center border-2 border-dashed p-6 rounded-2xl cursor-pointer bg-white gap-3 transition-all
              ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                              >
                                <UploadCloud className="h-10 w-10 opacity-70" />
                                <span className="text-sm ">
                                  Click to upload PDF or drop a file
                                </span>
                              </motion.label>
                            )}

                            <Input
                              ref={ref}
                              disabled={mutation.isPending}
                              type="file"
                              className="hidden"
                              accept="application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                form.setValue("file", file, {
                                  shouldValidate: true,
                                });
                              }}
                            />
                            {field.value && (
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50">
                                  <FileText className="h-8 w-8" />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-500">
                                      {field.value.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {formatFileSize(field.value.size)}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={mutation.isPending}
                                    onClick={() =>
                                      form.setValue("file", null, {
                                        shouldValidate: true,
                                      })
                                    }
                                  >
                                    <Trash className="h-5 w-5 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="board"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800">Board</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          placeholder="Board"
                          variant="custom"
                          {...field}
                          className="bg-slate-800/20 border-slate-800/30 text-slate-800/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800">Subject</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          type="text"
                          placeholder="Subject"
                          variant="custom"
                          {...field}
                          className="bg-slate-800/20 border-slate-800/30 text-slate-800/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paper_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800">
                        Paper code
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          type="text"
                          variant="custom"
                          placeholder="Paper code"
                          {...field}
                          className="bg-slate-800/20 border-slate-800/30 text-slate-800/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paper_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800">
                        Paper name
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          type="text"
                          variant="custom"
                          placeholder="Paper name"
                          {...field}
                          className="bg-slate-800/20 border-slate-800/30 text-slate-800/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800">Year</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          type="number"
                          variant="custom"
                          placeholder="Year"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? undefined : Number(value)
                            );
                          }}
                          className="bg-slate-800/20 border-slate-800/30 text-slate-800/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex justify-center mt-2"
                >
                  <Button
                    type="submit"
                    className="w-full max-w-xs py-2 rounded-md font-semibold  bg-[#e4558d]/70 border border-[#e4558d]/40 text-white hover:bg-[#e4558d]/80 shadow-lg transition-all duration-300"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </motion.div>
              </form>
            </Form>
            {/* </DialogDescription> */}
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="mt-4">
        <div className="w-full ">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-white/80 border-b border-white/20">
                    <th className="px-4 py-2">File</th>
                    <th className="px-4 py-2">Code</th>
                    <th className="px-4 py-2">Paper Name</th>
                    <th className="px-4 py-2">Subject</th>
                    <th className="px-4 py-2">Year</th>
                    <th className="px-4 py-2">Uploaded At</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-white/50 italic"
                      >
                        Loading users...
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isError && pdfs.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-white/50 italic"
                      >
                        No pdfs found
                      </td>
                    </tr>
                  )}
                  {!isLoading && isError && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-white/50 italic"
                      >
                        <div className="flex justify-center items-center gap-2">
                          <CloudAlert />
                          Failed to fetch PDFs, try again later
                        </div>
                      </td>
                    </tr>
                  )}
                  {pdfs.map((pdf) => (
                    <tr
                      key={pdf.id}
                      className="border-b border-white/10 hover:bg-white/5 transition"
                    >
                      <td className="px-4 py-2 text-white/80">
                        {getFilename(pdf.public_id)}
                      </td>
                      <td className="px-4 py-2 text-white/80">
                        {pdf.paper_code}
                      </td>
                      <td className="px-4 py-2 text-white/80">
                        {pdf.paper_name}
                      </td>
                      <td className="px-4 py-2 text-white/80">{pdf.subject}</td>
                      <td className="px-4 py-2 text-white/80">{pdf.year}</td>
                      <td className="px-4 py-2 text-white">
                        {formatDate(pdf.created_at)}
                      </td>

                      <td className="px-4 py-2 text-center relative">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <EllipsisVertical color="white" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-56 bg-gray-200 text-gray-400"
                            align="end"
                          >
                            <DropdownMenuItem
                              className="hover:bg-gray-300"
                              onClick={() => {
                                setFileToBeDeleted({
                                  id: pdf.id,
                                  publicId: pdf.public_id,
                                  filename: getFilename(pdf.public_id),
                                });
                                setOpenConfirmationPopup(true);
                              }}
                            >
                              Remove
                              <DropdownMenuShortcut>
                                <Trash />
                              </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="hover:bg-gray-300"
                              onClick={() => {
                                const link = document.createElement("a");
                                const parts = pdf.file_url.split("/upload/");
                                const downloadUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
                                link.href = downloadUrl;
                                link.download = getFilename(pdf.public_id);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              Download
                              <DropdownMenuShortcut>
                                <Download />
                              </DropdownMenuShortcut>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={deleteFile.isPending}>
        <DialogContent
          className="bg-white border-none w-32"
          showCloseButton={false}
        >
          <DialogDescription>
            <div className="flex items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-gray-600" />
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <Dialog open={openConfirmationPopup && !!fileToBeDeleted}>
        <DialogContent className="bg-white border-none" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-slate-800 my-3">
              Are you sure?
            </DialogTitle>
            <DialogDescription>
              This action is <b>irreversible</b>. Do you still want to delete{" "}
              {fileToBeDeleted?.filename}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="glass"
              className="bg-[#e4558d]/70"
              onClick={() => {
                setFileToBeDeleted(null);
                setOpenConfirmationPopup(false);
              }}
            >
              No
            </Button>
            <Button
              variant="glass"
              type="submit"
              className="bg-green-600/70"
              onClick={() => {
                if (!fileToBeDeleted) return;
                handleDelete({
                  id: fileToBeDeleted.id,
                  public_id: fileToBeDeleted.publicId,
                });
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
