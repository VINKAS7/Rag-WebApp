import {configureStore} from "@reduxjs/toolkit"
import footerReducer from "../features/footerSlice"

export const store = configureStore({
    reducer: {
        footer: footerReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;