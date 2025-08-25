import type { RootState } from "../app/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setChat, setNewConversation, updateLastModelMessage } from "../features/chatSlice";
import { useLocation, useParams } from "react-router-dom";

function Chat() {
    const dispatch = useDispatch();
    const location = useLocation();
    const { id: conversationIdFromUrl } = useParams<{ id: string }>(); 
    const conversation = useSelector((state: RootState) => state.chat?.chats ?? []);
    const newConversation = useSelector((state: RootState) => state.chat.newConversation);
    const { selectedCollection, modelName } = useSelector((state: RootState) => state.footer);
    const lastMessage = conversation.length > 0 ? conversation[conversation.length - 1] : null;
    useEffect(() => {
        if (newConversation && location.state?.user) {
            dispatch(setChat({ user: location.state.user }));
            dispatch(setNewConversation(false));
        }
    }, [dispatch, location.state, newConversation]);
    useEffect(() => {
        const fetchResponse = async (userPrompt: string) => {
            if (!modelName || !selectedCollection || !conversationIdFromUrl) {
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

    return (
        <div className="flex-1 p-4 flex flex-col space-y-3 overflow-y-auto">
            {conversation.map((msg, idx) => (
                <div
                    key={idx}
                    className={`p-3 rounded-xl max-w-[70%] w-fit ${
                        msg.user
                            ? "bg-blue-500 text-white self-end ml-auto"
                            : "bg-gray-200 text-black self-start mr-auto"
                    }`}
                >
                    {msg.user || msg.model}
                </div>
            ))}
        </div>
    );
}

export default Chat;