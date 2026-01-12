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
    Home,
    ChevronRight
} from 'lucide-react';
import { getSubmittedStudents } from '../../../../../services/api';

const SubmittedStudents = () => {
    const { assignmentCode, assignmentName: assignmentNameParam } = useParams();
    const navigate = useNavigate();
    const [submittedStudents, setSubmittedStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const assignmentName = assignmentNameParam ? decodeURIComponent(assignmentNameParam) : '';

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
            if (!assignmentCode) {
                setError('Assignment code not found');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const result = await getSubmittedStudents(assignmentCode);

                if (result.success && result.data.success) {
                    setSubmittedStudents(result.data.data || []);
                    // Try to get assignment name from the response if available
                    // Otherwise, we can fetch assignment details separately
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
    }, [assignmentCode]);

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="px-6 py-5 mb-6">
                    <div className="flex items-center">
                        {/* Title on Left */}
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900">
                                {assignmentName ? `Submissions - ${assignmentName}` : 'Submissions'}
                            </h1>
                        </div>
                        
                        {/* Vertical Separator */}
                        <div className="h-8 w-px bg-gray-300 mx-4 flex-shrink-0"></div>
                        
                        {/* Breadcrumb Navigation on Right */}
                        <nav className="flex items-center gap-2 text-sm text-gray-700 flex-shrink-0">
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
                            <button
                                onClick={() => navigate('/teacher/assignments')}
                                className="text-blue-600 hover:text-blue-700 transition-colors font-medium px-1"
                            >
                                Assignments
                            </button>
                            <ChevronRight size={14} className="text-gray-400" />
                            <span className="text-gray-500 font-normal px-1">
                                Submissions
                            </span>
                        </nav>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin mb-4 text-purple-600" size={48} />
                            <p className="text-gray-600 text-lg">Loading submissions...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-400">
                            <XCircle size={64} className="mb-4 opacity-50" />
                            <p className="text-xl font-medium text-red-600 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    ) : submittedStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Users size={64} className="mb-4 opacity-50" />
                            <p className="text-xl font-medium text-gray-600">No submissions yet</p>
                            <p className="text-sm mt-2 text-gray-500">Students haven't submitted this assignment</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            {/* Summary and Search Section */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                                    <p className="text-sm font-semibold text-purple-700">
                                        Total Submissions: <span className="text-purple-900">{submittedStudents.length}</span>
                                        {searchTerm && (
                                            <span className="text-purple-600 ml-2">
                                                (Showing: {filteredStudents.length})
                                            </span>
                                        )}
                                    </p>
                                </div>
                                
                                {/* Search Bar */}
                                <div className="relative w-full sm:w-auto min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, code, email, phone, or class..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Code
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Phone
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Class
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                                                    <Users size={48} className="mx-auto mb-3 opacity-30" />
                                                    <p className="text-lg font-medium">No students found</p>
                                                    <p className="text-sm mt-1">Try adjusting your search terms</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map((student, index) => (
                                                <tr
                                                    key={student._id || student.id || index}
                                                    className="hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                                {student.fullName?.charAt(0).toUpperCase() || 'S'}
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {student.fullName || 'Unknown Student'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        {student.userCode ? (
                                                            <span className="px-2.5 py-1 bg-gray-100 rounded text-gray-700 font-mono text-sm">
                                                                {student.userCode}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        {student.email ? (
                                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                                                                <Mail size={14} className="text-purple-600 flex-shrink-0" />
                                                                <span>{student.email}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        {student.mobileNumber ? (
                                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                                                                <Phone size={14} className="text-purple-600 flex-shrink-0" />
                                                                <span>{student.mobileNumber}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        {student.className ? (
                                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                                                                <Users size={14} className="text-purple-600 flex-shrink-0" />
                                                                <span>{student.className}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center justify-center gap-1.5 w-fit mx-auto">
                                                            <CheckCircle2 size={12} />
                                                            Submitted
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => {
                                                                if (student.userCode && assignmentCode) {
                                                                    const studentCode = encodeURIComponent(student.userCode);
                                                                    const encodedAssignmentCode = encodeURIComponent(assignmentCode);
                                                                    navigate(`/teacher/assignments/review/${encodedAssignmentCode}/${studentCode}`);
                                                                }
                                                            }}
                                                            className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 mx-auto"
                                                            title="View Assignment"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmittedStudents;
