import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    BookOpen,
    CheckCircle2,
    Clock,
    TrendingUp,
    Award,
    Calendar,
    BarChart3,
    Target,
    Sparkles,
    Loader2,
    AlertCircle,
    ArrowRight,
    PlayCircle,
    XCircle,
    GraduationCap
} from 'lucide-react';
import { getAssignmentsByClass } from '../../../services/api';

const StudentDashbord = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.userData);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        overdueAssignments: 0,
        upcomingAssignments: 0,
        averageScore: 0,
        totalScore: 0
    });

    // Fetch assignments on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            const studentClassName = currentUser?.className || currentUser?.assignedTo;
            
            if (!studentClassName) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                const result = await getAssignmentsByClass(studentClassName);

                if (result.success && result.data.success) {
                    const mappedAssignments = result.data.data.map((assignment) => {
                        const questionsArray = assignment.questions
                            ? Object.values(assignment.questions).map((q) => ({
                                id: q.questionNo,
                                question: q.question,
                                difficulty: q.difficulties?.toLowerCase() || 'medium'
                            }))
                            : [];

                        // Check if student has submitted
                        const submissions = assignment.submissions || {};
                        const studentCode = currentUser?.userCode;
                        const isSubmitted = studentCode && submissions[studentCode];

                        // Determine status
                        let status = 'pending';
                        const dueDate = new Date(assignment.dueDate);
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
                            _id: assignment._id,
                            assignmentName: assignment.assignmentName,
                            subject: assignment.subject,
                            dueDate: assignment.dueDate,
                            status: status,
                            assignedTo: assignment.assignedTo,
                            assignmentCode: assignment.assignmentCode,
                            questionsCount: questionsArray.length,
                            isSubmitted: isSubmitted,
                            submission: isSubmitted ? submissions[studentCode] : null
                        };
                    });

                    setAssignments(mappedAssignments);

                    // Calculate statistics
                    const total = mappedAssignments.length;
                    const completed = mappedAssignments.filter(a => a.status === 'completed').length;
                    const pending = mappedAssignments.filter(a => a.status === 'pending').length;
                    const overdue = mappedAssignments.filter(a => a.status === 'overdue').length;
                    
                    // Calculate upcoming (due in next 7 days)
                    const today = new Date();
                    const nextWeek = new Date(today);
                    nextWeek.setDate(today.getDate() + 7);
                    const upcoming = mappedAssignments.filter(a => {
                        const dueDate = new Date(a.dueDate);
                        return dueDate >= today && dueDate <= nextWeek && a.status !== 'completed';
                    }).length;

                    // Calculate average score (if submissions have scores)
                    let totalScore = 0;
                    let scoredCount = 0;
                    mappedAssignments.forEach(assignment => {
                        if (assignment.submission && assignment.submission.overallScore) {
                            totalScore += assignment.submission.overallScore;
                            scoredCount++;
                        }
                    });
                    const averageScore = scoredCount > 0 ? totalScore / scoredCount : 0;

                    setStats({
                        totalAssignments: total,
                        completedAssignments: completed,
                        pendingAssignments: pending,
                        overdueAssignments: overdue,
                        upcomingAssignments: upcoming,
                        averageScore: Math.round(averageScore),
                        totalScore: totalScore
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser?.className, currentUser?.assignedTo, currentUser?.userCode]);

    // Get subject-wise statistics
    const subjectStats = useMemo(() => {
        const subjectMap = {};
        assignments.forEach(assignment => {
            if (!subjectMap[assignment.subject]) {
                subjectMap[assignment.subject] = {
                    total: 0,
                    completed: 0,
                    pending: 0,
                    overdue: 0
                };
            }
            subjectMap[assignment.subject].total++;
            if (assignment.status === 'completed') {
                subjectMap[assignment.subject].completed++;
            } else if (assignment.status === 'pending') {
                subjectMap[assignment.subject].pending++;
            } else if (assignment.status === 'overdue') {
                subjectMap[assignment.subject].overdue++;
            }
        });
        return subjectMap;
    }, [assignments]);

    // Get recent assignments (last 5)
    const recentAssignments = useMemo(() => {
        return assignments
            .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
            .slice(0, 5);
    }, [assignments]);

    // Format date helper function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get upcoming assignments (next 7 days)
    const upcomingAssignments = useMemo(() => {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        return assignments
            .filter(a => {
                const dueDate = new Date(a.dueDate);
                return dueDate >= today && dueDate <= nextWeek && a.status !== 'completed';
            })
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);
    }, [assignments]);

    // Enhanced performance data for line chart with meaningful labels
    const performanceData = useMemo(() => {
        // Get completed assignments with scores, sorted by due date
        const completedWithScores = assignments
            .filter(a => a.isSubmitted && a.submission?.overallScore)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(-6); // Last 6 assignments

        if (completedWithScores.length === 0) {
            // If no scored assignments, show recent completed ones
            const recentCompleted = assignments
                .filter(a => a.status === 'completed')
                .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
                .slice(0, 6)
                .reverse();
            
            return recentCompleted.map((assignment, index) => {
                const shortName = assignment.assignmentName.length > 8 
                    ? assignment.assignmentName.substring(0, 8) + '...' 
                    : assignment.assignmentName;
                return {
                    label: `A${index + 1}`,
                    shortLabel: shortName,
                    fullLabel: assignment.assignmentName,
                    value: assignment.submission?.overallScore || 0,
                    subject: assignment.subject,
                    date: formatDate(assignment.dueDate)
                };
            });
        }

        return completedWithScores.map((assignment, index) => {
            const shortName = assignment.assignmentName.length > 8 
                ? assignment.assignmentName.substring(0, 8) + '...' 
                : assignment.assignmentName;
            return {
                label: `A${index + 1}`,
                shortLabel: shortName,
                fullLabel: `${assignment.assignmentName} (${assignment.subject})`,
                value: assignment.submission.overallScore,
                subject: assignment.subject,
                date: formatDate(assignment.dueDate)
            };
        });
    }, [assignments]);

    // Calculate completion rate
    const completionRate = stats.totalAssignments > 0
        ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100)
        : 0;


    // Get days until due
    const getDaysUntilDue = (dateString) => {
        if (!dateString) return null;
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Completed' },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Overdue' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} flex items-center gap-1`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    // Simple Bar Chart Component
    const BarChart = ({ data, title, colors }) => {
        const maxValue = Math.max(...Object.values(data).map(item => item.total || 0), 1);
        
        return (
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
                {Object.entries(data).map(([subject, stats], index) => {
                    const percentage = (stats.total / maxValue) * 100;
                    const color = colors[index % colors.length];
                    return (
                        <div key={subject} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-gray-700">{subject}</span>
                                <span className="text-gray-500">{stats.total} assignments</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 size={12} className="text-green-600" />
                                    {stats.completed}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} className="text-yellow-600" />
                                    {stats.pending}
                                </span>
                                {stats.overdue > 0 && (
                                    <span className="flex items-center gap-1">
                                        <XCircle size={12} className="text-red-600" />
                                        {stats.overdue}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Progress Ring Component
    const ProgressRing = ({ percentage, size = 120, strokeWidth = 10, color = 'text-purple-600' }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="text-gray-200"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={`${color} transition-all duration-1000`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${color.replace('text-', 'text-')}`}>
                            {percentage}%
                        </div>
                        <div className="text-xs text-gray-500">Complete</div>
                    </div>
                </div>
            </div>
        );
    };

    // Enhanced Line Chart Component with better visualization
    const LineChart = ({ data, title, subtitle }) => {
        if (!data || data.length === 0) {
            return (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
                    <div className="relative h-40 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">No data available</p>
                    </div>
                </div>
            );
        }

        const maxValue = Math.max(...data.map(item => item.value), 1);
        const minValue = Math.min(...data.map(item => item.value), 0);
        const range = maxValue - minValue || 1;
        
        // Calculate points for the line
        const points = data.map((item, index) => {
            const x = (index / (data.length - 1 || 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return `${x},${y}`;
        }).join(' ');

        // Calculate trend
        const firstValue = data[0]?.value || 0;
        const lastValue = data[data.length - 1]?.value || 0;
        const trend = lastValue - firstValue;
        const trendPercentage = firstValue > 0 ? ((trend / firstValue) * 100).toFixed(1) : 0;
        const isImproving = trend > 0;
        const isDeclining = trend < 0;

        return (
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        {title}
                        {trend !== 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isImproving 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {isImproving ? '↑' : '↓'} {Math.abs(trendPercentage)}%
                            </span>
                        )}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                
                <div className="relative h-40 bg-gradient-to-b from-blue-50 via-blue-25 to-transparent rounded-lg p-4">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                        <span>{Math.round(maxValue)}</span>
                        <span>{Math.round((maxValue + minValue) / 2)}</span>
                        <span>{Math.round(minValue)}</span>
                    </div>
                    
                    {/* Chart area with padding for labels */}
                    <div className="ml-8 h-full">
                        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                            {/* Grid lines */}
                            {[0, 25, 50, 75, 100].map((y) => (
                                <line
                                    key={y}
                                    x1="0"
                                    y1={y}
                                    x2="100"
                                    y2={y}
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                    className="text-gray-200"
                                    opacity="0.5"
                                />
                            ))}
                            
                            {/* Area under the line */}
                            <polygon
                                fill="currentColor"
                                fillOpacity="0.1"
                                points={`0,100 ${points} 100,100`}
                                className="text-blue-600"
                            />
                            
                            {/* Trend line */}
                            <polyline
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                points={points}
                                className="text-blue-600"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            
                            {/* Data points */}
                            {data.map((item, index) => {
                                const x = (index / (data.length - 1 || 1)) * 100;
                                const y = 100 - ((item.value - minValue) / range) * 100;
                                return (
                                    <g key={index}>
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="3.5"
                                            fill="white"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="text-blue-600"
                                        />
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="1.5"
                                            fill="currentColor"
                                            className="text-blue-600"
                                        />
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
                
                {/* X-axis labels with assignment names */}
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex flex-col items-center max-w-[20%]">
                            <span className="truncate w-full text-center" title={item.fullLabel || item.label}>
                                {item.shortLabel || item.label}
                            </span>
                            {item.value > 0 && (
                                <span className="text-blue-600 font-semibold mt-1">{item.value}%</span>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Trend summary */}
                {data.length >= 2 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Average Score:</span>
                            <span className="font-semibold text-gray-900">
                                {Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>
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

    const chartColors = [
        'bg-gradient-to-r from-purple-500 to-purple-600',
        'bg-gradient-to-r from-blue-500 to-blue-600',
        'bg-gradient-to-r from-green-500 to-green-600',
        'bg-gradient-to-r from-orange-500 to-orange-600',
        'bg-gradient-to-r from-pink-500 to-pink-600'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <GraduationCap className="text-purple-600" size={36} />
                        Student Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Welcome back, {currentUser?.fullName || 'Student'}! Here's your academic overview.
                    </p>
                </div>

                {/* Infinite Loop Assignment Display - Image Style */}
                <div className="mb-8 relative">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="text-purple-600" size={28} />
                                My Assignments
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.totalAssignments}</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Container with Circle and List */}
                        <div className="flex gap-8 items-start">
                            {/* Large Circular Icon on Left */}
                            <div className="flex-shrink-0 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-blue-600 flex items-center justify-center shadow-lg">
                                    <FileText className="text-blue-600" size={48} strokeWidth={2} />
                                </div>
                            </div>

                            {/* Assignment List on Right with Animation */}
                            <div className="flex-1 relative h-[450px] overflow-hidden">
                                {/* Scrolling Container */}
                                <div className="animate-scroll-rotate">
                                    {/* First set of assignments */}
                                    {assignments.length > 0 ? (
                                        <>
                                            {assignments.map((assignment, index) => {
                                                // Get submission status
                                                const studentCode = currentUser?.userCode;
                                                const submission = assignment.submission;
                                                const submissionStatus = submission?.status || assignment.status;
                                                
                                                // Status configuration
                                                const statusConfig = {
                                                    pending: { bg: 'bg-yellow-500', label: 'Pending' },
                                                    submitted: { bg: 'bg-orange-500', label: 'In Progress' },
                                                    reviewed: { bg: 'bg-green-500', label: 'Completed' },
                                                    completed: { bg: 'bg-green-500', label: 'Completed' },
                                                    overdue: { bg: 'bg-red-500', label: 'Overdue' }
                                                };
                                                
                                                const status = submissionStatus === 'completed' ? 'reviewed' : 
                                                             submissionStatus === 'reviewed' ? 'reviewed' :
                                                             submissionStatus === 'submitted' ? 'submitted' :
                                                             new Date(assignment.dueDate) < new Date() && !submission ? 'overdue' : 'pending';
                                                
                                                const config = statusConfig[status] || statusConfig.pending;
                                                
                                                return (
                                                    <div
                                                        key={`${assignment._id}-1`}
                                                        className={`assignment-item relative border-b border-gray-200 py-5 px-2 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                                                            index === 0 || index === assignments.length - 1 ? 'opacity-50' : 'opacity-100'
                                                        }`}
                                                        onClick={() => navigate(`/student/assignments/attempt/${assignment.assignmentCode}/${encodeURIComponent(assignment.assignmentName)}`)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="text-base font-semibold text-blue-900 mb-2">
                                                                    {assignment.assignmentName}
                                                                </h3>
                                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white ${config.bg}`}>
                                                                    {config.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Duplicate set for seamless loop */}
                                            {assignments.map((assignment, index) => {
                                                const studentCode = currentUser?.userCode;
                                                const submission = assignment.submission;
                                                const submissionStatus = submission?.status || assignment.status;
                                                
                                                const statusConfig = {
                                                    pending: { bg: 'bg-yellow-500', label: 'Pending' },
                                                    submitted: { bg: 'bg-orange-500', label: 'In Progress' },
                                                    reviewed: { bg: 'bg-green-500', label: 'Completed' },
                                                    completed: { bg: 'bg-green-500', label: 'Completed' },
                                                    overdue: { bg: 'bg-red-500', label: 'Overdue' }
                                                };
                                                
                                                const status = submissionStatus === 'completed' ? 'reviewed' : 
                                                             submissionStatus === 'reviewed' ? 'reviewed' :
                                                             submissionStatus === 'submitted' ? 'submitted' :
                                                             new Date(assignment.dueDate) < new Date() && !submission ? 'overdue' : 'pending';
                                                
                                                const config = statusConfig[status] || statusConfig.pending;
                                                
                                                return (
                                                    <div
                                                        key={`${assignment._id}-2`}
                                                        className={`assignment-item relative border-b border-gray-200 py-5 px-2 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                                                            index === 0 || index === assignments.length - 1 ? 'opacity-50' : 'opacity-100'
                                                        }`}
                                                        onClick={() => navigate(`/student/assignments/attempt/${assignment.assignmentCode}/${encodeURIComponent(assignment.assignmentName)}`)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="text-base font-semibold text-blue-900 mb-2">
                                                                    {assignment.assignmentName}
                                                                </h3>
                                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white ${config.bg}`}>
                                                                    {config.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-500 text-lg">No assignments available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Opacity overlays for smooth fade effect */}
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/60 to-transparent z-10 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/60 to-transparent z-10 pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* CSS for infinite scroll animation with opacity effects */}
                    <style>{`
                        @keyframes scroll-rotate {
                            0% {
                                transform: translateY(0);
                            }
                            100% {
                                transform: translateY(-50%);
                            }
                        }
                        
                        .animate-scroll-rotate {
                            animation: scroll-rotate ${assignments.length > 0 ? Math.max(assignments.length * 2.5, 15) : 15}s linear infinite;
                        }
                        
                        .animate-scroll-rotate:hover {
                            animation-play-state: paused;
                        }
                        
                        .assignment-item {
                            opacity: 1;
                            transition: opacity 0.3s ease;
                        }
                        
                        /* Fade effect for items at edges using mask */
                        .assignment-item:first-child,
                        .assignment-item:last-child,
                        .assignment-item:nth-child(2),
                        .assignment-item:nth-last-child(2) {
                            opacity: 0.5;
                        }
                    `}</style>
                </div>

                {/* Charts and Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                    {/* Completion Rate Chart */}
                    <div className=" lg:col-span-4 bg-white rounded-xl p-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="text-purple-600" size={24} />
                            Completion Rate
                        </h2>
                        <div className="flex items-center justify-center">
                            <ProgressRing
                                percentage={completionRate}
                                size={150}
                                strokeWidth={12}
                                color="text-purple-600"
                            />
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                {stats.completedAssignments} of {stats.totalAssignments} assignments completed
                            </p>
                        </div>
                    </div>

                    {/* Subject-wise Performance */}
                    {/* <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="text-blue-600" size={24} />
                            Subject Performance
                        </h2>
                        {Object.keys(subjectStats).length > 0 ? (
                            <BarChart
                                data={subjectStats}
                                title="Assignments by Subject"
                                colors={chartColors}
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="mx-auto mb-2 text-gray-400" size={48} />
                                <p>No subject data available</p>
                            </div>
                        )}
                    </div> */}

                    {/* Performance Trend */}
                    <div className=" lg:col-span-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="text-green-600" size={24} />
                                Performance Trend
                            </h2>
                            {performanceData.length > 0 && (
                                <span className="text-xs text-gray-500">
                                    Last {performanceData.length} assignments
                                </span>
                            )}
                        </div>
                        {performanceData.length > 0 ? (
                            <LineChart
                                data={performanceData}
                                title="Recent Assignment Scores"
                                subtitle="Track your progress over time"
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BarChart3 className="mx-auto mb-2 text-gray-400" size={48} />
                                <p className="font-medium">No performance data yet</p>
                                <p className="text-sm mt-1">Complete assignments to see your trend</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="text-purple-600" size={24} />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/student/assignments')}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3">
                                <FileText size={24} />
                                <span className="font-semibold">View Assignments</span>
                            </div>
                            <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/student/reports')}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3">
                                <BarChart3 size={24} />
                                <span className="font-semibold">View Reports</span>
                            </div>
                            <ArrowRight size={20} />
                        </button>
                        {stats.pendingAssignments > 0 && (
                            <button
                                onClick={() => navigate('/student/assignments')}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <PlayCircle size={24} />
                                    <span className="font-semibold">Continue Learning</span>
                                </div>
                                <ArrowRight size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Assignments */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="text-orange-600" size={24} />
                                Upcoming Assignments
                            </h2>
                            <button
                                onClick={() => navigate('/student/assignments')}
                                className="text-orange-600 hover:text-orange-700 text-sm font-semibold flex items-center gap-1"
                            >
                                View All <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {upcomingAssignments.length > 0 ? (
                                upcomingAssignments.map((assignment) => {
                                    const daysUntil = getDaysUntilDue(assignment.dueDate);
                                    return (
                                        <div
                                            key={assignment._id}
                                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/student/assignments/attempt/${assignment.assignmentCode}/${assignment.assignmentName}`)}
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
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">
                                                    {assignment.questionsCount} questions
                                                </span>
                                                {daysUntil !== null && (
                                                    <span className={`font-semibold ${
                                                        daysUntil <= 3 ? 'text-red-600' : 
                                                        daysUntil <= 7 ? 'text-orange-600' : 
                                                        'text-green-600'
                                                    }`}>
                                                        {daysUntil === 0 ? 'Due today' : 
                                                         daysUntil === 1 ? 'Due tomorrow' : 
                                                         `${daysUntil} days left`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle2 className="mx-auto mb-2 text-green-400" size={48} />
                                    <p>No upcoming assignments!</p>
                                    <p className="text-sm mt-1">You're all caught up</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Assignments */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="text-purple-600" size={24} />
                                Recent Assignments
                            </h2>
                            <button
                                onClick={() => navigate('/student/assignments')}
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
                                        onClick={() => {
                                            if (assignment.status === 'completed') {
                                                // Navigate to view completed assignment
                                                navigate(`/student/assignments`);
                                            } else {
                                                navigate(`/student/assignments/attempt/${assignment.assignmentCode}/${assignment.assignmentName}`);
                                            }
                                        }}
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
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">
                                                {assignment.questionsCount} questions
                                            </span>
                                            {assignment.isSubmitted && assignment.submission?.overallScore && (
                                                <span className="text-green-600 font-semibold">
                                                    Score: {assignment.submission.overallScore}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="mx-auto mb-2 text-gray-400" size={48} />
                                    <p>No assignments yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="text-yellow-600" size={24} />
                        Performance Summary
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-purple-900">Overall Progress</h3>
                                <Target className="text-purple-600" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-purple-900">{completionRate}%</p>
                            <p className="text-sm text-purple-700 mt-1">
                                {stats.completedAssignments} assignments completed
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-green-900">Average Score</h3>
                                <BarChart3 className="text-green-600" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-green-900">
                                {stats.averageScore > 0 ? `${stats.averageScore}%` : 'N/A'}
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                                Based on graded work
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-blue-900">Active Work</h3>
                                <Clock className="text-blue-600" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-blue-900">
                                {stats.pendingAssignments + stats.overdueAssignments}
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                {stats.pendingAssignments} pending, {stats.overdueAssignments} overdue
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashbord;
