import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    provider: "Select Provider",
    selectedCollection: "",
    modelName: "",
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
    }
});

export const {setProvider, setSelectedCollection, setModelName} = footerSlice.actions;
export default footerSlice.reducer;