import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Edit, 
    Inbox, 
    Star, 
    Clock, 
    Send, 
    File, 
    ShoppingBag, 
    ChevronDown,
    ChevronRight,
    Plus,
    User,
    BarChart3,
    BookOpen
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get current user from Redux store
    const { currentUser } = useSelector((state) => state.userData);
    
    // Initialize active item based on current route
    const pathToIdMap = {
        '/student/dashboard': 'dashbord',
        '/student/assignments': 'assignments',
        '/student/subjects': 'mysubjects',
        '/student/books': 'onlinebooks',
        '/student/ai-teachers': 'aiteacters',
        '/student/quizzes': 'quizes',
        '/student/reports': 'reports',
        '/teacher/dashboard': 'dashbord',
        '/teacher/assignments': 'assignments',
        '/teacher/classes': 'myclasses',
        '/teacher/create-content': 'createcontent',
        '/teacher/ai-assistant': 'aiassistant',
        '/teacher/quizzes': 'quizes',
        '/teacher/quizzes/create': 'quizes'
    };
    
    const [activeItem, setActiveItem] = useState(() => {
        return pathToIdMap[location.pathname] || 'dashbord';
    });
    const [expandedMenus, setExpandedMenus] = useState({
        assessments: true // Default to expanded
    });
    
    // Use currentUser or fallback to default
    const user = currentUser || {
        name: 'Guest User',
        className: 'No class',
        avatar: null,
        role: 'student'
    };
    
    // Get initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Toggle submenu expansion
    const toggleMenu = (menuId) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    // Navigation handler
    const handleNavigation = (itemId, isSubmenu = false) => {
        setActiveItem(itemId);
        
        // If clicking a submenu item, keep only the 'assessments' menu open (since it's the only one with submenu currently)
        if (isSubmenu && (itemId === 'assignments' || itemId === 'quizes')) {
            setExpandedMenus({
                assessments: true
            });
        } else if (!isSubmenu) {
            // If clicking a main menu item (not a submenu), close all submenus
            setExpandedMenus({});
        }
        
        // Map menu item IDs to routes based on user role
        const studentRouteMap = {
            'dashbord': '/student/dashboard',
            'assignments': '/student/assignments',
            'mysubjects': '/student/subjects',
            'onlinebooks': '/student/books',
            'aiteacters': '/student/ai-teachers',
            'quizes': '/student/quizzes',
            'reports': '/student/reports'
        };
        
        const teacherRouteMap = {
            'dashbord': '/teacher/dashboard',
            'assignments': '/teacher/assignments',
            'myclasses': '/teacher/classes',
            'createcontent': '/teacher/create-content',
            'aiassistant': '/teacher/ai-assistant',
            'quizes': '/teacher/quizzes'
        };
        
        // Use appropriate route map based on user role
        const routeMap = user.role === 'teacher' ? teacherRouteMap : studentRouteMap;
        const route = routeMap[itemId];
        
        if (route) {
            navigate(route);
        }
    };

    // Update active item based on current location
    React.useEffect(() => {
        let currentId = pathToIdMap[location.pathname];
        
        // Handle dynamic routes
        if (!currentId) {
            if (location.pathname.startsWith('/student/quizzes')) {
                currentId = 'quizes';
            } else if (location.pathname.startsWith('/student/assignments')) {
                currentId = 'assignments';
            } else if (location.pathname.startsWith('/teacher/quizzes')) {
                currentId = 'quizes';
            } else if (location.pathname.startsWith('/teacher/assignments')) {
                currentId = 'assignments';
            }
        }
        
        // If we're on assignments or quizzes, expand the assessments menu
        if (currentId === 'assignments' || currentId === 'quizes') {
            setExpandedMenus(prev => ({
                ...prev,
                assessments: true
            }));
        }
        
        if (currentId) {
            setActiveItem(currentId);
        }
    }, [location.pathname]);

    const menuItemsStudent = [
        { id: 'dashbord', icon: Inbox, label: 'Dashboard', count: '14,565', bgColor: 'bg-[#d3e3fd]', path: '/student/dashboard' },
        { id: 'mysubjects', icon: Star, label: 'My Subjects', count: null, bgColor: 'bg-transparent' },
        { id: 'onlinebooks', icon: Clock, label: 'Online Books', count: null, bgColor: 'bg-transparent' },
        { id: 'aiteacters', icon: Send, label: 'AI Teacters', count: null, bgColor: 'bg-gray-100' },
        { 
            id: 'assessments', 
            icon: BookOpen, 
            label: 'Assessments', 
            count: null, 
            bgColor: 'bg-transparent', 
            bold: true,
            hasSubmenu: true,
            submenuItems: [
                { id: 'assignments', icon: File, label: 'Assignments', count: '31', path: '/student/assignments' },
                { id: 'quizes', icon: ShoppingBag, label: 'Quizes', count: '65', path: '/student/quizzes' }
            ]
        },
        { id: 'reports', icon: BarChart3, label: 'Reports', count: null, bgColor: 'bg-transparent', bold: true, path: '/student/reports' },
    ];

     const menuItemsTeacher = [
        { id: 'dashbord', icon: Inbox, label: 'Dashboard', count: '14,565', bgColor: 'bg-[#d3e3fd]', path: '/teacher/dashboard' },
        { id: 'myclasses', icon: Star, label: 'My Classes', count: null, bgColor: 'bg-transparent' },
        { id: 'createcontent', icon: Clock, label: 'Create Content', count: null, bgColor: 'bg-transparent' },
        { id: 'aiassistant', icon: Send, label: 'AI Assistant', count: null, bgColor: 'bg-gray-100' },
        { 
            id: 'assessments', 
            icon: BookOpen, 
            label: 'Assessments', 
            count: null, 
            bgColor: 'bg-transparent', 
            bold: true,
            hasSubmenu: true,
            submenuItems: [
                { id: 'assignments', icon: File, label: 'Assignments', count: '31', path: '/teacher/assignments' },
                { id: 'quizes', icon: ShoppingBag, label: 'Quizes', count: '65', path: '/teacher/quizzes' }
            ]
        },
    ];

    return (
        <aside className="w-64 h-screen bg-[#f5f5f5] p-3 flex flex-col gap-1">
            {/* User Profile Section */}
            <div className="px-4 py-3 mb-2 hover:bg-gray-200 rounded-lg transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                        {user.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066ff] to-[#8b5cf6] flex items-center justify-center text-white font-semibold text-sm shadow-sm border-2 border-white">
                                {getInitials(user.name)}
                            </div>
                        )}
                        {/* Online Status Indicator */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <div className="text-[18px] font-medium text-[#001d35] truncate">
                            {user.name}
                        </div>
                        <div className="text-[14px] text-[#5f6368] truncate">
                            {user.className} {user.role === 'student' ? 'Student' : 'Teacher'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Compose Button */}
            <button 
                className="flex items-center gap-4 bg-[#c2e7ff] hover:bg-[#b0deff] text-[#001d35] px-6 py-4 rounded-full mb-4 transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <Edit size={20} strokeWidth={2} />
                <span className="text-[15px] font-medium">Keep Notes</span>
            </button>

            {/* Menu Items - Show based on user role */}
            <nav className="flex flex-col gap-0.5">
                {(user.role === 'student' ? menuItemsStudent : menuItemsTeacher).map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;
                    const hasSubmenu = item.hasSubmenu || false;
                    const isExpanded = expandedMenus[item.id] || false;
                    
                    return (
                        <div key={item.id}>
                            <button
                                onClick={() => {
                                    if (hasSubmenu) {
                                        toggleMenu(item.id);
                                    } else {
                                        // Close all submenus when clicking a non-submenu item
                                        setExpandedMenus({});
                                        handleNavigation(item.id);
                                    }
                                }}
                                className={`
                                    w-full flex items-center justify-between px-6 py-3 rounded-r-full transition-all duration-200
                                    ${isActive && !hasSubmenu ? 'bg-[#d3e3fd]' : 'bg-transparent'}
                                    ${isActive && !hasSubmenu ? '' : 'hover:bg-gray-200'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    {hasSubmenu && (
                                        <div className="flex items-center">
                                            {isExpanded ? (
                                                <ChevronDown size={16} strokeWidth={2} className="text-[#3c4043]" />
                                            ) : (
                                                <ChevronRight size={16} strokeWidth={2} className="text-[#3c4043]" />
                                            )}
                                        </div>
                                    )}
                                    <Icon 
                                        size={20} 
                                        strokeWidth={2} 
                                        className="text-[#3c4043]"
                                    />
                                    <span 
                                        className={`text-[14px] text-[#3c4043] ${isActive && !hasSubmenu || item.bold ? 'font-bold' : 'font-normal'}`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                                
                                {item.count && !hasSubmenu && (
                                    <span className="text-[13px] text-[#5f6368] font-normal">
                                        {item.count}
                                    </span>
                                )}
                            </button>
                            
                            {/* Render submenu items if menu has submenu and is expanded */}
                            {hasSubmenu && isExpanded && item.submenuItems && (
                                <div className="ml-4 flex flex-col gap-0.5">
                                    {item.submenuItems.map((subItem) => {
                                        const SubIcon = subItem.icon;
                                        const isSubActive = activeItem === subItem.id;
                                        
                                        return (
                                            <button
                                                key={subItem.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNavigation(subItem.id, true);
                                                }}
                                                className={`
                                                    w-full flex items-center justify-between px-6 py-2.5 rounded-r-full transition-all duration-200
                                                    ${isSubActive ? 'bg-[#d3e3fd]' : 'bg-transparent'}
                                                    ${isSubActive ? '' : 'hover:bg-gray-200'}
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <SubIcon 
                                                        size={18} 
                                                        strokeWidth={2} 
                                                        className="text-[#3c4043]"
                                                    />
                                                    <span 
                                                        className={`text-[13px] text-[#3c4043] ${isSubActive ? 'font-bold' : 'font-normal'}`}
                                                    >
                                                        {subItem.label}
                                                    </span>
                                                </div>
                                                
                                                {subItem.count && (
                                                    <span className="text-[12px] text-[#5f6368] font-normal">
                                                        {subItem.count}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* More Button */}
                <button 
                    className="flex items-center gap-4 px-6 py-3 rounded-r-full hover:bg-gray-200 transition-all duration-200"
                >
                    <ChevronDown size={20} strokeWidth={2} className="text-[#3c4043]" />
                    <span className="text-[14px] text-[#3c4043] font-normal">More</span>
                </button>
            </nav>

            {/* Labels Section */}
            <div className="flex items-center justify-between px-6 py-3 mt-4">
                <span className="text-[14px] text-[#3c4043] font-medium">Labels</span>
                <button className="text-[#3c4043] hover:bg-gray-200 rounded-full p-1 transition-all duration-200">
                    <Plus size={18} strokeWidth={2} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;