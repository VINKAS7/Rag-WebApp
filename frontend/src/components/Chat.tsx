import type { RootState } from "../app/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setChat, setNewConversation, updateLastModelMessage, setHistory, setIsStreaming } from "../features/chatSlice";
import { setConversationId, setModelName, setSelectedCollection } from "../features/footerSlice";
import { showError } from "../features/notificationSlice";
import { useLocation, useParams } from "react-router-dom";
import { Skeleton } from "@mui/material";

function Chat() {
    const dispatch = useDispatch();
    const location = useLocation();
    const { id: conversationIdFromUrl } = useParams<{ id: string }>();
    const conversation = useSelector((state: RootState) => state.chat?.chats ?? []);
    const newConversation = useSelector((state: RootState) => state.chat.newConversation);
    const isStreaming = useSelector((state: RootState) => state.chat.isStreaming);
    const { selectedCollection, modelName } = useSelector((state: RootState) => state.footer);
    const lastMessage = conversation.length > 0 ? conversation[conversation.length - 1] : null;
    const [isBootstrapping, setIsBootstrapping] = useState(false);

    function isPlaceholderSelection(value?: string | null) {
        if (!value) return true;
        const v = value.toLowerCase();
        return v === "select model" || v === "select collection";
    }

    const streamResponse = async (userPrompt: string) => {
        if (isPlaceholderSelection(modelName) || isPlaceholderSelection(selectedCollection) || !conversationIdFromUrl) {
            return;
        }

        dispatch(setIsStreaming(true));
        dispatch(setChat({ model: "" }));

        try {
            const response = await fetch("http://localhost:3000/conversation/get_response_stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "modelName": modelName,
                    "prompt": userPrompt,
                    "conversation_id": conversationIdFromUrl,
                    "collectionName": selectedCollection
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("No reader available");
            }

            const decoder = new TextDecoder();
            let accumulatedResponse = "";
            let isComplete = false;

            while (true) {
                const { done, value } = await reader.read();
            
                if (done) {
                    if (!isComplete && accumulatedResponse) {
                        dispatch(updateLastModelMessage({ model: accumulatedResponse }));
                    }
                    dispatch(setIsStreaming(false));
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ') && line.length > 6) {
                        try {
                            const jsonData = JSON.parse(line.slice(6));
                        
                            if (jsonData.status === 'streaming' && jsonData.chunk) {
                                accumulatedResponse += jsonData.chunk;
                                dispatch(updateLastModelMessage({ model: accumulatedResponse }));
                            } else if (jsonData.status === 'complete') {
                                isComplete = true;
                                if (jsonData.full_response) {
                                    dispatch(updateLastModelMessage({ model: jsonData.full_response }));
                                } else {
                                    dispatch(updateLastModelMessage({ model: accumulatedResponse }));
                                }
                                dispatch(setIsStreaming(false));
                                return;
                            } else if (jsonData.status === 'error') {
                                dispatch(updateLastModelMessage({ model: `Error: ${jsonData.error}` }));
                                dispatch(showError("Failed to get a response from the model. Please try again."));
                                dispatch(setIsStreaming(false));
                                return;
                            }
                        } catch (parseError) {
                            console.warn("Failed to parse streaming data:", line);
                        }
                    }
                }
            }

        } catch (error) {
            console.error("Streaming error:", error);
            dispatch(updateLastModelMessage({ model: "Error: Failed to get a response." }));
            dispatch(showError("Failed to get a response from the model. Please try again."));
        } finally {
            dispatch(setIsStreaming(false));
        }
    };

    useEffect(() => {
        const bootstrapConversation = async () => {
            if (newConversation) {
                return;
            }

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
                dispatch(showError("Failed to load conversation. Please try again."));
            } finally {
                setIsBootstrapping(false);
            }
        };

        bootstrapConversation();
    }, [conversationIdFromUrl, newConversation]);

    useEffect(() => {
        if (newConversation && (location.state as any)?.user) {
            dispatch(setChat({ user: (location.state as any).user }));
            dispatch(setNewConversation(false));
        }
    }, [dispatch, location.state, newConversation]);

    useEffect(() => {
        if (lastMessage && lastMessage.user && !lastMessage.model && !isStreaming) {
            streamResponse(lastMessage.user);
        }
    }, [lastMessage, modelName, selectedCollection, conversationIdFromUrl, isStreaming]);

    const isFetchingModelResponse = isStreaming || Boolean(lastMessage && lastMessage.model === "");

    return (
        <div className="p-10 flex flex-col space-y-3">
            {isBootstrapping && (
                <div className="flex flex-col gap-2 w-full">
                    <Skeleton variant="rectangular" height={20} width="30%" />
                    <Skeleton variant="rectangular" height={20} width="40%" />
                    <Skeleton variant="rectangular" height={20} width="50%" />
                </div>
            )}
            {conversation.map((msg, idx) => {
                const isModelStreaming = isStreaming && idx === conversation.length - 1 && !msg.user;
                const isUser = Boolean(msg.user);

                return (
                    <div
                        key={idx}
                        className={`p-3 rounded-xl max-w-[70%] w-fit ${
                            isUser ? "bg-white text-black self-end ml-auto" : "bg-[#2C2C2E] text-white self-start mr-auto"
                        }`}
                    >
                        {isModelStreaming && (!msg.model || msg.model === "") ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-pulse">Thinking...</div>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap">
                                {msg.user || msg.model}
                                {isModelStreaming && msg.model && (
                                    <span className="animate-pulse">|</span>
                                )}
                            </div>
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