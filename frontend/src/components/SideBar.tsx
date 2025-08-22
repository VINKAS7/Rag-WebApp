import { useEffect, useState } from "react";

interface Conversation {
    id: string;
    name: string;
}

function SideBar() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch("/get_history");
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
        console.log("Create new chat");
    };

    // SVG icons
    const MenuIcon = (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );

    const CloseIcon = (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    const PlusIcon = (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    );

    return (
        <div
        className={`bg-gray-900 text-white flex flex-col border-r border-gray-800 transition-all duration-300
            ${isOpen ? "w-64" : "w-16"}`}
        >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
            {isOpen && <h2 className="text-lg font-semibold">History</h2>}
            <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-800 rounded cursor-pointer"
            >
            {isOpen ? CloseIcon : MenuIcon}
            </button>
        </div>

        {/* NEW CHAT BUTTON */}
        <div className="p-2 border-b border-gray-800">
            <button
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium cursor-pointer"
            >
            {PlusIcon}
            {isOpen && "New Chat"}
            </button>
        </div>

        {/* HISTORY LIST */}
        <div className="flex-1 overflow-y-auto">
            {loading ? (
            <div className="p-4 text-sm text-gray-400">Loading...</div>
            ) : conversations.length > 0 ? (
            conversations.map((conv) => (
                <button
                    key={conv.id}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-800 cursor-pointer"
                >
                    {isOpen ? conv.name : conv.name.charAt(0).toUpperCase()}
                </button>
                ))
            ) : (
                <div className="p-4 text-sm text-gray-400">No history yet</div>
            )}
            </div>
        </div>
    );
}

export default SideBar;
