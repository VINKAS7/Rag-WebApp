import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { hideSuccess } from '../features/notificationSlice';

const SuccessModal: React.FC = () => {
    const dispatch = useDispatch();
    const { showSuccessModal, successMessage } = useSelector((state: RootState) => state.notification);

    const handleClose = () => {
        dispatch(hideSuccess());
    };

    if (!showSuccessModal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">Success</h3>
                    </div>
                </div>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">{successMessage}</p>
                </div>
                <div className="mt-6">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={handleClose}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
