import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import { useDispatch } from "react-redux";
import { setConversationId, setModelName, setSelectedCollection } from "../features/footerSlice";
import { setHistory, setNewConversation } from "../features/chatSlice";

interface Conversation {
    conversation_summary: string;
    conversation_id: string;
}

function SideBar() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Get current conversation ID from the URL to highlight the active chat
    const { id: activeConversationId } = useParams<{ id: string }>();

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://localhost:3000/conversation/get_history");
                if (!res.ok) throw new Error("Failed to fetch history");
                const data = await res.json();
                setConversations(data);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleNewChat = () => {
        dispatch(setConversationId(null));
        dispatch(setHistory([]));
        dispatch(setModelName("Select Model"));
        dispatch(setSelectedCollection("Select Collection"));
        setIsOpen(true);
        navigate("/");
    };

    const loadConversation = async (convId: string) => {
        // ... (your existing loadConversation function is fine, no changes needed here)
        try {
            const res = await fetch(`http://localhost:3000/conversation/get_conversation/${convId}`);
            const data = await res.json();
            if (data.status === 'success') {
                const history = data.conversation_history || data.collection_conversation;
                if (Array.isArray(history)) {
                    dispatch(setHistory(history));
                } else {
                    dispatch(setHistory([]));
                    console.error("Error: API response is missing history array.", data);
                }
                dispatch(setConversationId(convId));
                dispatch(setModelName(data.modelName));
                dispatch(setSelectedCollection(data.collectionName));
                dispatch(setNewConversation(false));
                navigate(`/conversation/${convId}`);
            } else {
                console.error("Failed to load conversation:", data.detail);
            }
        } catch (error) {
            console.error("Error fetching conversation:", error);
        }
    };
    
    // --- NEW: Delete functionality ---
    const handleDeleteConversation = async (convId: string) => {
        try {
            // NOTE: You need to create this DELETE endpoint on your backend
            const res = await fetch(`http://localhost:3000/conversation/delete/${convId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error("Failed to delete conversation");

            // Remove conversation from the list without a full reload
            setConversations(prev => prev.filter(c => c.conversation_id !== convId));

        } catch (err) {
            console.error("Error deleting conversation:", err);
        }
    };
    
    const MenuIcon = ( <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> </svg> );
    const CloseIcon = ( <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> </svg> );
    const PlusIcon = ( <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /> </svg> );
    const TrashIcon = ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5"> <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg> );


    return (
        <div className={`bg-gray-900 text-white flex flex-col border-r border-gray-800 transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                {isOpen && <h2 className="text-lg font-semibold">History</h2>}
                {/* Justify center when closed for better alignment */}
                <button onClick={() => setIsOpen(!isOpen)} className={`p-2 hover:bg-gray-800 rounded cursor-pointer ${!isOpen && "mx-auto"}`}>
                    {isOpen ? CloseIcon : MenuIcon}
                </button>
            </div>

            <div className="p-2 border-b border-gray-800">
                <button onClick={handleNewChat} className={`flex items-center gap-3 w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium cursor-pointer transition-all ${!isOpen && "justify-center"}`}>
                    {PlusIcon}
                    {isOpen && "New Chat"}
                </button>
            </div>

            {isOpen && (
                <div className="flex-1 overflow-y-auto p-2 space-y-1"> {/* Added padding and space-y for gaps */}
                    {loading ? (
                        <div className="p-4 text-sm text-gray-400">Loading...</div>
                    ) : conversations.length > 0 ? (
                        conversations.map((conv) => (
                            // Use a 'group' for hover effects on child elements
                            <div 
                                key={conv.conversation_id}
                                // Highlight the active conversation
                                className={`group flex items-center justify-between rounded-md transition-colors ${activeConversationId === conv.conversation_id ? 'bg-blue-500/30' : 'hover:bg-gray-800'}`}
                            >
                                <button
                                    className="flex-grow flex items-center gap-2 px-3 py-2 text-left text-sm"
                                    onClick={() => loadConversation(conv.conversation_id)}
                                >
                                    <span className="truncate">{conv.conversation_summary}</span>
                                </button>
                                {/* Delete button: shows on group hover */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent loading conversation when deleting
                                        handleDeleteConversation(conv.conversation_id);
                                    }}
                                    className="p-2 mr-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {TrashIcon}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-sm text-gray-400">No history yet</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SideBar;