"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useError } from '@/app/hooks/useError';
import { useApi } from '@/app/services/axios';
import Footer from '@/app/components/auth/Footer';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


const SignIn = () => {
    const router = useRouter();
    const { api, loading } = useApi();
    const { handleApiError } = useError();
    const { user, login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user]);

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        if (id === 'username') setUsername(value);
        if (id === 'password') setPassword(value);
    };

    const handleTogglePasswordVisibility = (e) => {
        e.preventDefault();
        setShowPassword((prev) => !prev);
    };

    const handleSignIn = async (event) => {
        event.preventDefault();
        try {
            const response = await api.post('/auth/login/', {
                username,
                password,
            });
            if (response.status === 200) {
                login(response.data);
                setTimeout(() => {
                    router.push('/');
                }, 200);
            }
        } catch (error) {
            handleApiError(error)
        }
    };

    const handleCreateAccountRedirect = () => {
        const currentUrl = window.location.href;
        const isLocalhost = currentUrl.includes("localhost");
        const hostname = window.location.hostname;

        if (isLocalhost) {
            router.push('/auth/sign-up');
        } else if (hostname.includes("staging.bidflow.com")) {
            window.location.href = "https://staging.bidflow.com/auth/sign-up";
        } else if (hostname.includes("bidflow.com")) {
            window.location.href = "https://bidflow.com/auth/sign-up";
        }
    };

    const isFormValid = username && password;

    return (
        <div className="flex min-h-screen bg-[#fffce8]" style={{ height: '100%', overflow: 'hidden', fontFamily: 'var(--font-space-grotesk), Arial, Helvetica, sans-serif' }}>
            {/* Left panel: image, accent bar, and info */}
            <div className="w-1/2 flex flex-col">
                <div className="flex-grow">
                    <img
                        src="/assets/panel.jpg"
                        alt="Sign in"
                        className="object-cover w-full h-full"
                        style={{ height: '100%', background: '#e9e9e0' }}
                    />
                </div>
                <div style={{ height: '4px', backgroundColor: '#08305e' }}></div>
                <div className="bg-[#08305e] p-8 text-white flex flex-col items-start">
                    <span className="text-4xl font-bold text-[#fffce8] tracking-tight" style={{ letterSpacing: '-1px', fontFamily: 'inherit' }}>
                        <span className="text-[#fffce8]">Bid</span>
                        <span className="text-[#38a0f7]">Flow</span>
                    </span>
                    <h2 className="text-3xl font-bold text-white leading-tight mt-4" style={{ fontFamily: 'inherit' }}>
                        Manage your <br /> procurement flow.
                    </h2>
                    <p className="text-white mt-2">Evaluate bids. Achieve compliance. Streamline tendering.</p>
                </div>
            </div>

            {/* Right panel: Sign-in form */}
            <div className="w-1/2 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-md mt-[100px] relative">
                    <Image
                        src="/assets/ornament.svg"
                        alt="Curved arrow ornament"
                        width={70}
                        height={70}
                        className="absolute -top-12 -left-10 select-none pointer-events-none"
                        draggable={false}
                        priority
                    />

                    <h2 className="text-4xl font-bold text-[#08305e] text-left mb-2 mt-30" style={{ fontFamily: 'inherit' }}>Welcome Back</h2>
                    <p className="text-[#406087] text-left mb-6">Enter your details to sign in</p>
                    <form onSubmit={handleSignIn}>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium text-[#08305e]">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="mt-1 block w-full px-3 py-2 border border-[#406087] rounded-md shadow-sm text-[#08305e] focus:[#08305e] focus:ring-[#08305e] focus:border-[#08305e] sm:text-sm bg-[#fffce8]"
                                id="username"
                                placeholder="username"
                                value={username}
                                onChange={handleInputChange}
                                required
                                style={{ fontFamily: 'inherit' }}
                            />
                        </div>
                        <label htmlFor="password" className="block text-sm font-medium text-[#08305e]">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="mt-1 block w-full p-2 border border-[#406087] rounded-md shadow-sm text-[#08305e] focus:[#08305e] focus:ring-[#08305e] focus:border-[#08305e] sm:text-sm bg-[#fffce8]"
                                id="password"
                                placeholder="*********"
                                value={password}
                                onChange={handleInputChange}
                                required
                                style={{ fontFamily: 'inherit' }}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 px-3 text-[#08305e]"
                                onClick={handleTogglePasswordVisibility}
                                aria-label={showPassword ? "hide password" : "show password"}
                            >
                                <FontAwesomeIcon
                                    icon={showPassword ? faEyeSlash : faEye}
                                    className="w-5 h-5 cursor-pointer"
                                />
                            </button>
                        </div>
                        <div className="flex hidden items-center justify-between mb-4 mt-3">
                            <span />
                            <a href="/auth/password-reset" className="text-sm text-[#08305e] hover:underline">Forgot Password?</a>
                        </div>
                        <button
                            type="submit"
                            className={` mt-10 w-full cursor-pointer py-2 rounded-md text-white focus:outline-none transition 
                                ${isFormValid ? 'bg-[#08305e] hover:bg-[#062141]' : 'bg-[#d5dbeb] cursor-not-allowed text-gray-500 disabled:text-gray-400'}`}
                            disabled={!isFormValid || loading}
                            style={{ fontFamily: 'inherit' }}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>
                <div style={{ width: 500 }} className="text-xs mt-auto pt-6">
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default SignIn;
