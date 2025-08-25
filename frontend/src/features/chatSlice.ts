import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type ChatMessage = {
    user?: string;
    model?: string;
};

interface ChatState {
    chats: ChatMessage[];
    newConversation: boolean
}

const initialState: ChatState = {
    chats: [],
    newConversation: false
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
        }
    }
});

export const {setChat, setHistory, setNewConversation, updateLastModelMessage} = chatSlice.actions;
export default chatSlice.reducer;