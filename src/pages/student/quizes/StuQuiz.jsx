import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    BookOpen, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Eye,
    Search,
    Filter,
    PlayCircle,
    Loader2
} from 'lucide-react';
import { getQuizzesByClass } from '../../../services/api';

const StuQuiz = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.userData);
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [dueDateFilter, setDueDateFilter] = useState('all');

    // Fetch quizzes from API based on student's class
    useEffect(() => {
        const fetchQuizzes = async () => {
            const studentClassName = currentUser?.className || currentUser?.assignedTo;
            
            if (!studentClassName) {
                setError('Class information not found. Please contact your teacher.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const result = await getQuizzesByClass(studentClassName);

                if (result.success && result.data.success) {
                    // Map API response to component format
                    const mappedQuizzes = result.data.data.map((quiz) => {
                        // Convert questions object to array format
                        const questionsArray = quiz.questions 
                            ? Object.values(quiz.questions).map((q, index) => ({
                                id: index + 1,
                                question: q.question,
                                questionNo: q.questionNo,
                                options: q.options,
                                correctOption: q.correctOption,
                                difficulties: q.difficulties
                            }))
                            : [];

                        // Check if student has submitted
                        const submissions = quiz.submissions || {};
                        const studentCode = currentUser?.userCode;
                        const isSubmitted = studentCode && submissions[studentCode];

                        // Determine status
                        let status = 'pending';
                        const dueDate = new Date(quiz.dueDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        if (isSubmitted) {
                            status = 'completed';
                        } else if (dueDate < today) {
                            status = 'overdue';
                        } else {
                            status = 'pending';
                        }

                        return {
                            _id: quiz._id || quiz.id,
                            quizName: quiz.quizeName,
                            subject: quiz.subject,
                            dueDate: quiz.dueDate,
                            status: status,
                            assignedTo: quiz.assignedTo,
                            teacherCode: quiz.teacherCode,
                            quizeCode: quiz.quizeCode,
                            questions: questionsArray,
                            questionsCount: questionsArray.length,
                            submissions: quiz.submissions || {},
                            isSubmitted: isSubmitted,
                            createdAt: quiz.createdAt,
                            updatedAt: quiz.updatedAt
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
    }, [currentUser?.className, currentUser?.assignedTo, currentUser?.userCode]);

    // Get unique subjects from quizzes
    const uniqueSubjects = useMemo(() => {
        const subjects = quizzes.map(q => q.subject).filter(Boolean);
        return [...new Set(subjects)].sort();
    }, [quizzes]);

    // Filter quizzes
    const filteredQuizzes = useMemo(() => {
        return quizzes.filter(quiz => {
            // Search filter
            const matchesSearch = quiz.quizName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                quiz.subject.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Status filter
            const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
            
            // Subject filter
            const matchesSubject = subjectFilter === 'all' || quiz.subject === subjectFilter;
            
            // Due date filter
            let matchesDueDate = true;
            if (dueDateFilter !== 'all' && quiz.dueDate) {
                const dueDate = new Date(quiz.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0, 0, 0, 0);
                
                if (dueDateFilter === 'upcoming') {
                    matchesDueDate = dueDate >= today;
                } else if (dueDateFilter === 'overdue') {
                    matchesDueDate = dueDate < today && quiz.status !== 'completed';
                } else if (dueDateFilter === 'past') {
                    matchesDueDate = dueDate < today;
                }
            }
            
            return matchesSearch && matchesStatus && matchesSubject && matchesDueDate;
        });
    }, [quizzes, searchTerm, statusFilter, subjectFilter, dueDateFilter]);

    const getStatusBadge = (status, dueDate) => {
        const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'completed';
        
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Completed' },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Overdue' }
        };
        
        const config = isOverdue ? statusConfig.overdue : (statusConfig[status] || statusConfig.pending);
        const Icon = config.icon;
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} flex items-center gap-1`}>
                <Icon size={14} />
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleAttemptQuiz = (quiz) => {
        navigate(`/student/quizzes/attempt/${quiz.quizeCode}/${encodeURIComponent(quiz.quizName)}`);
    };

    const handleViewQuiz = (quiz) => {
        navigate(`/student/quizzes/view/${quiz.quizeCode}/${encodeURIComponent(quiz.quizName)}`);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 text-lg">Loading quizzes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Quizzes</h1>
                    <p className="text-gray-600">View and attempt all your quizzes</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search quizzes by name or subject..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Subject Filter */}
                        <div className="relative">
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                            >
                                <option value="all">All Subjects</option>
                                {uniqueSubjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="overdue">Overdue</option>
                            </select>
                            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* Due Date Filter */}
                        <div className="relative">
                            <select
                                value={dueDateFilter}
                                onChange={(e) => setDueDateFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                            >
                                <option value="all">All Dates</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="overdue">Overdue</option>
                                <option value="past">Past</option>
                            </select>
                            <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Quizzes Table */}
                {filteredQuizzes.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quiz Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Questions</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredQuizzes.map((quiz) => (
                                    <tr key={quiz._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <span className="text-purple-600 font-semibold text-sm">
                                                        {getInitials(quiz.quizName)}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{quiz.quizName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <BookOpen size={16} className="text-purple-600" />
                                                {quiz.subject}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={16} className="text-purple-600" />
                                                {formatDate(quiz.dueDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                {quiz.questionsCount} Questions
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(quiz.status, quiz.dueDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {quiz.status === 'completed' ? (
                                                <button
                                                    onClick={() => handleViewQuiz(quiz)}
                                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors flex items-center gap-2"
                                                >
                                                    <Eye size={14} />
                                                    View
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAttemptQuiz(quiz)}
                                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors flex items-center gap-2"
                                                >
                                                    <PlayCircle size={14} />
                                                    Attempt
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                        <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes found</h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter !== 'all' || subjectFilter !== 'all' || dueDateFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No quizzes have been assigned to your class yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StuQuiz;
