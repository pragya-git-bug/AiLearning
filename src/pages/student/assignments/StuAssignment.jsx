import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    FileText, 
    Calendar, 
    BookOpen, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Eye,
    Search,
    Filter,
    PlayCircle,
    Loader2
} from 'lucide-react';
import { getAssignmentsByClass } from '../../../services/api';

const StuAssignment = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.userData);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [dueDateFilter, setDueDateFilter] = useState('all'); // all, upcoming, overdue, past

    // Fetch assignments from API based on student's class
    useEffect(() => {
        const fetchAssignments = async () => {
            // Get student's class name from currentUser
            const studentClassName = currentUser?.className || currentUser?.assignedTo;
            
            if (!studentClassName) {
                setError('Class information not found. Please contact your teacher.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const result = await getAssignmentsByClass(studentClassName);

                if (result.success && result.data.success) {
                    // Map API response to component format
                    const mappedAssignments = result.data.data.map((assignment) => {
                        // Convert questions object to array format
                        const questionsArray = assignment.questions 
                            ? Object.values(assignment.questions).map((q, index) => ({
                                id: index + 1,
                                question: q.question,
                                questionNo: q.questionNo,
                                difficulty: q.difficulties?.toLowerCase() || 'medium',
                                difficulties: q.difficulties,
                                _id: q._id
                            }))
                            : [];

                        return {
                            _id: assignment._id,
                            assignmentName: assignment.assignmentName,
                            subject: assignment.subject,
                            dueDate: assignment.dueDate,
                            status: assignment.status,
                            assignedTo: assignment.assignedTo,
                            teacherCode: assignment.teacherCode,
                            assignmentCode: assignment.assignmentCode,
                            questions: questionsArray,
                            questionsCount: questionsArray.length,
                            submissions: assignment.submissions || {},
                            createdAt: assignment.createdAt,
                            updatedAt: assignment.updatedAt
                        };
                    });

                    setAssignments(mappedAssignments);
                } else {
                    setError(result.error || 'Failed to load assignments');
                    setAssignments([]);
                }
            } catch (err) {
                setError(err.message || 'An error occurred while loading assignments');
                setAssignments([]);
                console.error('Error fetching assignments:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssignments();
    }, [currentUser?.className, currentUser?.assignedTo]);

    // Get unique subjects from assignments
    const uniqueSubjects = useMemo(() => {
        const subjects = assignments.map(a => a.subject).filter(Boolean);
        return [...new Set(subjects)].sort();
    }, [assignments]);

    // Get submission status for a student
    const getSubmissionStatus = (assignment) => {
        if (!currentUser?.userCode || !assignment.submissions) {
            return 'pending'; // Default to pending if no submission
        }
        
        const studentSubmission = assignment.submissions[currentUser.userCode];
        if (studentSubmission && studentSubmission.status) {
            // Map API status to enum values
            const status = studentSubmission.status;
            // If status is 'completed', map it to 'reviewed'
            if (status === 'completed') {
                return 'reviewed';
            }
            // Return the status if it's one of the valid enum values
            if (['pending', 'submitted', 'reviewed'].includes(status)) {
                return status;
            }
            // Default to pending for unknown statuses
            return 'pending';
        }
        
        return 'pending';
    };

    // Filter assignments
    const filteredAssignments = useMemo(() => {
        return assignments.filter(assignment => {
            // Search filter
            const matchesSearch = assignment.assignmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Get submission status for filtering
            const submissionStatus = getSubmissionStatus(assignment);
            
            // Status filter - use submission status
            const matchesStatus = statusFilter === 'all' || submissionStatus === statusFilter;
            
            // Subject filter
            const matchesSubject = subjectFilter === 'all' || assignment.subject === subjectFilter;
            
            // Due date filter
            let matchesDueDate = true;
            if (dueDateFilter !== 'all' && assignment.dueDate) {
                const dueDate = new Date(assignment.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0, 0, 0, 0);
                
                if (dueDateFilter === 'upcoming') {
                    matchesDueDate = dueDate >= today;
                } else if (dueDateFilter === 'overdue') {
                    matchesDueDate = dueDate < today && submissionStatus === 'pending';
                } else if (dueDateFilter === 'past') {
                    matchesDueDate = dueDate < today;
                }
            }
            
            return matchesSearch && matchesStatus && matchesSubject && matchesDueDate;
        });
    }, [assignments, searchTerm, statusFilter, subjectFilter, dueDateFilter, currentUser?.userCode]);

    const getStatusBadge = (status, dueDate) => {
        const isOverdue = dueDate && new Date(dueDate) < new Date() && status === 'pending';
        
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
            submitted: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle2, label: 'Submitted' },
            reviewed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Reviewed' }
        };
        
        const config = isOverdue 
            ? { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Overdue' }
            : (statusConfig[status] || statusConfig.pending);
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

    const isOverdue = (dueDate, submissionStatus) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && submissionStatus === 'pending';
    };

    const handleAttemptAssignment = (assignment) => {
        // Navigate to attempt assignment page with assignmentCode and assignmentName
        const assignmentCode = assignment.assignmentCode || assignment._id;
        const assignmentName = encodeURIComponent(assignment.assignmentName);
        navigate(`/student/assignments/attempt/${assignmentCode}/${assignmentName}`);
    };

    const handleViewAssignment = (assignment) => {
        // Navigate to view assignment details
        navigate(`/student/assignments/view/${assignment.assignmentName}`);
    };

    return (
        <div className="min-h-screen bg-white p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-[#001d35] mb-2 flex items-center gap-3 flex-wrap">
                            <FileText className="text-[#0066ff]" size={36} />
                            <span>My Assignments</span>
                            <span className="text-3xl text-[#5f6368] mx-2">|</span>
                            <span className="text-[#5f6368] text-2xl font-normal">View and attempt all your assignments</span>
                        </h1>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row items-stretch gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative min-w-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6368]" size={20} strokeWidth={2} />
                            <input
                                type="text"
                                placeholder="Search assignments by name or subject..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0066ff] focus:outline-none transition-all text-[#3c4043] bg-[#f5f5f5]"
                            />
                        </div>

                        {/* Filters - Single Row */}
                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-3">
                            {/* Subject Filter */}
                            <div className="flex items-center gap-2 min-w-[160px]">
                                <BookOpen className="text-[#5f6368] flex-shrink-0" size={18} strokeWidth={2} />
                                <select
                                    value={subjectFilter}
                                    onChange={(e) => setSubjectFilter(e.target.value)}
                                    className="flex-1 px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0066ff] focus:outline-none transition-all text-[#3c4043] text-sm font-medium cursor-pointer bg-[#f5f5f5]"
                                >
                                    <option value="all">All Subjects</option>
                                    {uniqueSubjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2 min-w-[140px]">
                                <Filter className="text-[#5f6368] flex-shrink-0" size={18} strokeWidth={2} />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex-1 px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0066ff] focus:outline-none transition-all text-[#3c4043] text-sm font-medium cursor-pointer bg-[#f5f5f5]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="reviewed">Reviewed</option>
                                </select>
                            </div>

                            {/* Due Date Filter */}
                            <div className="flex items-center gap-2 min-w-[140px]">
                                <Calendar className="text-[#5f6368] flex-shrink-0" size={18} strokeWidth={2} />
                                <select
                                    value={dueDateFilter}
                                    onChange={(e) => setDueDateFilter(e.target.value)}
                                    className="flex-1 px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0066ff] focus:outline-none transition-all text-[#3c4043] text-sm font-medium cursor-pointer bg-[#f5f5f5]"
                                >
                                    <option value="all">All Dates</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="past">Past</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignments Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-[#5f6368]">
                            <Loader2 className="animate-spin mb-4 text-[#0066ff]" size={48} />
                            <p className="text-xl font-medium text-[#3c4043]">Loading assignments...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-400">
                            <XCircle size={64} className="mb-4 opacity-50" />
                            <p className="text-xl font-medium text-red-600">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 flex items-center gap-2 bg-[#0066ff] hover:bg-[#0052cc] text-white px-6 py-3 rounded-xl font-semibold transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredAssignments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-[#5f6368]">
                            <FileText size={64} className="mb-4 opacity-50" />
                            <p className="text-xl font-medium text-[#3c4043]">No assignments found</p>
                            <p className="text-sm mt-2 text-[#5f6368]">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#d3e3fd]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-[#001d35]">Assignment Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-[#001d35]">Subject</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-[#001d35]">Due Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-[#001d35]">Questions</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-[#001d35]">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider text-[#001d35]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAssignments.map((assignment, index) => {
                                        const submissionStatus = getSubmissionStatus(assignment);
                                        return (
                                        <tr 
                                            key={index} 
                                            className={`hover:bg-gray-200 transition-colors duration-200 ${
                                                isOverdue(assignment.dueDate, submissionStatus) ? 'bg-red-50/50' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066ff] to-[#8b5cf6] flex items-center justify-center text-white font-bold shadow-sm">
                                                        {assignment.assignmentName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-[#001d35]">
                                                            {assignment.assignmentName}
                                                        </div>
                                                        {assignment.summury && (
                                                            <div className="text-xs text-[#5f6368] mt-1">
                                                                {assignment.summury.substring(0, 40)}...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={16} className="text-[#0066ff]" strokeWidth={2} />
                                                    <span className="text-sm font-medium text-[#3c4043]">{assignment.subject}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-[#0066ff]" strokeWidth={2} />
                                                    <span className={`text-sm font-medium ${
                                                        isOverdue(assignment.dueDate, submissionStatus) ? 'text-red-600' : 'text-[#5f6368]'
                                                    }`}>
                                                        {formatDate(assignment.dueDate)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#d3e3fd] text-[#001d35]">
                                                    {assignment.questionsCount || assignment.questions?.length || 0} Questions
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(submissionStatus, assignment.dueDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAttemptAssignment(assignment)}
                                                        className="flex items-center gap-1 px-4 py-2 bg-[#c2e7ff] hover:bg-[#b0deff] text-[#001d35] rounded-full font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                                    >
                                                        <PlayCircle size={16} strokeWidth={2} />
                                                        {submissionStatus === 'submitted' || submissionStatus === 'reviewed' ? 'View' : 'Attempt'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

               
            </div>
        </div>
    );
};

export default StuAssignment;
