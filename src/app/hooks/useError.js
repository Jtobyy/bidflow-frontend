"use client";

import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState('');
    const { logout } = useAuth;

    const handleApiError = (error) => {
        console.error("API Error:", error);
        const errorData = error?.response?.data?.error;

        if (errorData && typeof errorData === 'object') {
            for (let field in errorData) {
                if (errorData.hasOwnProperty(field)) {
                    const fieldErrors = errorData[field];
                    fieldErrors.forEach((msg) => {
                        toast.error(`${field} ${msg}`);
                        return;
                    });
                }
            }
        } else {
            const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.response?.data?.error;
            toast.error(errorMessage);
            setError(errorMessage);
            return
        }
    };

    return (
        <ErrorContext.Provider value={{ error, setError, handleApiError }}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = () => useContext(ErrorContext);
