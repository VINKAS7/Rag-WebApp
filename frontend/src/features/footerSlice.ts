import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    selectedCollection: "Select Collection",
    modelName: "Select Model",
    conversationId: null
};

export const footerSlice = createSlice({
    name:"footer",
    initialState,
    reducers:{
        setSelectedCollection: (state,action) => {
            state.selectedCollection = action.payload;
        },
        setModelName: (state, action) => {
            state.modelName = action.payload;
        },
        setConversationId: (state, action) => {
            state.conversationId = action.payload;
        }
    }
});

export const { setSelectedCollection, setModelName, setConversationId} = footerSlice.actions;
export default footerSlice.reducer;