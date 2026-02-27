"use client"; 

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react"; 
import { processPdf } from "./actions";

export default function PDFUpload() {
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File) => {
        if (!file || file.type !== "application/pdf") {
            setMessage({ type: "error", text: "Please upload a valid PDF file." });
            return;
        }

        setIsLoading(true);
        setMessage(null);
        setSelectedFile(file);

        try {
            const formData = new FormData();
            formData.append("pdf", file);
            const result = await processPdf(formData);

            if (result.success) {
                setMessage({ type: "success", text: result.message || "PDF processed successfully!" });
            } else {
                setMessage({ type: "error", text: result.error || "Failed to process PDF." });
                setSelectedFile(null);
            }
        } catch {
            setMessage({ type: "error", text: "An unexpected error occurred." });
            setSelectedFile(null);
        } finally {
            setIsLoading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const reset = () => {
        setSelectedFile(null);
        setMessage(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="min-h-[calc(100dvh-3.5rem)] bg-zinc-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">

                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Upload a PDF</h1>
                    <p className="text-sm text-zinc-500 mt-1">Your document will be chunked and embedded for RAG</p>
                </div>

                <div
                    onClick={() => !isLoading && inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`
                        relative flex flex-col items-center justify-center gap-3
                        rounded-2xl border-2 border-dashed px-8 py-12 text-center
                        transition-all duration-200 cursor-pointer
                        ${isLoading ? 'cursor-not-allowed opacity-60' : ''}
                        ${isDragging
                            ? 'border-zinc-500 bg-zinc-900/80'
                            : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
                        }
                    `}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        disabled={isLoading}
                        onChange={handleFileChange}
                        title="Upload a PDF file"
                        max='10mb'
                    />

                    {isLoading ? (
                        <>
                            <svg className="animate-spin text-zinc-400" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                            </svg>
                            <p className="text-sm text-zinc-400 font-medium">Processing PDF…</p>
                            <p className="text-xs text-zinc-600">Chunking and embedding your document</p>
                        </>
                    ) : selectedFile && message?.type === 'success' ? (
                        <>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-200">{selectedFile.name}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); reset(); }}
                                className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors mt-1"
                            >
                                Upload another
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 16 12 12 8 16" />
                                    <line x1="12" y1="12" x2="12" y2="21" />
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-300">
                                    {isDragging ? 'Drop it here' : 'Drop your PDF here'}
                                </p>
                                <p className="text-xs text-zinc-600 mt-0.5">or click to browse</p>
                            </div>
                            <span className="text-xs text-zinc-700 bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1">
                                PDF only
                            </span>
                        </>
                    )}
                </div>

                {message && (
                    <div className={`
                        mt-4 flex items-start gap-3 rounded-xl border px-4 py-3
                        ${message.type === 'error'
                            ? 'bg-red-500/5 border-red-500/20 text-red-400'
                            : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                        }
                    `}>
                        {message.type === 'error' ? (
                            <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        ) : (
                            <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        )}
                        <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                )}

                <p className="text-center text-xs text-zinc-700 mt-6">
                    After processing, head to{" "}
                    <a href="/chat" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors">
                        /chat
                    </a>{" "}
                    to query your document
                </p>

            </div>
        </div>
    );
}