import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingAppBar = () => {
    const navigate = useNavigate();

    const navItems = ['Teachers', 'Students', 'Parents', 'Schools', 'About'];

    return (
        <header className="w-full bg-white border-b-1 border-[#7d2ae8] sticky top-0 z-50">
            <nav className="max-w-[1920px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">
                {/* Logo */}
                <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <span 
                        className="text-[#454545] text-[32px] font-normal leading-none"
                        style={{ fontFamily: "'Pacifico', cursive" }}
                    >
                         EduCollaborate
                    </span>
                </div>

                {/* Navigation Items - Center */}
                <div className="hidden lg:flex items-center gap-8">
                    {navItems.map((item) => (
                        <button
                            key={item}
                            onClick={() => navigate(`/${item.toLowerCase()}`)}
                            className="text-[#2d2d2d] text-[16px] font-medium hover:text-[#7d2ae8] transition-colors duration-200 whitespace-nowrap"
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Auth Buttons - Right */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-6 py-2.5 text-[#2d2d2d] text-[16px] font-medium hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                        Sign up
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2.5 bg-[#7d2ae8] hover:bg-[#6c24d1] text-white text-[16px] font-medium rounded-lg transition-all duration-200 shadow-sm"
                    >
                        Log in
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-700">
                    <svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 6h16M4 12h16M4 18h16" 
                        />
                    </svg>
                </button>
            </nav>
        </header>
    );
};

export default LandingAppBar;