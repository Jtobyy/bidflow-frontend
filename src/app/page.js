"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { getUserFromStorage } from '@/app/utils/getUserFromStorage';


const Page = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (typeof window != 'undefined') {
            window.addEventListener('load', () => {    
                const user = getUserFromStorage();

                if (!isAuthenticated && !user) {
                    router.push('/auth/sign-in');
                } else if (user && isAuthenticated) {
                    const isProcurer = user.roles?.includes("procurer") || user.roles?.includes("procurer");
                    router.push(isProcurer ? '/procurer' : '/nativecrm');
                    return;
                } else {
                    router.push('/auth/sign-in');
                }
            });
        } 
    }, [])

    useEffect(() => {
        const user = getUserFromStorage();

        if (isAuthenticated && user) {
            const timer = setTimeout(() => {
                router.push('/procurer');   
                const isProcurer = user.roles?.includes("Procurer") || user.roles?.includes("procurer");
                router.push(isProcurer ? '/procurer' : '/procurer');
                return;
            }, 1000);
            return () => clearTimeout(timer);
        } else if (!isAuthenticated && !user) {
            router.push('/auth/sign-in');
        }
    }, [isAuthenticated])

    return (
        <div className="flex items-center justify-center h-screen bg-[#fffce8]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gray-400"></div>
        </div>
    );    
};

export default Page;
