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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.length || !collectionName.trim()) {
            dispatch(showError("Please provide a collection name and select at least one file."));
            return;
        }
        setIsUploading(true);

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        try {
            const response = await fetch(`http://localhost:3000/api/create_collection/${collectionName}`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Upload failed");
            }

            const data = await response.json();
            dispatch(showSuccess(`Collection '${data.collection}' created successfully with files: ${data.files.join(", ")}`));

            onCollectionCreated(data.collection);

            setFiles([]);
            setCollectionName("");
            onClose();
        } catch (err: any) {
            console.error(err);
            dispatch(showError(`Error uploading files: ${err.message}`));
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 w-full max-w-md text-white">
                <h2 className="text-xl font-semibold mb-4">Create New Collection</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Collection Name"
                        value={collectionName}
                        onChange={(e) => setCollectionName(e.target.value)}
                        className="p-2 rounded-md focus:ring-0 focus:outline-none w-full bg-[#36353f]"
                        required
                    />
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="p-2 rounded-md w-full bg-[#36353f] focus:ring-0 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {files.length > 0 && (
                        <div className="max-h-32 overflow-y-auto rounded p-2 text-sm space-y-1 bg-[#36353f] focus:ring-0 focus:outline-none">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex justify-between items-center px-2 py-1 rounded-md">
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-medium truncate text-white">{file.name}</span>
                                        <span className="text-white text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveFile(idx)} className="hover:text-red-500 font-bold p-1 cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-red-500 cursor-pointer" disabled={isUploading}>
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded text-white bg-[#5645ee] disabled:opacity-50 cursor-pointer" disabled={isUploading}>
                            {isUploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UploadModal;
