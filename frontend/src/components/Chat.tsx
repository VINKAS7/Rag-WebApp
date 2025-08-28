import type { RootState } from "../app/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setChat, setNewConversation, updateLastModelMessage, setHistory } from "../features/chatSlice";
import { setConversationId, setModelName, setSelectedCollection } from "../features/footerSlice";
import { useLocation, useParams } from "react-router-dom";
import { Skeleton } from "@mui/material";

function Chat() {
    const dispatch = useDispatch();
    const location = useLocation();
    const { id: conversationIdFromUrl } = useParams<{ id: string }>(); 
    const conversation = useSelector((state: RootState) => state.chat?.chats ?? []);
    const newConversation = useSelector((state: RootState) => state.chat.newConversation);
    const { selectedCollection, modelName } = useSelector((state: RootState) => state.footer);
    const lastMessage = conversation.length > 0 ? conversation[conversation.length - 1] : null;
    const [isBootstrapping, setIsBootstrapping] = useState(false);

    function isPlaceholderSelection(value?: string | null) {
        if (!value) return true;
        const v = value.toLowerCase();
        return v === "select model" || v === "select collection";
    }

    useEffect(() => {
        const bootstrapConversation = async () => {
            if (!conversationIdFromUrl || conversation.length > 0) return;
            try {
                setIsBootstrapping(true);
                const res = await fetch(`http://localhost:3000/conversation/get_conversation/${conversationIdFromUrl}`);
                const data = await res.json();
                if (data.status === 'success') {
                    const history = data.conversation_history || data.collection_conversation;
                    if (Array.isArray(history)) {
                        dispatch(setHistory(history));
                    } else {
                        dispatch(setHistory([]));
                    }
                    if (data.modelName) dispatch(setModelName(data.modelName));
                    if (data.collectionName) dispatch(setSelectedCollection(data.collectionName));
                    dispatch(setConversationId(conversationIdFromUrl));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsBootstrapping(false);
            }
        };
        bootstrapConversation();
    }, [conversationIdFromUrl]);

    useEffect(() => {
        if (newConversation && (location.state as any)?.user) {
            dispatch(setChat({ user: (location.state as any).user }));
            dispatch(setNewConversation(false));
        }
    }, [dispatch, location.state, newConversation]);

    useEffect(() => {
        const fetchResponse = async (userPrompt: string) => {
            if (isPlaceholderSelection(modelName) || isPlaceholderSelection(selectedCollection) || !conversationIdFromUrl) {
                return;
            }
            dispatch(setChat({ model: "Fetching response..." }));
            const response = await fetch("http://localhost:3000/conversation/get_response", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "modelName": modelName,
                    "prompt": userPrompt,
                    "conversation_id": conversationIdFromUrl,
                    "collectionName": selectedCollection
                })
            });
            const data = await response.json();
            if (data.status === "success") {
                dispatch(updateLastModelMessage({ model: data.model_response }));
            } else {
                dispatch(updateLastModelMessage({ model: "Error: Failed to get a response." }));
            }
        };
        if (lastMessage && lastMessage.user && !lastMessage.model) {
            fetchResponse(lastMessage.user);
        }
    }, [lastMessage, modelName, selectedCollection, conversationIdFromUrl, dispatch]);

    const isFetchingModelResponse = Boolean(lastMessage && lastMessage.model === "Fetching response...");

    return (
        <div className="p-4 flex flex-col space-y-3">
            {isBootstrapping && (
                <div className="flex flex-col gap-2 w-full">
                    <Skeleton variant="rectangular" height={20} width="60%" />
                    <Skeleton variant="rectangular" height={20} width="40%" />
                    <Skeleton variant="rectangular" height={20} width="70%" />
                </div>
            )}
            {conversation.map((msg, idx) => {
                const isModelFetchingPlaceholder = msg.model === "Fetching response...";
                const isUser = Boolean(msg.user);
                return (
                    <div
                        key={idx}
                        className={`p-3 rounded-xl max-w-[70%] w-fit ${
                            isUser ? "bg-blue-500 text-white self-end ml-auto" : "bg-gray-200 text-black self-start mr-auto"
                        }`}
                    >
                        {isModelFetchingPlaceholder ? (
                            <div className="flex flex-col gap-2 w-64">
                                <Skeleton variant="text" width="90%" />
                                <Skeleton variant="text" width="75%" />
                                <Skeleton variant="text" width="60%" />
                            </div>
                        ) : (
                            msg.user || msg.model
                        )}
                    </div>
                );
            })}
            {isFetchingModelResponse && conversation.length === 0 && (
                <div className="flex flex-col gap-2 w-64">
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="75%" />
                    <Skeleton variant="text" width="60%" />
                </div>
            )}
        </div>
    );
}

export default Chat;