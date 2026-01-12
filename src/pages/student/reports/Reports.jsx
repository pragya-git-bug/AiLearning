import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    FileText, 
    CheckCircle2, 
    Clock, 
    TrendingUp, 
    Award, 
    BookOpen,
    Calendar,
    Target,
    Sparkles,
    Loader2,
    AlertCircle,
    BarChart3,
    Lightbulb,
    GraduationCap,
    Users,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import BASE_URL from '../../../http/Service';

const StuAssignment = () => {
    const { currentUser } = useSelector((state) => state.userData);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);
    const [openAccordions, setOpenAccordions] = useState({
        performanceAnalysis: true,
        assignmentDetails: true
    });

    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

    // Get student code from currentUser or generate from name
    const getStudentCode = () => {
        if (currentUser?.userCode) return currentUser.userCode;
        if (currentUser?.name) {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const random = Math.floor(Math.random() * 10000);
            return `${initials}${random}`;
        }
        return 'HEM3408'; // Fallback
    };

    useEffect(() => {
        fetchStudentReport();
    }, []);

    const fetchStudentReport = async () => {
        setLoading(true);
        setError('');
        const studentCode = getStudentCode();
        
        if (!studentCode) {
            setError('Student code not found. Please login again.');
            setLoading(false);
            return;
        }
        
        try {
            const response = await fetch(`${BASE_URL}/api/assignments/student-report/${studentCode}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch student report');
            }

            const data = await response.json();
            setReportData(data);
        } catch (err) {
            setError(err.message || 'Failed to load student report');
            console.error('Error fetching report:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateAISummary = async () => {
        if (!reportData?.data) return;

        setLoadingAI(true);
        const { student, statistics, assignments } = reportData.data || {};
        
        // Ensure we have valid data
        if (!student || !statistics || !assignments) {
            setLoadingAI(false);
            setAiSummary('Unable to generate AI summary: Incomplete data');
            return;
        }

        const prompt = `Analyze this student's academic performance and provide:
1. A comprehensive summary of their performance (2-3 paragraphs)
2. Specific suggestions for improvement based on their statistics and assignment data
3. Focus areas that need attention
4. Topics that need more practice

Student: ${student?.fullName || 'Unknown'} (${student?.className || 'N/A'})
Statistics:
- Total Assignments: ${statistics?.totalAssignments || 0}
- Completed: ${statistics?.completedAssignments || 0}
- Pending: ${statistics?.pendingAssignments || 0}
- Average Score: ${statistics?.averageScore || 0}
- Total Score: ${statistics?.totalScore || 0}

Assignments: ${assignments?.length || 0} assignment(s) with various topics and subjects.

Provide the response in JSON format with "summary" and "suggestions" fields. Make it detailed and actionable.`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an educational advisor that provides detailed, actionable feedback to students.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    
                    // Handle different response formats
                    if (typeof parsed === 'object' && parsed !== null) {
                        // If it's an object with performance, areas_of_concern, topics_to_focus_on
                        if (parsed.performance || parsed.areas_of_concern || parsed.topics_to_focus_on) {
                            let summaryText = '';
                            let suggestionsText = '';
                            
                            if (parsed.performance) {
                                summaryText += typeof parsed.performance === 'string' 
                                    ? parsed.performance 
                                    : JSON.stringify(parsed.performance, null, 2);
                            }
                            
                            if (parsed.areas_of_concern) {
                                const concerns = Array.isArray(parsed.areas_of_concern) 
                                    ? parsed.areas_of_concern.join('\n• ') 
                                    : (typeof parsed.areas_of_concern === 'string' ? parsed.areas_of_concern : JSON.stringify(parsed.areas_of_concern));
                                suggestionsText += `Areas of Concern:\n• ${concerns}\n\n`;
                            }
                            
                            if (parsed.topics_to_focus_on) {
                                const topics = Array.isArray(parsed.topics_to_focus_on) 
                                    ? parsed.topics_to_focus_on.join('\n• ') 
                                    : (typeof parsed.topics_to_focus_on === 'string' ? parsed.topics_to_focus_on : JSON.stringify(parsed.topics_to_focus_on));
                                suggestionsText += `Topics to Focus On:\n• ${topics}\n\n`;
                            }
                            
                            setAiSummary(safeStringify(summaryText || 'Performance analysis available.'));
                            setAiSuggestions(safeStringify(suggestionsText || ''));
                        } else if (parsed.summary || parsed.suggestions) {
                            // Standard format with summary and suggestions
                            setAiSummary(safeStringify(parsed.summary || ''));
                            setAiSuggestions(safeStringify(parsed.suggestions || ''));
                        } else {
                            // If it's an object but not in expected format, convert to readable text
                            setAiSummary(safeStringify(parsed));
                            setAiSuggestions('');
                        }
                    } else {
                        setAiSummary(safeStringify(parsed));
                        setAiSuggestions('');
                    }
                } else {
                    // Not JSON, split by suggestions keyword
                    const parts = content.split(/suggestions?:/i);
                    setAiSummary(safeStringify(parts[0] || content));
                    setAiSuggestions(safeStringify(parts[1] || ''));
                }
            } catch (parseError) {
                // If parsing fails, use content as-is but ensure it's a string
                setAiSummary(safeStringify(content));
                setAiSuggestions('');
            }
        } catch (err) {
            console.error('Error generating AI summary:', err);
            setAiSummary('Unable to generate AI summary at this time.');
        } finally {
            setLoadingAI(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getStatusBadge = (status) => {
        // Handle undefined/null status
        if (!status) {
            status = 'pending';
        }
        
        const config = {
            completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            reviewed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Award }
        };
        const statusConfig = config[status] || config.pending;
        const Icon = statusConfig.icon;
        
        // Ensure status is a string before calling charAt
        const statusString = String(status || 'pending');
        
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                <Icon size={14} />
                {statusString.charAt(0).toUpperCase() + statusString.slice(1)}
            </span>
        );
    };

    const calculateProgress = (completed, total) => {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    };

    // Helper function to safely convert any value to string for rendering
    const safeStringify = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            // If it's an array, join it
            if (Array.isArray(value)) {
                return value.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n• ');
            }
            // If it's an object, format it nicely
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const toggleAccordion = (accordionName) => {
        setOpenAccordions(prev => ({
            ...prev,
            [accordionName]: !prev[accordionName]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 text-lg">Loading your report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchStudentReport}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!reportData?.data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <p className="text-gray-600 text-lg">No data available</p>
            </div>
        );
    }

    const { student, statistics, assignments } = reportData.data || {};
    
    // Ensure we have valid data before rendering
    if (!student || !statistics || !assignments) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="text-yellow-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 text-lg">Incomplete data received</p>
                    <button
                        onClick={fetchStudentReport}
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    
    const progressPercentage = calculateProgress(statistics.completedAssignments || 0, statistics.totalAssignments || 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <FileText className="text-purple-600" size={36} />
                                My Assignments Report
                            </h1>
                            <p className="text-gray-600 text-lg">Comprehensive overview of your academic performance</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Student Code</p>
                                <p className="text-lg font-bold text-gray-900">{reportData.studentCode}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student Info Card */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                                {(student.fullName || 'N').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{student.fullName || 'Unknown Student'}</h2>
                                <div className="flex items-center gap-4 mt-2 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap size={18} />
                                        <span>{student.className}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={18} />
                                        <span>{student.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/80 text-sm">Overall Performance</p>
                            <p className="text-3xl font-bold">{statistics.averageScore || 0}%</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Assignments</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.totalAssignments}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <FileText className="text-purple-600" size={24} />
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Completed</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{statistics.completedAssignments}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="text-green-600" size={24} />
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${calculateProgress(statistics.completedAssignments, statistics.totalAssignments)}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-1">{statistics.pendingAssignments}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <Clock className="text-yellow-600" size={24} />
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-yellow-600 h-2 rounded-full transition-all"
                                style={{ width: `${calculateProgress(statistics.pendingAssignments, statistics.totalAssignments)}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Score</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{statistics.totalScore}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <TrendingUp className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${statistics.averageScore || 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assignment Status Pie Chart */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BarChart3 className="text-indigo-600" size={24} />
                            Assignment Status Distribution
                        </h3>
                        {statistics.totalAssignments > 0 ? (
                            <>
                                <div className="flex items-center justify-center">
                                    <div className="relative w-48 h-48">
                                        <svg className="transform -rotate-90 w-48 h-48">
                                            <circle
                                                cx="96"
                                                cy="96"
                                                r="80"
                                                stroke="currentColor"
                                                strokeWidth="16"
                                                fill="transparent"
                                                className="text-gray-200"
                                            />
                                            {/* Completed */}
                                            {statistics.completedAssignments > 0 && (
                                                <circle
                                                    cx="96"
                                                    cy="96"
                                                    r="80"
                                                    stroke="currentColor"
                                                    strokeWidth="16"
                                                    fill="transparent"
                                                    strokeDasharray={`${(statistics.completedAssignments / statistics.totalAssignments) * 502.4} 502.4`}
                                                    className="text-green-600"
                                                    strokeLinecap="round"
                                                />
                                            )}
                                            {/* Pending */}
                                            {statistics.pendingAssignments > 0 && (
                                                <circle
                                                    cx="96"
                                                    cy="96"
                                                    r="80"
                                                    stroke="currentColor"
                                                    strokeWidth="16"
                                                    fill="transparent"
                                                    strokeDasharray={`${(statistics.pendingAssignments / statistics.totalAssignments) * 502.4} 502.4`}
                                                    strokeDashoffset={`-${(statistics.completedAssignments / statistics.totalAssignments) * 502.4}`}
                                                    className="text-yellow-600"
                                                    strokeLinecap="round"
                                                />
                                            )}
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-gray-900">{statistics.totalAssignments}</p>
                                                <p className="text-sm text-gray-600">Total</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-6 mt-6">
                                    {statistics.completedAssignments > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-green-600"></div>
                                            <span className="text-sm text-gray-700">Completed ({statistics.completedAssignments})</span>
                                        </div>
                                    )}
                                    {statistics.pendingAssignments > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
                                            <span className="text-sm text-gray-700">Pending ({statistics.pendingAssignments})</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>No assignments to display</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bar Chart for Statistics - Accordion */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <button
                        onClick={() => toggleAccordion('performanceAnalysis')}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="text-purple-600" size={24} />
                            Performance Analysis
                        </h3>
                        {openAccordions.performanceAnalysis ? (
                            <ChevronUp className="text-gray-600" size={24} />
                        ) : (
                            <ChevronDown className="text-gray-600" size={24} />
                        )}
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        openAccordions.performanceAnalysis ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="px-6 pb-6 space-y-4">
                        {/* Overall Progress Bar */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                <span className="text-sm font-bold text-purple-600">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div 
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                                    style={{ width: `${progressPercentage}%` }}
                                >
                                    {progressPercentage > 10 && (
                                        <span className="text-xs font-bold text-white">{progressPercentage}%</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Total Assignments Bar */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Total Assignments</span>
                                <span className="text-sm font-bold text-gray-900">{statistics.totalAssignments}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-6">
                                <div 
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 h-6 rounded-full transition-all flex items-center justify-end pr-3"
                                    style={{ width: '100%' }}
                                >
                                    <span className="text-xs font-bold text-white">{statistics.totalAssignments}</span>
                                </div>
                            </div>
                        </div>

                        {/* Completed Bar */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Completed</span>
                                <span className="text-sm font-bold text-green-600">{statistics.completedAssignments}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-6">
                                <div 
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-6 rounded-full transition-all flex items-center justify-end pr-3"
                                    style={{ width: `${statistics.totalAssignments > 0 ? (statistics.completedAssignments / statistics.totalAssignments) * 100 : 0}%` }}
                                >
                                    {statistics.completedAssignments > 0 && (
                                        <span className="text-xs font-bold text-white">{statistics.completedAssignments}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pending Bar */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Pending</span>
                                <span className="text-sm font-bold text-yellow-600">{statistics.pendingAssignments}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-6">
                                <div 
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-6 rounded-full transition-all flex items-center justify-end pr-3"
                                    style={{ width: `${statistics.totalAssignments > 0 ? (statistics.pendingAssignments / statistics.totalAssignments) * 100 : 0}%` }}
                                >
                                    {statistics.pendingAssignments > 0 && (
                                        <span className="text-xs font-bold text-white">{statistics.pendingAssignments}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Average Score Bar */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Average Score</span>
                                <span className="text-sm font-bold text-blue-600">{statistics.averageScore || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-6">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-6 rounded-full transition-all flex items-center justify-end pr-3"
                                    style={{ width: `${statistics.averageScore || 0}%` }}
                                >
                                    {(statistics.averageScore || 0) > 5 && (
                                        <span className="text-xs font-bold text-white">{statistics.averageScore || 0}%</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                {/* Assignments List - Accordion */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <button
                        onClick={() => toggleAccordion('assignmentDetails')}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200"
                    >
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="text-purple-600" size={24} />
                            Assignment Details
                        </h3>
                        {openAccordions.assignmentDetails ? (
                            <ChevronUp className="text-gray-600" size={24} />
                        ) : (
                            <ChevronDown className="text-gray-600" size={24} />
                        )}
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        openAccordions.assignmentDetails ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="divide-y divide-gray-200">
                        {assignments && assignments.length > 0 ? assignments.map((item, index) => {
                            // Safely handle missing assignment data
                            const assignment = item?.assignment || {};
                            const assignmentName = assignment.assignmentName || 'Unnamed Assignment';
                            const assignmentCode = assignment.assignmentCode || 'N/A';
                            const subject = assignment.subject || 'N/A';
                            
                            return (
                            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                                {assignmentName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">
                                                    {assignmentName}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Code: {assignmentCode} | {subject}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 mt-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={16} />
                                                Due: {formatDate(assignment.dueDate)}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users size={16} />
                                                Class: {assignment.assignedTo || 'N/A'}
                                            </div>
                                            {item.submission?.overallScore !== null && (
                                                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                                    <Award size={16} />
                                                    Score: {item.submission.overallScore}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(assignment.status || item.status)}
                                        {item.submission?.status && (
                                            <span className="text-xs text-gray-500">
                                                Submission: {item.submission.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {item.submission?.answers && item.submission.answers.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Answers Submitted:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {item.submission.answers.map((answer, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                    <span className="text-sm text-gray-600">Q{answer.questionNo}</span>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                        answer.rate >= 7 ? 'bg-green-100 text-green-700' :
                                                        answer.rate >= 4 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        Rate: {answer.rate}/10
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            );
                        }) : (
                            <div className="p-6 text-center text-gray-500">
                                <p>No assignments found</p>
                            </div>
                        )}
                        </div>
                    </div>
                </div>

                {/* AI Report Section - At Bottom */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="text-purple-600" size={28} />
                            AI Generated Report & Suggestions
                        </h3>
                        {!aiSummary && !loadingAI && (
                            <button
                                onClick={generateAISummary}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                <Sparkles size={20} />
                                AI Generate Report Suggestion
                            </button>
                        )}
                    </div>

                    {loadingAI ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
                            <p className="text-gray-600 text-lg">Generating AI report and suggestions...</p>
                        </div>
                    ) : (aiSummary || aiSuggestions) ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* AI Summary */}
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="text-purple-600" size={20} />
                                    Performance Summary
                                </h4>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {safeStringify(aiSummary)}
                                    </p>
                                </div>
                            </div>

                            {/* AI Suggestions */}
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Lightbulb className="text-yellow-600" size={20} />
                                    Suggestions & Recommendations
                                </h4>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {safeStringify(aiSuggestions)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <Sparkles className="text-gray-400 mx-auto mb-4" size={48} />
                            <p className="text-gray-600 text-lg font-medium mb-2">No AI report generated yet</p>
                            <p className="text-gray-500 text-sm mb-4">Click the button above to generate AI-powered insights and suggestions</p>
                            <button
                                onClick={generateAISummary}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                <Sparkles size={20} />
                                Generate AI Report
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StuAssignment;
