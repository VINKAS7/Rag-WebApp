import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCollection, setModelName, setConversationId } from "../features/footerSlice";
import type { RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { setChat, setNewConversation, setHistory } from "../features/chatSlice";
import UploadModal from "./UploadModal";

function Footer() {
    const [modelListOpen, setmodelListOpen] = useState(false);
    const [collectionOpen, setCollectionOpen] = useState(false);
    const [collections, setCollections] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [modelSearch, setModelSearch] = useState("");
    const [collectionSearch, setCollectionSearch] = useState("");
    const [userPrompt, setUserPrompt] = useState("");
    const [open, setOpen] = useState(false);

    const dispatch = useDispatch();
    const selectedCollection = useSelector((state: RootState) => state.footer.selectedCollection);
    const navigate = useNavigate();
    const conversationId = useSelector((state: RootState) => state.footer.conversationId);
    const modelName = useSelector((state: RootState) => state.footer.modelName);

    const selectionLocked = Boolean(conversationId);

    const getCollections = async () => {
        const res = await fetch("http://localhost:3000/api/get_collections");
        const c = await res.json();
        setCollections(c);
    };

    const getModels = async () => {
        const res = await fetch("http://localhost:3000/api/get_ollama_models");
        const m = await res.json();
        setModels(m);
    };

    useEffect(() => {
        getCollections();
        getModels();
    }, []);

    function isPlaceholderSelection(value: string | null | undefined) {
        if (!value) return true;
        const v = value.toLowerCase();
        return v === "select model".toLowerCase() || v === "select collection".toLowerCase();
    }

    async function checkConversationId() {
        if (!userPrompt.trim() || isPlaceholderSelection(modelName) || isPlaceholderSelection(selectedCollection)) {
            alert("Please select a model, a collection, and enter a prompt.");
            return;
        }

        if (!conversationId) {
            const newCid = uuidv4();
            dispatch(setConversationId(newCid));
            dispatch(setNewConversation(true));
            dispatch(setHistory([]));
            navigate(`/conversation/${newCid}`, {
                state: { "user": userPrompt }
            });
        } else {
            dispatch(setChat({ "user": userPrompt }));
        }
        setUserPrompt("");
    }

    return (
        <div className="flex justify-center items-center py-4 px-4 gap-2 border-t">
            {/* Model Dropdown */}
            <div className="relative inline-block">
                <button
                    onClick={() => !selectionLocked && setmodelListOpen(!modelListOpen)}
                    className={`bg-blue-500 text-white rounded p-2 truncate ${selectionLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={selectionLocked}
                    title={selectionLocked ? "Change model on Home before starting a chat" : undefined}
                >
                    <div className="flex gap-1 items-center">
                        {modelName}
                        {!selectionLocked && (modelListOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                            </svg>
                        ))}
                    </div>
                </button>
                {!selectionLocked && modelListOpen && (
                    <div className="absolute bottom-full mb-2 w-64 bg-white shadow-lg rounded-lg border z-10 max-h-64 overflow-y-auto">
                        <div className="p-2 border-b">
                            <input
                                type="text"
                                placeholder="Search models..."
                                className="w-full px-2 py-1 border rounded"
                                value={modelSearch}
                                onChange={(e) => setModelSearch(e.target.value)}
                            />
                        </div>
                        <ul>
                            {models
                                .filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase()))
                                .map((m) => (
                                    <li
                                        key={m}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer truncate"
                                        onClick={() => { dispatch(setModelName(m)); setmodelListOpen(false); setModelSearch(""); }}
                                    >
                                        {m}
                                    </li>
                                ))}
                            {models.length === 0 && (
                                <li className="px-4 py-2 text-gray-500 text-sm">No model available</li>
                            )}
                            {models.length > 0 && models.filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase())).length === 0 && (
                                <li className="px-4 py-2 text-gray-500 text-sm">No results</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {/* Collection Dropdown */}
            <div className="relative inline-block">
                <button
                    onClick={() => !selectionLocked && setCollectionOpen(!collectionOpen)}
                    className={`bg-green-500 text-white rounded p-2 truncate ${selectionLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={selectionLocked}
                    title={selectionLocked ? "Change collection on Home before starting a chat" : undefined}
                >
                    <div className="flex gap-1 items-center">
                        {selectedCollection || "Select Collection"}
                        {!selectionLocked && (collectionOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                            </svg>
                        ))}
                    </div>
                </button>
                {!selectionLocked && collectionOpen && (
                    <div className="absolute bottom-full mb-2 w-64 bg-white shadow-lg rounded-lg border z-10 max-h-64 overflow-y-auto">
                        <div className="p-2 border-b">
                            <input
                                type="text"
                                placeholder="Search collections..."
                                className="w-full px-2 py-1 border rounded"
                                value={collectionSearch}
                                onChange={(e) => setCollectionSearch(e.target.value)}
                            />
                        </div>
                        <ul>
                            {collections
                                .filter((c) => c.toLowerCase().includes(collectionSearch.toLowerCase()))
                                .map((c) => (
                                    <li
                                        key={c}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => { dispatch(setSelectedCollection(c)); setCollectionOpen(false); setCollectionSearch(""); }}
                                    >
                                        {c}
                                    </li>
                                ))}
                            {collections.length === 0 && (
                                <li className="px-4 py-2 text-gray-500 text-sm">No collections available</li>
                            )}
                            {collections.length > 0 && collections.filter((c) => c.toLowerCase().includes(collectionSearch.toLowerCase())).length === 0 && (
                                <li className="px-4 py-2 text-gray-500 text-sm">No results</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {/* Prompt Input */}
            <input
                type="text"
                placeholder="Enter Prompt"
                className="flex-1 p-2 rounded border border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkConversationId()}
            />

            {/* Upload Button */}
            <button className="bg-purple-500 rounded p-2 text-white cursor-pointer"
                onClick={() => setOpen(true)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>

            {/* Send Button */}
            <button className="bg-green-600 rounded p-2 text-white cursor-pointer" onClick={checkConversationId}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
            </button>

            {/* Upload Modal */}
            <UploadModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onCollectionCreated={(newName: string) => {
                    getCollections();
                    dispatch(setSelectedCollection(newName));
                }}
            />
        </div>
    );
}

export default Footer;
