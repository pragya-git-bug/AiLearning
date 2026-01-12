import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, Globe, ArrowLeft, Mail, Lock, Phone, X, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import loginMosaic from '../../../assets/images/landing/login_mosaic.png';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserFromAPI } from '../../../redux/slices/credencials/Credential';
import { loginUser } from '../../../services/api';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = useState(false);
    const [viewMode, setViewMode] = useState('initial'); // 'initial', 'phone', 'email'
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState('success'); // 'success' or 'error'
    const [loginAttempted, setLoginAttempted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        credential: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleContinueWithPhone = () => {
        setViewMode('phone');
        setFormData({ credential: '', password: '' });
    };

    const handleContinueWithEmail = () => {
        setViewMode('email');
        setFormData({ credential: '', password: '' });
    };

    const handleContinueWithGoogle = () => {
        setSnackbarMessage('Google login is not working right now');
        setSnackbarType('error');
        setShowSnackbar(true);
        setTimeout(() => {
            setShowSnackbar(false);
        }, 3000);
    };

    const handleBack = () => {
        setViewMode('initial');
        setFormData({ credential: '', password: '' });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!formData.credential || !formData.password) {
            setSnackbarMessage('Please fill in all fields');
            setSnackbarType('error');
            setShowSnackbar(true);
            setTimeout(() => {
                setShowSnackbar(false);
            }, 3000);
            return;
        }

        setIsLoading(true);
        setLoginAttempted(true);

        // Determine if credential is email or phone
        const isEmail = formData.credential.includes('@');
        const email = isEmail ? formData.credential : null;
        
        // For phone number login, you might need to adjust the API endpoint
        // For now, assuming API accepts email only
        if (!isEmail) {
            setSnackbarMessage('Please use email address for login');
            setSnackbarType('error');
            setShowSnackbar(true);
            setIsLoading(false);
            setLoginAttempted(false);
            setTimeout(() => {
                setShowSnackbar(false);
            }, 3000);
            return;
        }

        try {
            // Call API
            const result = await loginUser(email, formData.password);
            
            if (result.success && result.data.success) {
                // Dispatch action to set user from API response
                dispatch(setUserFromAPI(result.data.data));
                
                setSnackbarMessage(`Welcome, ${result.data.data.fullName || result.data.data.name}! Login successful.`);
                setSnackbarType('success');
                setShowSnackbar(true);
                
                setTimeout(() => {
                    setShowSnackbar(false);
                    // Navigate based on user role
                    const userRole = result.data.data.role?.toLowerCase() || 'student';
                    const dashboardRoute = userRole === 'teacher' 
                        ? '/teacher/dashboard' 
                        : '/student/dashboard';
                    navigate(dashboardRoute);
                }, 2000);
            } else {
                setSnackbarMessage(result.error || result.data.message || 'Invalid credentials. Please check your email and password.');
                setSnackbarType('error');
                setShowSnackbar(true);
                setTimeout(() => {
                    setShowSnackbar(false);
                }, 3000);
            }
        } catch (error) {
            setSnackbarMessage(error.message || 'An error occurred during login. Please try again.');
            setSnackbarType('error');
            setShowSnackbar(true);
            setTimeout(() => {
                setShowSnackbar(false);
            }, 3000);
        } finally {
            setIsLoading(false);
            setLoginAttempted(false);
        }
    };


    return (
        <div className="h-screen w-full flex flex-col relative overflow-hidden font-sans bg-black">
            {/* Background Mosaic */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${loginMosaic})`,
                    filter: 'brightness(0.4) saturate(1.1)'
                }}
            />

            {/* Black Vignette Shadows (Top and Bottom) */}
            <div className="fixed inset-x-0 top-0 h-32 z-1 bg-gradient-to-b from-black/80 to-transparent" />
            <div className="fixed inset-x-0 bottom-0 h-32 z-1 bg-gradient-to-t from-black/80 to-transparent" />

            {/* Top Navbar */}
            <nav className="relative z-20 w-full px-10 py-5 flex items-center justify-between shrink-0">
                <div
                    className="flex items-center cursor-pointer group z-30"
                    onClick={() => navigate('/')}
                >
                    <span
                        className="text-white text-4xl font-normal tracking-tight group-hover:text-purple-200 transition-colors"
                        style={{ fontFamily: "'Pacifico', cursive" }}
                    >
                        EduCollaborate
                    </span>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-8 text-white/90 text-sm uppercase tracking-widest z-20">
                    {['Student', 'Teachers', 'Parents', 'Admin', 'Help'].map((item) => (
                        <button key={item} className="hover:text-white transition-all hover:scale-105">{item}</button>
                    ))}
                </div>

                {/* Spacer to maintain layout balance */}
                <div className="hidden lg:block w-[180px] invisible"></div>
            </nav>

            {/* Centered Login Content */}
            <main className="relative z-20 flex-grow flex flex-col items-center justify-center px-4 -mt-8">

                {/* Login Card */}
                <div className="bg-white backdrop-blur-md w-full max-w-[430px] rounded-[1rem] p-6 lg:px-10 lg:py-15 mt-15 font-sans">
                    {viewMode === 'initial' ? (
                        /* Initial View - Login Options */
                        <div className="space-y-6">
                            <div className="text-left space-y-2">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Log in or sign up in seconds
                                </h1>
                                <p className="text-base font-normal text-gray-600">
                                    Use your email or another service to continue with EduCollaborate (it's free)!
                                </p>
                            </div>

                            {/* Continue with Phone Number */}
                            <button
                                onClick={handleContinueWithPhone}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-base font-normal hover:bg-gray-50 transition-all active:scale-[0.98]"
                            >
                                <Phone size={22} strokeWidth={1.5} className="text-gray-600" />
                                <span className="text-base font-normal">Continue with phone number</span>
                            </button>

                            {/* Continue with Google */}
                            <button
                                onClick={handleContinueWithGoogle}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-base font-normal hover:bg-gray-50 transition-all active:scale-[0.98]"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span className="text-base font-normal">Continue with Google</span>
                            </button>

                            {/* Continue with Email */}
                            <button
                                onClick={handleContinueWithEmail}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-base font-normal hover:bg-gray-50 transition-all active:scale-[0.98]"
                            >
                                <Mail size={22} strokeWidth={1.5} className="text-gray-600" />
                                <span className="text-base font-normal">Continue with email</span>
                            </button>

                            {/* Alternative Option */}
                            <div className="text-center">
                                <button type="button" className="text-gray-600 text-sm font-normal hover:text-gray-900 transition-colors">
                                    Continue another way
                                </button>
                            </div>

                            {/* Terms and Privacy */}
                            <div className="text-center text-xs font-normal text-gray-500 pt-2">
                                By continuing, you agree to EduCollaborate's{' '}
                                <button type="button" className="text-purple-600 hover:text-purple-700 font-normal underline">
                                    Terms of Use.
                                </button>
                                {' '}Read our{' '}
                                <button type="button" className="text-purple-600 hover:text-purple-700 font-normal underline">
                                    Privacy Policy.
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Form View - Phone or Email - Matching Image Style */
                        <form className="space-y-6 font-sans">
                            {/* Back Button - Top Left */}
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center gap-2 text-gray-900 hover:text-gray-700 text-base font-normal mb-4 -ml-1"
                            >
                                <ArrowLeft size={20} strokeWidth={2} />
                            </button>

                            {/* Title */}
                            <div className="space-y-2 text-left">
                                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                    Continue with phone number or email
                                </h1>
                                <p className="text-base font-normal text-gray-600 leading-relaxed">
                                    We'll check if you have an account, and help create one if you don't.
                                </p>
                            </div>

                            {/* Phone/Email Input Field */}
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-semibold text-gray-900">
                                    Phone/Email (personal or work)
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={viewMode === 'phone' ? 'tel' : 'text'}
                                        name="credential"
                                        value={formData.credential}
                                        onChange={handleChange}
                                        placeholder="Phone number or email"
                                        className="w-full pl-4 pr-24 py-3.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-base font-normal focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-gray-400"
                                    />
                                    {/* Country Code Dropdown - Right Side */}
                                    <div className="absolute right-2 flex items-center gap-1 px-2 py-1 border-l border-gray-300 pl-3 cursor-pointer hover:bg-gray-50 rounded">
                                        <span className="text-base font-bold text-gray-900">IN</span>
                                        <ChevronDown size={16} className="text-gray-600" strokeWidth={2} />
                                    </div>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-semibold text-gray-900">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="w-full pl-4 pr-12 py-3.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-base font-normal focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={handleLogin}
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#8b3dff] hover:bg-[#7a2df0] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-lg font-semibold text-base transition-all active:scale-[0.98] mt-6"
                            >
                                {isLoading ? 'Logging in...' : 'Continue'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Back to Home - Positioned outside card */}
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 flex items-center gap-2 text-white/90 font-semibold text-base hover:text-white transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-base font-semibold">Back to home</span>
                </button>
            </main>

            {/* Footer - Professional Minimalist */}
            <footer className="relative z-20 w-full px-10 py-6 flex flex-col md:flex-row items-center justify-end gap-10 text-xs font-normal text-white/80">
                <div className="flex items-center gap-8">
                    <button className="text-xs font-normal hover:text-white transition-colors">Privacy policy</button>
                    <button className="text-xs font-normal hover:text-white transition-colors">Terms</button>
                </div>
                <button className="flex items-center gap-2 text-xs font-normal hover:text-white transition-colors">
                    <Globe size={16} />
                    <span className="text-xs font-normal">English (India)</span>
                </button>
            </footer>

            {/* Snackbar Notification */}
            {showSnackbar && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 animate-slide-up font-sans ${
                    snackbarType === 'success' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                }`}>
                    <div className="flex items-center gap-3">
                        {snackbarType === 'success' ? (
                            <CheckCircle size={20} className="text-white" />
                        ) : (
                            <AlertCircle size={20} className="text-white" />
                        )}
                        <span className="text-base font-normal">{snackbarMessage}</span>
                    </div>
                    <button
                        onClick={() => setShowSnackbar(false)}
                        className="text-white/70 hover:text-white transition-colors ml-2"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            <style>{`
                @keyframes slide-up {
                    from {
                        transform: translate(-50%, 100%);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Login;