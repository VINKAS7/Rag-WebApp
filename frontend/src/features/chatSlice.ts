import { createSlice } from "@reduxjs/toolkit";

type Chat = {
    conversation: string;
};
interface ChatState {
    chats: Chat[];
}

const initialState: ChatState = {
    chats: [],
};

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setChat: (state, action) => {
            state.chats.push(action.payload);
        }
    }
});

export const {setChat} = chatSlice.actions;
export default chatSlice.reducer;