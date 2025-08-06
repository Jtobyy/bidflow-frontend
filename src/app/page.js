"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { getUserFromStorage, getCompanyFromStorage } from '@/app/utils/getUserFromStorage';


const Page = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (typeof window != 'undefined') {
            window.addEventListener('load', () => {    
                const user = getUserFromStorage();
                const company = getCompanyFromStorage();

                if (!isAuthenticated && !user) {
                    router.push('/auth/sign-in');
                } else if (user && isAuthenticated) {
                    const isProcurer = company?.type == "procurer" ;
                    router.push(isProcurer ? '/procurer' : '/vendor');
                    return;
                } else {
                    router.push('/auth/sign-in');
                }
            });
        } 
    }, [])

    useEffect(() => {
        const user = getUserFromStorage();
        const company = getCompanyFromStorage();

        if (isAuthenticated && user) {
            const timer = setTimeout(() => {
                const isProcurer = company?.type == "procurer";
                router.push(isProcurer ? '/procurer' : '/vendor');
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
