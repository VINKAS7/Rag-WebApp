import {configureStore} from "@reduxjs/toolkit";
import footerReducer from "../features/footerSlice";
import chatReducer from "../features/chatSlice";
import notificationReducer from "../features/notificationSlice";

export const store = configureStore({
    reducer: {
        footer: footerReducer,
        chat: chatReducer,
        notification: notificationReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;