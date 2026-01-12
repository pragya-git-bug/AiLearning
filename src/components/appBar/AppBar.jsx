import React, { useState } from 'react';
import { Menu, Search, HelpCircle, Settings, Grid3x3, SlidersHorizontal, LogOut, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/credencials/Credential';

const AppBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.userData);

    const handleLogout = () => {
        // Dispatch logout action (which clears localStorage)
        dispatch(logout());
        // Navigate to login page
        navigate('/login');
        setShowUserMenu(false);
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (currentUser?.fullName) {
            return currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        if (currentUser?.name) {
            return currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return 'U';
    };

    return (
        <header className="w-full bg-[#f5f5f5] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            {/* Left Section - Menu & Logo */}
            <div className="flex items-center gap-4 min-w-[240px]">
                {/* Hamburger Menu */}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                    <Menu size={24} className="text-[#5f6368]" strokeWidth={2} />
                </button>

                {/* Gmail Logo & Text */}
                <div className="flex items-center gap-2">
                    {/* Gmail Logo SVG */}
                    {/* <svg viewBox="0 0 40 32" className="w-10 h-8">
                        <path fill="#4285f4" d="M0,28 L0,8 L20,20 L40,8 L40,28 L0,28 Z" />
                        <path fill="#34a853" d="M0,28 L0,8 L0,4 L20,16 L20,20 L0,28 Z" />
                        <path fill="#fbbc04" d="M40,28 L40,8 L40,4 L20,16 L20,20 L40,28 Z" />
                        <path fill="#ea4335" d="M40,4 L20,16 L0,4 L0,0 L20,12 L40,0 L40,4 Z" />
                    </svg> */}

                    {/* Gmail Text */}
                    {/* <span className="text-[22px] text-[#5f6368] font-normal">Gmail</span> */}
                     <span 
                        className="text-[22px] font-normal leading-none"
                        style={{ fontFamily: "'Pacifico', cursive" }}
                    >
                         EduCollaborate
                    </span>
                </div>
            </div>

            {/* Center Section - Search Bar */}
            <div className="flex-1 max-w-[720px] mx-8">
                <div className="relative flex items-center bg-[#eaf1fb] hover:bg-[#e3edfa] rounded-lg transition-colors duration-200">
                    {/* Search Icon */}
                    <button className="absolute left-4 p-1 hover:bg-transparent">
                        <Search size={20} className="text-[#5f6368]" strokeWidth={2} />
                    </button>

                    {/* Search Input */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search mail"
                        className="w-full pl-14 pr-14 py-3 bg-transparent text-[15px] text-[#202124] placeholder:text-[#5f6368] focus:outline-none"
                    />

                    {/* Filter Icon */}
                    <button className="absolute right-4 p-1 hover:bg-white/50 rounded-full transition-colors duration-200">
                        <SlidersHorizontal size={20} className="text-[#5f6368]" strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Right Section - Action Icons */}
            <div className="flex items-center gap-2">
                {/* Help Icon */}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200" title="Help">
                    <HelpCircle size={20} className="text-[#5f6368]" strokeWidth={2} />
                </button>

                {/* Settings Icon */}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200" title="Settings">
                    <Settings size={20} className="text-[#5f6368]" strokeWidth={2} />
                </button>

                {/* Google Apps Icon */}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200" title="Google apps">
                    <Grid3x3 size={20} className="text-[#5f6368]" strokeWidth={2} />
                </button>

                {/* Profile Picture with Dropdown */}
                <div className="relative ml-2">
                    <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                            {getUserInitials()}
                        </div>
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                        <>
                            {/* Backdrop */}
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowUserMenu(false)}
                            />
                            
                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
                                {/* User Info */}
                                {currentUser && (
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                                {getUserInitials()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {currentUser.fullName || currentUser.name || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {currentUser.email || ''}
                                                </p>
                                                {currentUser.role && (
                                                    <p className="text-xs text-gray-500 capitalize mt-1">
                                                        {currentUser.role}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Menu Items */}
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            // Navigate to profile if needed
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                    >
                                        <User size={16} className="text-gray-500" />
                                        <span>My Account</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                    >
                                        <LogOut size={16} className="text-red-600" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AppBar;