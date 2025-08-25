import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCollection, setModelName, setConversationId } from "../features/footerSlice";
import type { RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import {v4 as uuidv4} from "uuid"
import { setChat, setNewConversation, setHistory } from "../features/chatSlice";
import UploadModal from "./UploadModal";

function Footer(){
    const [modelListOpen, setmodelListOpen] = useState(false);
    const [collectionOpen, setCollectionOpen] = useState(false);
    const [collections, setCollections] = useState([]);
    const [models, setModels] = useState([]);
    const [userPrompt, setUserPrompt] = useState("");
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const selectedCollection = useSelector((state: RootState) => state.footer.selectedCollection);
    const navigate = useNavigate();
    const conversationId = useSelector((state: RootState) => state.footer.conversationId);
    const modelName = useSelector((state: RootState) => state.footer.modelName);

    useEffect(() => {
        const getCollections = async () => {
            const res = await fetch("http://localhost:3000/api/get_collections");
            const c = await res.json();
            setCollections(c);
        }
        const getModels = async () => {
            const res = await fetch("http://localhost:3000/api/get_ollama_models");
            const m = await res.json();
            setModels(m);
            if (!modelName && m.length > 0) {
                dispatch(setModelName(m[0]));
            }
        }
        getCollections();
        getModels();
    }, [dispatch, modelName]);

    async function checkConversationId(){
        if (!userPrompt.trim() || !modelName || !selectedCollection) {
            alert("Please select a model, a collection, and enter a prompt.");
            return;
        }

        if(!conversationId){
            const newCid = uuidv4();
            dispatch(setConversationId(newCid));
            dispatch(setNewConversation(true));
            dispatch(setHistory([]));
            navigate(`/conversation/${newCid}`, {
                state: { "user": userPrompt }
            });
        } else {
            dispatch(setChat({"user": userPrompt}));
        }
        setUserPrompt("");
    }
    
    return(
        <div className="flex justify-center items-center py-4 px-4 gap-2 border-t">
            <div className="relative inline-block">
                <button
                    onClick={() => setmodelListOpen(!modelListOpen)}
                    className="bg-blue-500 text-white rounded p-2 min-w-[130px] truncate cursor-pointer"
                >
                    <div className="flex gap-1">
                        {modelName}
                        {
                            modelListOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                </svg>
                            )
                        }
                    </div>
                </button>
                {modelListOpen && (
                    <ul className="absolute bottom-full mb-2 w-48 bg-white shadow-lg rounded-lg border z-10 max-h-48 overflow-y-auto">
                        {models.map((m) => (
                            <li key={m} className="px-4 py-2 hover:bg-gray-100 cursor-pointer truncate" onClick={() => {dispatch(setModelName(m)); setmodelListOpen(false)}}>{m}</li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="relative inline-block">
                <button
                    onClick={() => setCollectionOpen(!collectionOpen)}
                    className="bg-green-500 text-white rounded p-2 min-w-[150px] truncate cursor-pointer"
                >
                    <div className="flex gap-1">
                        {selectedCollection}
                        {
                            collectionOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                </svg>
                            )
                        }
                    </div>
                </button>
                {collectionOpen && (
                    <ul className="absolute bottom-full mb-2 w-48 bg-white shadow-lg rounded-lg border z-10 max-h-48 overflow-y-auto">
                        {collections.map((c) => (
                            <li key={c} className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => {dispatch(setSelectedCollection(c)); setCollectionOpen(false)}}>{c}</li>
                        ))}
                    </ul>
                )}
            </div>
            <input
                type="text"
                placeholder="Enter Prompt"
                className="flex-1 p-2 rounded border border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkConversationId()}
            />
            <button className="bg-purple-500 rounded p-2 text-white cursor-pointer"
                onClick={() => setOpen(true)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
            <button className="bg-green-600 rounded p-2 text-white cursor-pointer" onClick={checkConversationId}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
            </button>
            <UploadModal isOpen={open} onClose={() => setOpen(false)} />
        </div>
    )
}

export default Footer;