import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
    showErrorModal: boolean;
    showSuccessModal: boolean;
    errorMessage: string;
    successMessage: string;
}

const initialState: NotificationState = {
    showErrorModal: false,
    showSuccessModal: false,
    errorMessage: "",
    successMessage: ""
};

export const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        showError: (state, action: PayloadAction<string>) => {
            state.showErrorModal = true;
            state.errorMessage = action.payload;
        },
        hideError: (state) => {
            state.showErrorModal = false;
            state.errorMessage = "";
        },
        showSuccess: (state, action: PayloadAction<string>) => {
            state.showSuccessModal = true;
            state.successMessage = action.payload;
        },
        hideSuccess: (state) => {
            state.showSuccessModal = false;
            state.successMessage = "";
        }
    }
});

export const { showError, hideError, showSuccess, hideSuccess } = notificationSlice.actions;
export default notificationSlice.reducer;
