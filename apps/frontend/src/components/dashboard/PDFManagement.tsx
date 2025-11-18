import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Trash } from "lucide-react";
import { motion } from "framer-motion";

export default function PDF() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleUpload = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
    }
  };
  const removeFile = () => {
    setFile(null);
    setUploading(false);
  };
  const handleReupload = (e) => {
    ref.current?.click();
  };
  return (
    <div className="">
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg ">
        <CardContent>
          {!file && (
            <motion.label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center justify-center border-2 border-dashed p-6 rounded-2xl cursor-pointer bg-white gap-3 transition-all
              ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            >
              <UploadCloud className="h-10 w-10 opacity-70" />
              <span className="text-sm ">
                Click to upload PDF or drop a file
              </span>
            </motion.label>
          )}
          <input
            ref={ref}
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
          {file && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50">
                <FileText className="h-8 w-8" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-500">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile}>
                  <Trash className="h-5 w-5 text-red-500" />
                </Button>
              </div>

              {!uploading && (
                <Button className="w-full py-2" onClick={handleReupload}>
                  Re-upload
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
