import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCollection, setModelName, setConversationId } from "../features/footerSlice";
import type { RootState } from "../app/store";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { setChat, setNewConversation, setHistory } from "../features/chatSlice";
import { showError } from "../features/notificationSlice";
import UploadModal from "./UploadModal";
import { Skeleton } from "@mui/material";
import { Bot, FolderOpen, MessageSquare } from "lucide-react";

function Footer() {
    const [modelListOpen, setmodelListOpen] = useState(false);
    const [collectionOpen, setCollectionOpen] = useState(false);
    const [collections, setCollections] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [modelSearch, setModelSearch] = useState("");
    const [collectionSearch, setCollectionSearch] = useState("");
    const [userPrompt, setUserPrompt] = useState("");
    const [open, setOpen] = useState(false);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [collectionsLoading, setCollectionsLoading] = useState(false);

    const dispatch = useDispatch();
    const selectedCollection = useSelector((state: RootState) => state.footer.selectedCollection);
    const navigate = useNavigate();
    const location = useLocation();
    const conversationId = useSelector((state: RootState) => state.footer.conversationId);
    const modelName = useSelector((state: RootState) => state.footer.modelName);

    const selectionLocked = Boolean(conversationId);
    const isHomePage = location.pathname === "/";

    const getCollections = async () => {
        setCollectionsLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/get_collections");
            const c = await res.json();
            setCollections(c);
        } finally {
            setCollectionsLoading(false);
        }
    };

    const getModels = async () => {
        setModelsLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/get_ollama_models");
            const m = await res.json();
            setModels(m);
        } finally {
            setModelsLoading(false);
        }
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
            dispatch(showError("Please select a model, a collection, and enter a prompt."));
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

    const containerClasses = isHomePage 
        ? "flex flex-col justify-center items-center py-8 px-4 gap-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full"
        : "flex justify-center items-center py-4 px-4 gap-2";

    return (
        <>
        <div className={containerClasses}>
            <div>
                { 
                    isHomePage && (
                        <div className="flex flex-col justify-center items-center mb-10 text-white px-6">
                            {/* Title */}
                            <div className="text-center space-y-2 mb-10">
                                <h1 className="text-4xl font-extrabold">Welcome Back 👋</h1>
                                <p className="text-lg text-white">
                                Your RAG system is ready to help you.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="grid gap-6 sm:grid-cols-3 max-w-4xl w-full">
                                {/* Feature 1 */}
                                <div className="bg-[#2C2C2E] rounded-2xl p-6 text-center hover:bg-white/10 transition">
                                <FolderOpen className="w-10 h-10 mx-auto text-indigo-400 mb-4" />
                                <h3 className="text-lg font-semibold">Collections</h3>
                                <p className="text-sm text-white mt-2">
                                    Create and manage your document collections for better retrieval.
                                </p>
                                </div>

                                {/* Feature 2 */}
                                <div className="bg-[#2C2C2E] rounded-2xl p-6 text-center hover:bg-white/10 transition">
                                <Bot className="w-10 h-10 mx-auto text-purple-400 mb-4" />
                                <h3 className="text-lg font-semibold">Ollama Models</h3>
                                <p className="text-sm text-white mt-2">
                                    Select from multiple models to generate intelligent responses.
                                </p>
                                </div>

                                {/* Feature 3 */}
                                <div className="bg-[#2C2C2E] rounded-2xl p-6 text-center hover:bg-white/10 transition">
                                <MessageSquare className="w-10 h-10 mx-auto text-pink-400 mb-4" />
                                <h3 className="text-lg font-semibold">Ask Anything</h3>
                                <p className="text-sm white mt-2">
                                    Get context-aware answers powered by retrieval-augmented generation.
                                </p>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
            <div className="flex flex-col w-full max-w-4xl rounded-xl p-4 bg-[#2C2C2E]">
                <div className="flex items-center gap-2 mb-4">
                    {/* Upload Button */}
                    <button 
                        className="group relative rounded-xl p-3 text-white bg-white cursor-pointer"
                        onClick={() => setOpen(true)}
                        title="Upload files"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-black transition-transform duration-300 group-hover:rotate-90">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>

                    {/* Prompt Input */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            className="w-full p-3 rounded-xl focus:outline-none text-white placeholder-gray-400 bg-[#1A1A1D]"
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && checkConversationId()}
                        />
                    </div>

                    {/* Send Button */}
                    <button 
                        className="group relative rounded-xl p-3 bg-white text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={checkConversationId}
                        disabled={!userPrompt.trim()}
                        title="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </div>

                <div className="flex justify-between gap-4">
                    {/* Model Dropdown */}
                    <div className="relative flex-1">
                        <button
                            onClick={() => !selectionLocked && setmodelListOpen(!modelListOpen)}
                            className={`w-full text-left text-black rounded-xl p-2 bg-white ${
                                selectionLocked 
                                    ? "cursor-not-allowed opacity-50" 
                                    : "cursor-pointer"
                            }`}
                            disabled={selectionLocked}
                            title={selectionLocked ? "Change model on Home before starting a chat" : undefined}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex justify-center items-center gap-2">
                                    <span>
                                        <Bot className="w-5 h-5 mx-auto text-black" />
                                    </span>
                                    <span className="truncate text-md font-lg font-bold">{modelName || "Select Model"}</span>
                                </div>
                                {!selectionLocked && (
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        strokeWidth={2} 
                                        stroke="currentColor" 
                                        className={`w-5 h-5 transition-transform duration-300 ${modelListOpen ? 'rotate-180' : ''}`}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                )}
                            </div>
                        </button>
                        {!selectionLocked && modelListOpen && (
                            <div className="absolute bottom-full mb-2 w-full bg-[#2C2C2E] shadow-2xl rounded-xl z-10 max-h-64 overflow-hidden backdrop-blur-lg">
                                <div className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Search models..."
                                        className="w-full px-3 py-2 bg-[#1A1A1D] rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors duration-300"
                                        value={modelSearch}
                                        onChange={(e) => setModelSearch(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                    {modelsLoading ? (
                                        <div className="p-3 space-y-2">
                                            <Skeleton variant="rectangular" height={36} sx={{ bgcolor: 'grey.700', borderRadius: '8px' }} />
                                            <Skeleton variant="rectangular" height={36} sx={{ bgcolor: 'grey.700', borderRadius: '8px' }} />
                                            <Skeleton variant="rectangular" height={36} sx={{ bgcolor: 'grey.700', borderRadius: '8px' }} />
                                        </div>
                                    ) : (
                                        <ul>
                                            {models
                                                .filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase()))
                                                .map((m) => (
                                                    <li
                                                        key={m}
                                                        className="px-4 py-3 hover:bg-white hover:text-black cursor-pointer truncate text-white transition-colors duration-200 last:border-b-0"
                                                        onClick={() => { dispatch(setModelName(m)); setmodelListOpen(false); setModelSearch(""); }}
                                                    >
                                                        <span className="font-medium">{m}</span>
                                                    </li>
                                                ))}
                                            {models.length === 0 && (
                                                <li className="px-4 py-3 text-gray-400 text-sm text-center">No models available</li>
                                            )}
                                            {models.length > 0 && models.filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase())).length === 0 && (
                                                <li className="px-4 py-3 text-gray-400 text-sm text-center">No results found</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Collection Dropdown */}
                    <div className="relative flex-1">
                        <button
                            onClick={() => !selectionLocked && setCollectionOpen(!collectionOpen)}
                            className={`w-full text-left text-black rounded-xl p-2 bg-white ${
                                selectionLocked 
                                    ? "cursor-not-allowed opacity-50" 
                                    : "cursor-pointer"
                            }`}
                            disabled={selectionLocked}
                            title={selectionLocked ? "Change collection on Home before starting a chat" : undefined}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex justify-center items-center gap-2">
                                    <span>
                                        <FolderOpen className="w-5 h-5 mx-auto text-black" />
                                    </span>
                                    <span className="truncate text-md font-lg font-bold">{selectedCollection || "Select Collection"}</span>
                                </div>
                                {!selectionLocked && (
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        strokeWidth={2} 
                                        stroke="currentColor" 
                                        className={`w-5 h-5 transition-transform duration-300 ${collectionOpen ? 'rotate-180' : ''}`}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                )}
                            </div>
                        </button>
                        {!selectionLocked && collectionOpen && (
                            <div className="absolute bottom-full mb-2 w-full bg-[#2C2C2E] rounded-lg z-10 max-h-64 overflow-hidden backdrop-blur-lg">
                                <div className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Search collections..."
                                        className="w-full px-3 py-2 bg-[#1A1A1D] rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors duration-300"
                                        value={collectionSearch}
                                        onChange={(e) => setCollectionSearch(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                    {collectionsLoading ? (
                                        <div className="p-3 space-y-2">
                                            <Skeleton variant="rectangular" height={36} sx={{ bgcolor: 'grey.700', borderRadius: '8px' }} />
                                            <Skeleton variant="rectangular" height={36} sx={{ bgcolor: 'grey.700', borderRadius: '8px' }} />
                                            <Skeleton variant="rectangular" height={36} sx={{ bgcolor: 'grey.700', borderRadius: '8px' }} />
                                        </div>
                                    ) : (
                                        <ul>
                                            {collections
                                                .filter((c) => c.toLowerCase().includes(collectionSearch.toLowerCase()))
                                                .map((c) => (
                                                    <li
                                                        key={c}
                                                        className="px-4 py-3 hover:bg-white hover:text-black cursor-pointer text-white transition-colors duration-200 last:border-b-0"
                                                        onClick={() => { dispatch(setSelectedCollection(c)); setCollectionOpen(false); setCollectionSearch(""); }}
                                                    >
                                                        <span className="font-medium">{c}</span>
                                                    </li>
                                                ))}
                                            {collections.length === 0 && (
                                                <li className="px-4 py-3 text-gray-400 text-sm text-center">No collections available</li>
                                            )}
                                            {collections.length > 0 && collections.filter((c) => c.toLowerCase().includes(collectionSearch.toLowerCase())).length === 0 && (
                                                <li className="px-4 py-3 text-gray-400 text-sm text-center">No results found</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        {/* Upload Modal */}
            <UploadModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onCollectionCreated={(newName: string) => {
                    getCollections();
                    dispatch(setSelectedCollection(newName));
                }}
            />
        </>
    );
}

export default Footer;