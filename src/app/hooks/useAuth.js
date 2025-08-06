'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NProgress from '../services/nprogress';
import { useRouter } from 'next/navigation';
import axios from 'axios';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Error parsing user data from localStorage:", error);
                }
            }

            const handleStorageChange = () => {
                const storedUser = localStorage.getItem('user');
                setUser(storedUser ? JSON.parse(storedUser) : null);
            }

            window.addEventListener('storage', handleStorageChange);
    
            setLoading(false); 

            return () => {
                window.removeEventListener('storage', handleStorageChange);
            };
        }
    }, []);

    const login = (data) => {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('company', JSON.stringify(data.company));
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        toast.success('Login Successful');
    
        setLoading(false);
        setIsAuthenticated(true);
    };    

    const logout = () => {
        NProgress.setColor('green');
        NProgress.start();

        setUser(null);
        localStorage.clear();
        setIsAuthenticated(false);
        setLoading(false);
        
        toast.warning("You've been logged out");
        NProgress.done();
        
        router.push('/auth/sign-in');
    };

    return (
        <AuthContext.Provider value={{ setUser, user, login, isAuthenticated, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
