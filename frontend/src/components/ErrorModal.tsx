import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { hideError } from '../features/notificationSlice';

const ErrorModal: React.FC = () => {
    const dispatch = useDispatch();
    const { showErrorModal, errorMessage } = useSelector((state: RootState) => state.notification);

    const handleClose = () => {
        dispatch(hideError());
    };

    if (!showErrorModal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-[#2C2C2E] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-white">Error</h3>
                    </div>
                </div>
                <div className="mt-2">
                    <p className="text-sm text-white">{errorMessage}</p>
                </div>
                <div className="mt-6">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center cursor-pointer px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-0"
                        onClick={handleClose}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorModal;
