import type { RootState } from "../app/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setChat, setHistory } from "../features/chatSlice";  
import { useLocation } from "react-router-dom";

function Chat(){
    const conversationId = useSelector((state: RootState) => state.footer.conversationId);
    const conversation = useSelector((state: RootState) => state.chat.chats);
    const lastMessage = conversation[conversation.length - 1];
    const dispatch = useDispatch();
    const selectedCollection = useSelector((state: RootState) => state.footer.selectedCollection);
    const provider = useSelector((state: RootState) => state.footer.provider);
    const modelName = useSelector((state: RootState) => state.footer.modelName);
    useEffect(() => {
        async function loadConversation() {
            const res = await fetch("http://localhost:3000/conversation/get_conversation/"+conversationId);
            const data = await res.json();
            dispatch(setHistory(data));
        }
        const newConversation = useSelector((state: RootState) => state.chat.newConversation);
        if(newConversation){
            const location = useLocation();
            dispatch(setChat({"user": location.state.user}));
        }
        else{
            loadConversation();
        }
    }, []);
    useEffect(() => {
        if(lastMessage && lastMessage.user){
            fetchResponse(lastMessage.user);
        }
    },[lastMessage]);
    async function fetchResponse(userPrompt: string) {
        const response = await fetch("http://localhost:3000/conversation/get_response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "provider": provider,
                "modelName": modelName,  
                "user": userPrompt,
                "conversation_id": conversationId,
                "collectionName": selectedCollection
            })
        });

        const data = await response.json();
        dispatch(setChat({ "model": data.response }));
    }
    return(
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {conversation.map((msg, idx) => (
                <div
                    key={idx}
                    className={`p-2 rounded-xl max-w-[70%] ${
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