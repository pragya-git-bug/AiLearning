import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Users, 
    Mail, 
    Phone, 
    ArrowLeft,
    Loader2,
    XCircle,
    CheckCircle2,
    Search,
    Eye,
    BookOpen,
    GraduationCap
} from 'lucide-react';
import { getSubmittedStudentsForQuiz } from '../../../../services/api';

const QuizResults = () => {
    const { quizeCode: quizCodeParam, quizName: quizNameParam } = useParams();
    const navigate = useNavigate();
    const [submittedStudents, setSubmittedStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const quizeCode = quizCodeParam ? decodeURIComponent(quizCodeParam) : '';
    const quizName = quizNameParam ? decodeURIComponent(quizNameParam) : '';

    // Filter students based on search term
    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) {
            return submittedStudents;
        }

        const term = searchTerm.toLowerCase();
        return submittedStudents.filter(student => 
            student.fullName?.toLowerCase().includes(term) ||
            student.userCode?.toLowerCase().includes(term) ||
            student.email?.toLowerCase().includes(term) ||
            student.mobileNumber?.includes(term) ||
            student.className?.toLowerCase().includes(term)
        );
    }, [submittedStudents, searchTerm]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!quizeCode) {
                setError('Quiz code not found');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const result = await getSubmittedStudentsForQuiz(quizeCode);

                if (result.success && result.data.success) {
                    setSubmittedStudents(result.data.data || []);
                } else {
                    setError(result.error || 'Failed to load submissions');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while loading submissions');
                console.error('Error fetching submissions:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissions();
    }, [quizeCode]);

    const getInitials = (name) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/teacher/quizzes')}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} strokeWidth={2} />
                        <span className="font-medium">Back to Quizzes</span>
                    </button>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                                    <Users className="text-purple-600" size={32} />
                                    Quiz Results
                                    {quizName && (
                                        <span className="text-2xl text-gray-600 font-normal">- {quizName}</span>
                                    )}
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Quiz Code: <span className="font-mono font-semibold text-purple-600">{quizeCode}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search students by name, code, email, phone, or class..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all text-gray-900"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Students Table */}
                {isLoading ? (
                    <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm">
                        <div className="flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
                            <p className="text-gray-600 text-lg">Loading quiz results...</p>
                        </div>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <Users size={64} className="mb-4 opacity-50" />
                            <p className="text-xl font-medium text-gray-600">
                                {searchTerm ? 'No students found matching your search' : 'No students have submitted this quiz yet'}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Class</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.map((student) => (
                                        <tr key={student._id || student.userCode} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                        <span className="text-purple-600 font-semibold text-sm">
                                                            {getInitials(student.fullName)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student.fullName || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-mono">
                                                    {student.userCode || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail size={16} className="text-purple-600" />
                                                    {student.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone size={16} className="text-purple-600" />
                                                    {student.mobileNumber || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <GraduationCap size={16} className="text-purple-600" />
                                                    {student.className || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                                    <CheckCircle2 size={14} />
                                                    Submitted
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => navigate(`/teacher/quizzes/review/${quizeCode}/${student.userCode}`)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="View Submission"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Summary Card */}
                {!isLoading && filteredStudents.length > 0 && (
                    <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Submissions</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
                                </p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                                <Users className="text-purple-600" size={32} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizResults;
