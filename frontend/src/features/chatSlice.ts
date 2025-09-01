import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type ChatMessage = {
    user?: string;
    model?: string;
};

interface ChatState {
    chats: ChatMessage[];
    newConversation: boolean;
    isStreaming: boolean;
}

const initialState: ChatState = {
    chats: [],
    newConversation: false,
    isStreaming: false
};

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        updateLastModelMessage: (state, action: PayloadAction<{ model: string }>) => {
            const lastMessage = state.chats[state.chats.length - 1];
            if (lastMessage && !lastMessage.user) {
                lastMessage.model = action.payload.model;
            }
        },
        setChat: (state, action: PayloadAction<ChatMessage>) => {
            state.chats.push(action.payload);
        },
        setHistory: (state, action: PayloadAction<ChatMessage[]>) => {
            state.chats = action.payload;
        },
        setNewConversation: (state, action) => {
            state.newConversation = action.payload;
        },
        setIsStreaming: (state, action: PayloadAction<boolean>) => {
            state.isStreaming = action.payload;
        }
    }
});

export const { setChat, setHistory, setNewConversation, updateLastModelMessage, setIsStreaming } = chatSlice.actions;
export default chatSlice.reducer;