import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    BookOpen,
    Users,
    CheckCircle2,
    Clock,
    TrendingUp,
    Plus,
    Eye,
    Calendar,
    BarChart3,
    Award,
    AlertCircle,
    ArrowRight,
    Loader2,
    Sparkles
} from 'lucide-react';
import { getAssignmentsByTeacher, getAllQuizzes } from '../../../services/api';

const TeacherDashbord = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.userData);
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAssignments: 0,
        totalQuizzes: 0,
        totalSubmissions: 0,
        pendingReviews: 0,
        activeAssignments: 0,
        completedAssignments: 0
    });

    // Fetch data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser?.userCode) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                // Fetch assignments
                const assignmentsResult = await getAssignmentsByTeacher(currentUser.userCode);
                if (assignmentsResult.success && assignmentsResult.data.success) {
                    const mappedAssignments = assignmentsResult.data.data.map((assignment) => {
                        const questionsArray = assignment.questions
                            ? Object.values(assignment.questions).map((q) => ({
                                id: q.questionNo,
                                question: q.question,
                                difficulty: q.difficulties?.toLowerCase() || 'medium'
                            }))
                            : [];

                        return {
                            _id: assignment._id,
                            assignmentName: assignment.assignmentName,
                            subject: assignment.subject,
                            dueDate: assignment.dueDate,
                            status: assignment.status || 'pending',
                            assignedTo: assignment.assignedTo,
                            assignmentCode: assignment.assignmentCode,
                            questionsCount: questionsArray.length,
                            submissions: assignment.submissions || {}
                        };
                    });
                    setAssignments(mappedAssignments);
                }

                // Fetch quizzes
                const quizzesResult = await getAllQuizzes();
                if (quizzesResult.success && quizzesResult.data.success) {
                    const teacherQuizzes = quizzesResult.data.data.filter(
                        quiz => quiz.teacherCode === currentUser.userCode
                    );
                    setQuizzes(teacherQuizzes);
                }

                // Calculate statistics
                const assignmentsData = assignmentsResult.success && assignmentsResult.data.success
                    ? assignmentsResult.data.data
                    : [];
                
                const totalSubmissions = assignmentsData.reduce((total, assignment) => {
                    const submissions = assignment.submissions || {};
                    return total + Object.keys(submissions).length;
                }, 0);

                const activeAssignments = assignmentsData.filter(
                    a => a.status === 'active' || a.status === 'pending'
                ).length;

                const completedAssignments = assignmentsData.filter(
                    a => a.status === 'completed'
                ).length;

                setStats({
                    totalAssignments: assignmentsData.length,
                    totalQuizzes: teacherQuizzes.length,
                    totalSubmissions: totalSubmissions,
                    pendingReviews: totalSubmissions, // Assuming all submissions need review
                    activeAssignments: activeAssignments,
                    completedAssignments: completedAssignments
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser?.userCode]);

    // Get recent assignments (last 5)
    const recentAssignments = assignments
        .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
        .slice(0, 5);

    // Get recent quizzes (last 5)
    const recentQuizzes = quizzes
        .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
        .slice(0, 5);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (isLoading) {
  return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Sparkles className="text-purple-600" size={36} />
                        Teacher Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Welcome back, {currentUser?.fullName || 'Teacher'}! Here's an overview of your teaching activities.
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Assignments */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                <FileText className="text-white" size={28} />
                            </div>
                            <TrendingUp className="text-green-500" size={20} />
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Total Assignments</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalAssignments}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {stats.activeAssignments} active, {stats.completedAssignments} completed
                        </p>
                    </div>

                    {/* Total Quizzes */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <BookOpen className="text-white" size={28} />
                            </div>
                            <TrendingUp className="text-green-500" size={20} />
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Total Quizzes</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                        <p className="text-xs text-gray-500 mt-2">Created quizzes</p>
                    </div>

                    {/* Total Submissions */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                <CheckCircle2 className="text-white" size={28} />
                            </div>
                            <TrendingUp className="text-green-500" size={20} />
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Total Submissions</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                        <p className="text-xs text-gray-500 mt-2">Student submissions received</p>
                    </div>

                    {/* Pending Reviews */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                <Clock className="text-white" size={28} />
                            </div>
                            {stats.pendingReviews > 0 && (
                                <AlertCircle className="text-orange-500" size={20} />
                            )}
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Reviews</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</p>
                        <p className="text-xs text-gray-500 mt-2">Awaiting your review</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="text-purple-600" size={24} />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/teacher/assignments/create')}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3">
                                <Plus size={24} />
                                <span className="font-semibold">Create Assignment</span>
                            </div>
                            <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/teacher/quizzes/create')}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3">
                                <Plus size={24} />
                                <span className="font-semibold">Create Quiz</span>
                            </div>
                            <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/teacher/assignments')}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3">
                                <Eye size={24} />
                                <span className="font-semibold">View All Assignments</span>
                            </div>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Assignments */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="text-purple-600" size={24} />
                                Recent Assignments
                            </h2>
                            <button
                                onClick={() => navigate('/teacher/assignments')}
                                className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1"
                            >
                                View All <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentAssignments.length > 0 ? (
                                recentAssignments.map((assignment) => (
                                    <div
                                        key={assignment._id}
                                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/teacher/assignments`)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {assignment.assignmentName}
                                            </h3>
                                            {getStatusBadge(assignment.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                            <span className="flex items-center gap-1">
                                                <BookOpen size={16} />
                                                {assignment.subject}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={16} />
                                                {formatDate(assignment.dueDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={16} />
                                                {assignment.assignedTo}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{assignment.questionsCount} questions</span>
                                            <span className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                                                View Details <ArrowRight size={12} />
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="mx-auto mb-2 text-gray-400" size={48} />
                                    <p>No assignments yet</p>
                                    <button
                                        onClick={() => navigate('/teacher/assignments/create')}
                                        className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
                                    >
                                        Create your first assignment
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Quizzes */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="text-blue-600" size={24} />
                                Recent Quizzes
                            </h2>
                            <button
                                onClick={() => navigate('/teacher/quizzes')}
                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
                            >
                                View All <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentQuizzes.length > 0 ? (
                                recentQuizzes.map((quiz) => (
                                    <div
                                        key={quiz._id || quiz.id}
                                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/teacher/quizzes`)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {quiz.quizeName}
                                            </h3>
                                            {getStatusBadge(quiz.status || 'pending')}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                            <span className="flex items-center gap-1">
                                                <BookOpen size={16} />
                                                {quiz.subject}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={16} />
                                                {formatDate(quiz.dueDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={16} />
                                                {quiz.assignedTo}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                                {quiz.questions ? Object.keys(quiz.questions).length : 0} questions
                                            </span>
                                            <span className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                                View Details <ArrowRight size={12} />
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <BookOpen className="mx-auto mb-2 text-gray-400" size={48} />
                                    <p>No quizzes yet</p>
                                    <button
                                        onClick={() => navigate('/teacher/quizzes/create')}
                                        className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        Create your first quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Overview */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="text-green-600" size={24} />
                        Student Module Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-purple-900">Assignment Engagement</h3>
                                <FileText className="text-purple-600" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-purple-900">
                                {stats.totalSubmissions > 0 
                                    ? Math.round((stats.totalSubmissions / (stats.totalAssignments * 10)) * 100)
                                    : 0}%
                            </p>
                            <p className="text-sm text-purple-700 mt-1">
                                {stats.totalSubmissions} submissions across {stats.totalAssignments} assignments
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-blue-900">Active Content</h3>
                                <BookOpen className="text-blue-600" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-blue-900">
                                {stats.activeAssignments + stats.totalQuizzes}
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                {stats.activeAssignments} active assignments, {stats.totalQuizzes} quizzes
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-green-900">Completion Rate</h3>
                                <CheckCircle2 className="text-green-600" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-green-900">
                                {stats.totalAssignments > 0
                                    ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100)
                                    : 0}%
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                                {stats.completedAssignments} of {stats.totalAssignments} assignments completed
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashbord;
