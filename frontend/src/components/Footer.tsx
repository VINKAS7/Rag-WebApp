import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCollection, setProvider, setConversationId } from "../features/footerSlice";
import type { RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import {v4 as uuidv4} from "uuid"
import { setChat } from "../features/chatSlice";

function Footer(){
    const [modelListOpen, setmodelListOpen] = useState(false);
    const [collectionOpen, setCollectionOpen] = useState(false);
    const [collections, setCollections] = useState([]);
    const [userPrompt, setUserPrompt] = useState("");
    const dispatch = useDispatch();
    const selectedCollection = useSelector((state: RootState) => state.footer.selectedCollection);
    const provider = useSelector((state: RootState) => state.footer.provider);
    const navigate = useNavigate();
    const conversationId = useSelector((state: RootState) => state.footer.conversationId);
    useEffect(() => {
        const getCollections = async () => {
            const res = await fetch("http://localhost:3000/api/get_collections");
            const c = await res.json();
            setCollections(c.collections);
        }
        getCollections();
    }, []);
    async function checkConversationId(){
        const cid = uuidv4();
        if(!conversationId){
            dispatch(setConversationId(cid));
            navigate("/conversation/"+cid, {
                state: {
                    "user": userPrompt
                }
            });
        }
        dispatch(setChat({"user": userPrompt}));
        const response = await fetch("http://localhost:3000/conversation/get_response",{
            method: "POST",
            body: JSON.stringify({
                "provider": useSelector((state: RootState) => state.footer.provider),
                "modelName": useSelector((state: RootState) => state.footer.modelName),
                "user": userPrompt,
                "conversation_id": useSelector((state: RootState) => state.footer.conversationId),
                "collectionName": useSelector((state: RootState) => state.footer.selectedCollection)
            })
        });
        dispatch(setChat({"model": await response.json()}));
        setUserPrompt("");
    }
    return(
        <div className="flex justify-center align-center py-10 pt-5 gap-2">
            <div className="relative inline-block">
                <button
                    onClick={() => setmodelListOpen(!modelListOpen)}
                    className="bg-blue-500 text-white rounded p-2"
                >
                    <p className="flex items-center gap-1 cursor-pointer">
                        <span>{provider}</span>  
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                            </svg>
                        </span>
                    </p>
                    
                </button>
                {modelListOpen && (
                    <ul className="absolute bottom-full mb-2 w-40 bg-white shadow-lg rounded-lg border">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => dispatch(setProvider("ChatGPT"))}>ChatGPT</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => dispatch(setProvider("Gemini"))}>Gemini</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => dispatch(setProvider("Claude"))}>Claude</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => dispatch(setProvider("Ollama"))}>Ollama</li>
                    </ul>
                )}
            </div>
            <div className="relative inline-block">
                <button
                    onClick={() =>{
                        setCollectionOpen(!collectionOpen);
                    } }
                    className="bg-green-500 text-white rounded p-2 cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                    {selectedCollection}
                </button>
                {collectionOpen && (
                    <ul className="absolute bottom-full mb-2 w-40 bg-white shadow-lg rounded-lg border">
                        {
                            collections.map((c) => {
                                return(
                                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => setSelectedCollection(c)}>{c}</li>
                                )
                            })
                        }
                    </ul>
                )}
            </div>
            <input
                type="text"
                placeholder="Enter Prompt"
                className="w-[40%] p-2 rounded border border-gray-400 focus:outline-none focus:ring-0"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
            />
            <button className="bg-blue-500 rounded p-2 text-white cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
            <button className="bg-green-500 rounded p-2 text-white cursor-pointer" onClick={checkConversationId}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
            </button>
        </div>
    )
}

export default Footer;