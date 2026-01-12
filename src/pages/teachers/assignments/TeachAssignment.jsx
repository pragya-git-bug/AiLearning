import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  Home,
} from "lucide-react";
import { getAssignmentsByTeacher, getSubmittedStudents } from "../../../services/api";

const TeachAssignment = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.userData);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typingText, setTypingText] = useState("");
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [submissionCounts, setSubmissionCounts] = useState({});

  const subjects = [
    "English",
    "Hindi",
    "Mathematics",
    "Science",
    "Social Studies",
  ];
  const baseText = "Create the assignment of ";

  // Fetch assignments from API
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!currentUser?.userCode) {
        setError("Teacher code not found. Please login again.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const result = await getAssignmentsByTeacher(currentUser.userCode);

        if (result.success && result.data.success) {
          // Map API response to component format
          const mappedAssignments = result.data.data.map((assignment) => {
            // Convert questions object to array format
            const questionsArray = assignment.questions
              ? Object.values(assignment.questions).map((q, index) => ({
                  id: index + 1,
                  question: q.question,
                  questionNo: q.questionNo,
                  difficulty: q.difficulties?.toLowerCase() || "medium",
                  difficulties: q.difficulties,
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
            };
          });

          setAssignments(mappedAssignments);

          // Fetch submission counts for each assignment
          const counts = {};
          const countPromises = mappedAssignments.map(async (assignment) => {
            if (assignment.assignmentCode) {
              try {
                const submissionResult = await getSubmittedStudents(
                  assignment.assignmentCode
                );
                if (
                  submissionResult.success &&
                  submissionResult.data.success
                ) {
                  const students =
                    submissionResult.data.data?.students ||
                    submissionResult.data.data ||
                    [];
                  counts[assignment.assignmentCode] = Array.isArray(students)
                    ? students.length
                    : 0;
                } else {
                  counts[assignment.assignmentCode] = 0;
                }
              } catch (err) {
                console.error(
                  `Error fetching submissions for ${assignment.assignmentCode}:`,
                  err
                );
                counts[assignment.assignmentCode] = 0;
              }
            } else {
              counts[assignment.assignmentCode] = 0;
            }
          });

          await Promise.all(countPromises);
          setSubmissionCounts(counts);
        } else {
          setError(result.error || "Failed to load assignments");
          setAssignments([]);
        }
      } catch (err) {
        setError(err.message || "An error occurred while loading assignments");
        setAssignments([]);
        console.error("Error fetching assignments:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
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
        // Typing phase
        setTypingText(fullText.substring(0, currentCharIndex));
        currentCharIndex++;
        timeoutId = setTimeout(animate, 100);
      } else if (!isDeleting && currentCharIndex > fullText.length) {
        // Wait before deleting
        waitTime++;
        if (waitTime < 20) {
          // Wait for 2 seconds (20 * 100ms)
          timeoutId = setTimeout(animate, 100);
        } else {
          isDeleting = true;
          waitTime = 0;
          timeoutId = setTimeout(animate, 50);
        }
      } else if (isDeleting && currentCharIndex > baseText.length) {
        // Deleting phase
        currentCharIndex--;
        setTypingText(fullText.substring(0, currentCharIndex));
        timeoutId = setTimeout(animate, 50);
      } else {
        // Move to next subject
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

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.assignmentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssignments = filteredAssignments.slice(
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

  const getSubmissionBadge = (count) => {
    // Color coding based on submission count
    let bgColor, textColor;
    if (count === 0) {
      bgColor = "bg-red-100";
      textColor = "text-red-700";
    } else if (count < 5) {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-700";
    } else if (count < 10) {
      bgColor = "bg-blue-100";
      textColor = "text-blue-700";
    } else {
      bgColor = "bg-green-100";
      textColor = "text-green-700";
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}
      >
        <Users size={14} />
        {count} {count === 1 ? "Student" : "Students"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && statusFilter !== "completed";
  };

  const handleViewSubmissions = (assignment) => {
    if (!assignment.assignmentCode) {
      alert("Assignment code not found. Cannot view submissions.");
      return;
    }

    // Navigate to submissions page with assignmentCode and assignmentName
    const assignmentName = encodeURIComponent(assignment.assignmentName || "");
    navigate(
      `/teacher/assignments/submissions/${assignment.assignmentCode}/${assignmentName}`
    );
  };

  const handleViewAssignment = (assignment) => {
    // Navigate to view assignment details
    // You can implement this based on your routing structure
    console.log("View assignment:", assignment);
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
                Assignments
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
                  Assignments
                </span>
              </nav>
            </div>
            
            {/* Create Assignment Button on Right */}
            <button
              onClick={() => navigate("/teacher/assignments/create")}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <Plus size={20} />
              Create Assignment
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
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search assignments by name, subject, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-150 pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all text-gray-900"
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
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="text-xl font-medium">Loading assignments...</p>
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
          ) : filteredAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText size={64} className="mb-4 opacity-50" />
              <p className="text-xl font-medium">No assignments found</p>
              <p className="text-sm mt-2">
                Create your first assignment to get started
              </p>
              <button
                onClick={() => navigate("/teacher/assignments/create")}
                className="mt-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <Plus size={20} />
                Create Assignment
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
                      Assignment Name
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
                      Submissions
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAssignments.map((assignment, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 transition-colors ${
                        isOverdue(assignment.dueDate) ? "bg-red-50/50" : ""
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
                            {assignment.assignmentName}
                          </div>
                          {assignment.summury && (
                            <div className="text-xs text-gray-500 mt-1">
                              {assignment.summury.substring(0, 40)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-purple-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {assignment.subject}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-indigo-600" />
                          <span className="text-sm text-gray-700">
                            {assignment.assignedTo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-600" />
                          <span
                            className={`text-sm font-medium ${
                              isOverdue(assignment.dueDate)
                                ? "text-red-600"
                                : "text-gray-700"
                            }`}
                          >
                            {formatDate(assignment.dueDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {assignment.questionsCount ||
                            assignment.questions?.length ||
                            0}{" "}
                          Questions
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSubmissionBadge(
                          submissionCounts[assignment.assignmentCode] || 0
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewAssignment(assignment)}
                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600"
                            title="View Assignment"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleViewSubmissions(assignment)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                            title="View Submissions"
                          >
                            <Users size={16} />
                            <span>Submissions</span>
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
          {!isLoading && !error && filteredAssignments.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredAssignments.length)} of{" "}
                  {filteredAssignments.length} assignments
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

export default TeachAssignment;
