import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    FileText, 
    Calendar, 
    BookOpen, 
    Users, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Eye,
    Search,
    Filter,
    Lightbulb,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Home
} from 'lucide-react';
import { getAllQuizzes } from '../../../services/api';

const TeachQuiz = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.userData);
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typingText, setTypingText] = useState('');
    const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    const subjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'];
    const baseText = 'Create the quiz of ';

    // Fetch quizzes from API
    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!currentUser?.userCode) {
                setError('Teacher code not found. Please login again.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const result = await getAllQuizzes();

                if (result.success && result.data.success) {
                    // Filter quizzes by teacherCode to show only current teacher's quizzes
                    const teacherQuizzes = result.data.data.filter(
                        quiz => quiz.teacherCode === currentUser.userCode
                    );

                    // Map API response to component format
                    const mappedQuizzes = teacherQuizzes.map((quiz) => {
                        // Convert questions object to array format
                        const questionsArray = quiz.questions 
                            ? Object.values(quiz.questions).map((q, index) => ({
                                id: index + 1,
                                question: q.question,
                                questionNo: q.questionNo,
                                options: q.options,
                                correctOption: q.correctOption,
                                difficulty: q.difficulties?.toLowerCase() || 'medium',
                                difficulties: q.difficulties
                            }))
                            : [];

                        return {
                            _id: quiz._id || quiz.id,
                            quizName: quiz.quizeName, // Note: API uses "quizeName"
                            subject: quiz.subject,
                            dueDate: quiz.dueDate,
                            status: quiz.status || 'pending',
                            assignedTo: quiz.assignedTo,
                            teacherCode: quiz.teacherCode,
                            quizeCode: quiz.quizeCode,
                            questions: questionsArray,
                            questionsCount: questionsArray.length
                        };
                    });

                    setQuizzes(mappedQuizzes);
                } else {
                    setError(result.error || 'Failed to load quizzes');
                    setQuizzes([]);
                }
            } catch (err) {
                setError(err.message || 'An error occurred while loading quizzes');
                setQuizzes([]);
                console.error('Error fetching quizzes:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuizzes();
    }, [currentUser?.userCode]);
    
    useEffect(() => {
        let timeoutId;
        let currentCharIndex = 0;
        let isDeleting = false;
        let waitTime = 0;
        
        const currentSubject = subjects[currentSubjectIndex];
        const fullText = baseText + currentSubject;
        
        const animate = () => {
            if (!isDeleting && currentCharIndex <= fullText.length) {
                setTypingText(fullText.substring(0, currentCharIndex));
                currentCharIndex++;
                timeoutId = setTimeout(animate, 100);
            } else if (!isDeleting && currentCharIndex > fullText.length) {
                waitTime++;
                if (waitTime < 20) {
                    timeoutId = setTimeout(animate, 100);
                } else {
                    isDeleting = true;
                    waitTime = 0;
                    timeoutId = setTimeout(animate, 50);
                }
            } else if (isDeleting && currentCharIndex > baseText.length) {
                currentCharIndex--;
                setTypingText(fullText.substring(0, currentCharIndex));
                timeoutId = setTimeout(animate, 50);
            } else {
                isDeleting = false;
                currentCharIndex = 0;
                setCurrentSubjectIndex((prev) => (prev + 1) % subjects.length);
            }
        };
        
        animate();
        
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [currentSubjectIndex]);

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.quizName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            quiz.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            quiz.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentQuizzes = filteredQuizzes.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // Pagination handlers
    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Completed' },
            active: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle2, label: 'Active' },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Overdue' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                <Icon size={14} />
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && statusFilter !== 'completed';
    };

    const handleViewQuiz = (quiz) => {
        console.log('View quiz:', quiz);
    };

    const handleViewResults = (quiz) => {
        navigate(`/teacher/quizzes/results/${quiz.quizeCode}/${encodeURIComponent(quiz.quizName)}`);
        console.log('View quiz results:', quiz);
    };

    return (
        <div className="min-h-screen bg-white p-10 border-2 border-gray-200 rounded-lg">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="px-6 py-5 mb-6">
                    <div className="flex items-center justify-between">
                        {/* Title on Left */}
                        <div className="flex items-center gap-0">
                            <h1 className="text-3xl font-bold text-blue-900">
                                Quizzes
                            </h1>
                            {/* Vertical Separator */}
                            <div className="h-8 w-px bg-gray-300 ml-2 flex-shrink-0"></div>
                            {/* Breadcrumb Navigation */}
                            <nav className="flex items-center gap-2 text-sm text-gray-700 flex-shrink-0 ml-2">
                                <button
                                    onClick={() => navigate('/teacher/dashboard')}
                                    className="flex items-center gap-1 hover:text-blue-600 transition-colors p-1"
                                    title="Home"
                                >
                                    <Home size={16} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={() => navigate('/teacher/dashboard')}
                                    className="text-blue-600 hover:text-blue-700 transition-colors font-medium px-1"
                                >
                                    Dashboard
                                </button>
                                <ChevronRight size={14} className="text-gray-400" />
                                <span className="text-gray-500 font-normal px-1">
                                    Quizzes
                                </span>
                            </nav>
                        </div>
                        
                        {/* Create Quiz Button on Right */}
                        <button
                            onClick={() => navigate("/teacher/quizzes/create")}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                        >
                            <Plus size={20} />
                            Create Quiz
                        </button>
                    </div>
                </div>

                {/* What You'll Learn Section */}
                <div className=" rounded-xl p-6 mb-6 border-l-4 border-green-600">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb
                            className="text-green-600 animate-pulse"
                            size={24}
                            strokeWidth={2.5}
                            style={{
                                animation: "blink 1.5s ease-in-out infinite",
                            }}
                        />
                        <style>{`
                            @keyframes blink {
                                0%, 100% { opacity: 1; }
                                50% { opacity: 0.3; }
                            }
                        `}</style>
                        <h2 className="text-xl font-bold text-green-800">
                            WHAT YOU'LL LEARN
                        </h2>
                    </div>
                    <div className="ml-8">
                        <p className="text-green-800 text-lg">
                            <span className="font-semibold">•</span> {typingText}
                            <span className="animate-pulse">|</span>
                        </p>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search quizzes by name, subject, or class..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all text-gray-900"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="text-gray-400" size={20} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all text-gray-900 font-medium cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Quizzes Table */}
                <div className="bg-white border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="animate-spin mb-4" size={48} />
                            <p className="text-xl font-medium">Loading quizzes...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-400">
                            <XCircle size={64} className="mb-4 opacity-50" />
                            <p className="text-xl font-medium text-red-600">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredQuizzes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <FileText size={64} className="mb-4 opacity-50" />
                            <p className="text-xl font-medium">No quizzes found</p>
                            <p className="text-sm mt-2">Create your first quiz to get started</p>
                            <button
                                onClick={() => navigate('/teacher/quizzes/create')}
                                className="mt-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                            >
                                <Plus size={20} />
                                Create Quiz
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
                                            S.No
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            Quiz Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            Class
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            Questions
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentQuizzes.map((quiz, index) => (
                                        <tr 
                                            key={index} 
                                            className={`hover:bg-gray-50 transition-colors ${
                                                isOverdue(quiz.dueDate) ? 'bg-red-50/50' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {indexOfFirstItem + index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {quiz.quizName || 'Untitled Quiz'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={16} className="text-purple-600" />
                                                    <span className="text-sm font-medium text-gray-900">{quiz.subject || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-indigo-600" />
                                                    <span className="text-sm text-gray-700">{quiz.assignedTo || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-blue-600" />
                                                    <span className={`text-sm font-medium ${
                                                        isOverdue(quiz.dueDate) ? 'text-red-600' : 'text-gray-700'
                                                    }`}>
                                                        {formatDate(quiz.dueDate)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                    {quiz.questionsCount || quiz.questions?.length || 0} Questions
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(quiz.status || 'pending')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewQuiz(quiz)}
                                                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600"
                                                        title="View Quiz"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewResults(quiz)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                                                        title="View Results"
                                                    >
                                                        <Users size={16} />
                                                        <span>Results</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!isLoading && !error && filteredQuizzes.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span>
                                    Showing {indexOfFirstItem + 1} to{" "}
                                    {Math.min(indexOfLastItem, filteredQuizzes.length)} of{" "}
                                    {filteredQuizzes.length} quizzes
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-colors ${
                                        currentPage === 1
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                    }`}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                        (page) => {
                                            // Show first page, last page, current page, and pages around current
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageClick(page)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                            currentPage === page
                                                                ? "bg-purple-600 text-white"
                                                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                page === currentPage - 2 ||
                                                page === currentPage + 2
                                            ) {
                                                return (
                                                    <span
                                                        key={page}
                                                        className="px-2 text-gray-500"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        }
                                    )}
                                </div>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-colors ${
                                        currentPage === totalPages
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                    }`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

    
            </div>
        </div>
    );
};

export default TeachQuiz;
