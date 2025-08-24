import {configureStore} from "@reduxjs/toolkit";
import footerReducer from "../features/footerSlice";
import chatReducer from "../features/chatSlice";

export const store = configureStore({
    reducer: {
        footer: footerReducer,
        chat: chatReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;