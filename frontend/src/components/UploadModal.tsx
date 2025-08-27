import { useState } from "react";

function UploadModal({
    isOpen,
    onClose,
    onCollectionCreated
}: {
    isOpen: boolean;
    onClose: () => void;
    onCollectionCreated: (name: string) => void;
}) {
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
            alert("Please provide a collection name and select at least one file.");
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
            alert(`Collection '${data.collection}' created successfully with files: ${data.files.join(", ")}`);

            onCollectionCreated(data.collection);

            setFiles([]);
            setCollectionName("");
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(`Error uploading files: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Create New Collection</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Collection Name"
                        value={collectionName}
                        onChange={(e) => setCollectionName(e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="border p-2 rounded w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {files.length > 0 && (
                        <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm space-y-1">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-medium truncate">{file.name}</span>
                                        <span className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveFile(idx)} className="text-red-500 hover:text-red-700 font-bold p-1">
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" disabled={isUploading}>
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300" disabled={isUploading}>
                            {isUploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UploadModal;
