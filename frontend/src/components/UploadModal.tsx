import { useState } from "react";
import { useDispatch } from "react-redux";
import { showError, showSuccess } from "../features/notificationSlice";

function UploadModal({
    isOpen,
    onClose,
    onCollectionCreated
}: {
    isOpen: boolean;
    onClose: () => void;
    onCollectionCreated: (name: string) => void;
}) {
    const dispatch = useDispatch();
    const [files, setFiles] = useState<File[]>([]);
    const [collectionName, setCollectionName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>("");
    const [urlInput, setUrlInput] = useState("");
    const [urls, setUrls] = useState<string[]>([]);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const addUrl = () => {
        const u = urlInput.trim();
        if (!u) return;
        
        try {
            const parsed = new URL(u);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                dispatch(showError("Please enter a URL with http:// or https://"));
                return;
            }
            if (urls.includes(parsed.href)) {
                dispatch(showError("This URL has already been added."));
                return;
            }
            setUrls((prev) => [...prev, parsed.href]);
            setUrlInput("");
        } catch {
            dispatch(showError("Please enter a valid URL (including http:// or https://)."));
        }
    };

    const removeUrl = (idx: number) => {
        setUrls((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleUrlKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addUrl();
        }
    };

    const resetForm = () => {
        setFiles([]);
        setUrls([]);
        setCollectionName("");
        setUrlInput("");
        setUploadProgress("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!collectionName.trim()) {
            dispatch(showError("Please provide a collection name."));
            return;
        }
        if (!files.length && urls.length === 0) {
            dispatch(showError("Upload at least one file or add at least one URL."));
            return;
        }
        setIsUploading(true);
        setUploadProgress("Preparing upload...");  
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        if (urls.length > 0) {
            formData.append("urls", JSON.stringify(urls));
        }

        try {
            setUploadProgress("Processing files and URLs...");
            
            const response = await fetch(
                `http://localhost:3000/api/create_collection/${encodeURIComponent(collectionName)}`, 
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Upload failed");
            }

            const data = await response.json();
            let successMessage = `Collection '${data.collection}' created successfully!`;            
            if (data.files && data.files.length > 0) {
                successMessage += `\n📄 Files processed: ${data.files.length}`;
            }            
            if (data.urls && data.urls.length > 0) {
                successMessage += `\n🌐 URLs processed: ${data.urls.length}`;
            }            
            dispatch(showSuccess(successMessage));
            onCollectionCreated(data.collection);
            resetForm();
            onClose();            
        } catch (err: any) {
            console.error("Upload error:", err);
            dispatch(showError(`Error creating collection: ${err.message}`));
        } finally {
            setIsUploading(false);
            setUploadProgress("");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-[#2C2C2E] rounded-2xl shadow-lg p-6 w-full max-w-md text-white">
                <h2 className="text-xl font-semibold mb-4">Create New Collection</h2>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Collection Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Collection Name</label>
                        <input
                            type="text"
                            placeholder="Enter collection name..."
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                            className="p-3 rounded-lg focus:ring-0 focus:outline-none w-full bg-[#1A1A1D] border border-gray-600 transition-colors"
                            required
                            disabled={isUploading}
                        />
                    </div>

                    {/* Files Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">📄 Files (PDF, PPTX, HTML, etc.)</label>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="p-2 rounded-lg w-full bg-[#1A1A1D] focus:ring-0 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            disabled={isUploading}
                        />
                        {files.length > 0 && (
                            <div className="max-h-32 overflow-y-auto rounded-lg p-2 text-sm space-y-1 bg-[#1A1A1D] border border-gray-600">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex justify-between items-center px-2 py-1 rounded-md">
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-medium truncate text-white">{file.name}</span>
                                            <span className="text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveFile(idx)} 
                                            className="hover:text-red-400 text-gray-400 font-bold p-1 cursor-pointer transition-colors"
                                            disabled={isUploading}
                                            title="Remove file"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* URLs Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">🌐 Webpage Links</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="https://example.com/page"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={handleUrlKeyDown}
                                className="p-3 rounded-lg focus:ring-0 focus:outline-none w-full bg-[#1A1A1D] border border-gray-600 focus:border-[#5645ee] transition-colors"
                                disabled={isUploading}
                            />
                            <button 
                                type="button" 
                                onClick={addUrl} 
                                className="px-4 py-2 rounded-lg text-black bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUploading || !urlInput.trim()}
                                title="Add URL"
                            >
                                Add
                            </button>
                        </div>
                        
                        {urls.length > 0 && (
                            <div className="max-h-32 overflow-y-auto rounded-lg p-2 text-sm space-y-1 bg-[#1A1A1D] border border-gray-600">
                                {urls.map((url, idx) => (
                                    <div key={idx} className="flex justify-between items-center px-2 py-1 rounded-md">
                                        <div className="flex flex-col overflow-hidden min-w-0">
                                            <span className="truncate text-white font-medium" title={url}>
                                                {url}
                                            </span>
                                            <span className="text-gray-400 text-xs">
                                                {new URL(url).hostname}
                                            </span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeUrl(idx)} 
                                            className="hover:text-red-400 text-gray-400 font-bold p-1 cursor-pointer transition-colors ml-2"
                                            disabled={isUploading}
                                            title="Remove URL"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Progress Indicator */}
                    {isUploading && uploadProgress && (
                        <div className="[#1A1A1D] rounded-lg p-3 border border-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#5645ee] border-t-transparent"></div>
                                <span className="text-sm text-gray-300">{uploadProgress}</span>
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    {(files.length > 0 || urls.length > 0) && !isUploading && (
                        <div className="bg-[#1A1A1D] rounded-lg p-3 border border-gray-600">
                            <div className="text-sm text-gray-300">
                                <span className="font-medium">Ready to process:</span>
                                {files.length > 0 && <span className="ml-2">📄 {files.length} file{files.length !== 1 ? 's' : ''}</span>}
                                {urls.length > 0 && <span className="ml-2">🌐 {urls.length} URL{urls.length !== 1 ? 's' : ''}</span>}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button 
                            type="button" 
                            onClick={() => {
                                if (!isUploading) {
                                    resetForm();
                                    onClose();
                                }
                            }} 
                            className="px-4 py-2 rounded-lg bg-red-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isUploading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 rounded-lg text-black bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={isUploading || (!files.length && urls.length === 0) || !collectionName.trim()}
                        >
                            {isUploading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Processing...
                                </div>
                            ) : (
                                "Create Collection"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UploadModal;