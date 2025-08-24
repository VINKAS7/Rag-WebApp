import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    provider: "Select Provider",
    selectedCollection: null,
    modelName: null,
    conversationId: null
};

export const footerSlice = createSlice({
    name:"footer",
    initialState,
    reducers:{
        setProvider: (state, action) => {
            state.provider = action.payload;
        },
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

export const {setProvider, setSelectedCollection, setModelName, setConversationId} = footerSlice.actions;
export default footerSlice.reducer;