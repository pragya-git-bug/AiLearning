// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { 
//     ArrowLeft, 
//     Loader2, 
//     XCircle, 
//     User, 
//     BookOpen, 
//     Calendar, 
//     FileText,
//     CheckCircle2,
//     Clock,
//     Mail,
//     Phone,
//     Users
// } from 'lucide-react';
// import { getStudentSubmission } from '../../../../../services/api';

// const ReviewAssignment = () => {
//     const { assignmentCode: assignmentCodeParam, studentCode: studentCodeParam } = useParams();
//     const navigate = useNavigate();
//     const [submissionData, setSubmissionData] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState('');

//     const assignmentCode = assignmentCodeParam ? decodeURIComponent(assignmentCodeParam) : '';
//     const studentCode = studentCodeParam ? decodeURIComponent(studentCodeParam) : '';

//     // Extract and format data based on API response structure
//     // Response structure: { success: true, message: "...", assignmentCode: "...", studentCode: "...", data: {...} }
//     // submissionData is the full API response, submissionData.data contains the assignment object
//     const assignmentInfo = useMemo(() => {
//         if (!submissionData?.data) return null;
//         // submissionData.data contains the assignment object with questions and studentSubmission
//         return submissionData.data;
//     }, [submissionData]);

//     const studentSubmission = useMemo(() => {
//         if (!assignmentInfo?.studentSubmission) return null;
//         return assignmentInfo.studentSubmission;
//     }, [assignmentInfo]);

//     const questions = useMemo(() => {
//         if (!assignmentInfo?.questions) {
//             console.log('No questions found in assignmentInfo');
//             return [];
//         }
        
//         // Convert questions object (q1, q2, etc.) to sorted array
//         // Questions can be in format: { q1: { questionNo: 1, ... }, q2: { questionNo: 2, ... } }
//         const questionsArray = Object.entries(assignmentInfo.questions)
//             .map(([key, question]) => {
//                 // Ensure questionNo is set (use from question object or infer from key)
//                 if (!question.questionNo && key.startsWith('q')) {
//                     const num = parseInt(key.substring(1));
//                     if (!isNaN(num)) {
//                         question.questionNo = num;
//                     }
//                 }
//                 return question;
//             })
//             .filter(q => q && q.questionNo !== undefined && q.questionNo !== null)
//             .sort((a, b) => {
//                 // Sort by questionNo, ensuring numeric comparison
//                 const aNo = typeof a.questionNo === 'number' ? a.questionNo : parseInt(a.questionNo);
//                 const bNo = typeof b.questionNo === 'number' ? b.questionNo : parseInt(b.questionNo);
//                 return aNo - bNo;
//             });
        
//         console.log('Questions extracted:', questionsArray);
//         return questionsArray;
//     }, [assignmentInfo]);

//     const answers = useMemo(() => {
//         if (!studentSubmission?.answers) {
//             console.log('No studentSubmission or answers found');
//             return {};
//         }
        
//         if (!Array.isArray(studentSubmission.answers)) {
//             console.warn('Answers is not an array:', studentSubmission.answers);
//             return {};
//         }
        
//         // Create a map of questionNo to answer for quick lookup
//         // Handle both numeric and string questionNo values
//         const answerMap = {};
//         studentSubmission.answers.forEach((answer, index) => {
//             if (!answer) {
//                 console.warn(`Null/undefined answer at index ${index}`);
//                 return;
//             }
            
//             // Normalize questionNo to number for consistent matching
//             let questionNo = answer.questionNo;
//             if (questionNo !== undefined && questionNo !== null) {
//                 // Convert to number if it's a string
//                 if (typeof questionNo === 'string') {
//                     questionNo = parseInt(questionNo);
//                 }
                
//                 if (!isNaN(questionNo)) {
//                     answerMap[questionNo] = answer;
//                     console.log(`Mapped answer for questionNo ${questionNo}:`, {
//                         questionNo: answer.questionNo,
//                         answer: answer.answer,
//                         rate: answer.rate
//                     });
//                 } else {
//                     console.warn(`Invalid questionNo at index ${index}:`, answer.questionNo);
//                 }
//             } else {
//                 console.warn(`Missing questionNo at index ${index}:`, answer);
//             }
//         });
        
//         console.log('Answer map created with keys:', Object.keys(answerMap));
//         console.log('Full answer map:', answerMap);
//         return answerMap;
//     }, [studentSubmission]);

//     // Format date
//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', { 
//             year: 'numeric', 
//             month: 'long', 
//             day: 'numeric' 
//         });
//     };

//     useEffect(() => {
//         const fetchSubmission = async () => {
//             if (!assignmentCode || !studentCode) {
//                 setError('Assignment code or student code not found');
//                 setIsLoading(false);
//                 return;
//             }

//             setIsLoading(true);
//             setError('');

//             try {
//                 const result = await getStudentSubmission(assignmentCode, studentCode);

//                 if (result.success && result.data) {
//                     // The API returns: { success: true, message: "...", assignmentCode: "...", studentCode: "...", data: {...} }
//                     // result.data contains the full API response object
//                     console.log('Full API response:', result.data);
                    
//                     // Check if the response has the expected structure
//                     if (result.data.success && result.data.data) {
//                         const assignmentData = result.data.data;
//                         console.log('=== API Response Structure ===');
//                         console.log('Full assignment data:', assignmentData);
//                         console.log('Questions object:', assignmentData.questions);
//                         console.log('Questions keys:', Object.keys(assignmentData.questions || {}));
//                         console.log('Student submission:', assignmentData.studentSubmission);
//                         console.log('Answers array:', assignmentData.studentSubmission?.answers);
//                         console.log('Answers count:', assignmentData.studentSubmission?.answers?.length);
                        
//                         // Log each question and its structure
//                         if (assignmentData.questions) {
//                             Object.entries(assignmentData.questions).forEach(([key, question]) => {
//                                 console.log(`Question ${key}:`, {
//                                     key,
//                                     questionNo: question.questionNo,
//                                     question: question.question,
//                                     difficulties: question.difficulties
//                                 });
//                             });
//                         }
                        
//                         // Log each answer and its structure
//                         if (assignmentData.studentSubmission?.answers) {
//                             assignmentData.studentSubmission.answers.forEach((answer, idx) => {
//                                 console.log(`Answer ${idx}:`, {
//                                     questionNo: answer.questionNo,
//                                     answer: answer.answer,
//                                     rate: answer.rate,
//                                     _id: answer._id
//                                 });
//                             });
//                         }
                        
//                         // Store the full response which includes the data object
//                         setSubmissionData(result.data);
//                     } else if (result.data.data) {
//                         // Sometimes the API might return data directly
//                         console.log('Assignment data (direct):', result.data.data);
//                         setSubmissionData(result.data);
//                     } else {
//                         console.error('Unexpected response structure:', result.data);
//                         setError(result.data.message || 'Failed to load submission data');
//                     }
//                 } else {
//                     setError(result.error || 'Failed to load submission');
//                 }
//             } catch (err) {
//                 setError(err.message || 'An error occurred while loading submission');
//                 console.error('Error fetching submission:', err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchSubmission();
//     }, [assignmentCode, studentCode]);

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//             <div className="max-w-6xl mx-auto">
//                 {/* Header Section */}
//                 <div className="mb-6">
//                     <button
//                         onClick={() => navigate(-1)}
//                         className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors"
//                     >
//                         <ArrowLeft size={20} strokeWidth={2} />
//                         <span className="font-medium">Back</span>
//                     </button>
                    
//                     <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
//                         <h1 className="text-3xl font-bold text-gray-900 mb-4">
//                             Review Assignment
//                         </h1>
//                         <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                             <p>
//                                 Assignment Code: <span className="font-mono font-semibold text-purple-600">{assignmentCode}</span>
//                             </p>
//                             <p>
//                                 Student Code: <span className="font-mono font-semibold text-purple-600">{studentCode}</span>
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Content Section */}
//                 <div className="space-y-6">
//                     {isLoading ? (
//                         <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
//                             <div className="flex flex-col items-center justify-center py-20">
//                                 <Loader2 className="animate-spin mb-4 text-purple-600" size={48} />
//                                 <p className="text-gray-600 text-lg">Loading submission...</p>
//                             </div>
//                         </div>
//                     ) : error ? (
//                         <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
//                             <div className="flex flex-col items-center justify-center py-20 text-red-400">
//                                 <XCircle size={64} className="mb-4 opacity-50" />
//                                 <p className="text-xl font-medium text-red-600 mb-4">{error}</p>
//                                 <button
//                                     onClick={() => window.location.reload()}
//                                     className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
//                                 >
//                                     Retry
//                                 </button>
//                             </div>
//                         </div>
//                     ) : assignmentInfo ? (
//                         <>
//                             {/* Student Information Card */}
//                             <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
//                                 <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//                                     <User className="text-purple-600" size={24} />
//                                     Student Information
//                                 </h2>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     <div className="flex items-center gap-3">
//                                         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
//                                             {studentCode?.charAt(0) || 'S'}
//                                         </div>
//                                         <div>
//                                             <p className="text-sm text-gray-500">Student Code</p>
//                                             <p className="font-semibold text-gray-900">{studentCode}</p>
//                                         </div>
//                                     </div>
//                                     {studentSubmission?.submissionDate && (
//                                         <div className="flex items-center gap-3">
//                                             <Clock className="text-purple-600" size={20} />
//                                             <div>
//                                                 <p className="text-sm text-gray-500">Submitted On</p>
//                                                 <p className="font-semibold text-gray-900">{formatDate(studentSubmission.submissionDate)}</p>
//                                             </div>
//                                         </div>
//                                     )}
//                                     {studentSubmission?.status && (
//                                         <div className="flex items-center gap-3">
//                                             <CheckCircle2 className="text-green-600" size={20} />
//                                             <div>
//                                                 <p className="text-sm text-gray-500">Status</p>
//                                                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                                                     studentSubmission.status === 'completed' 
//                                                         ? 'bg-green-100 text-green-700' 
//                                                         : 'bg-yellow-100 text-yellow-700'
//                                                 }`}>
//                                                     {studentSubmission.status}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Assignment Details Card */}
//                             <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
//                                 <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//                                     <FileText className="text-purple-600" size={24} />
//                                     Assignment Details
//                                 </h2>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                     <div className="flex items-start gap-3">
//                                         <BookOpen className="text-purple-600 mt-1" size={20} />
//                                         <div>
//                                             <p className="text-sm text-gray-500 mb-1">Assignment Name</p>
//                                             <p className="font-semibold text-gray-900">{assignmentInfo.assignmentName || 'N/A'}</p>
//                                         </div>
//                                     </div>
//                                     <div className="flex items-start gap-3">
//                                         <BookOpen className="text-purple-600 mt-1" size={20} />
//                                         <div>
//                                             <p className="text-sm text-gray-500 mb-1">Subject</p>
//                                             <p className="font-semibold text-gray-900 capitalize">{assignmentInfo.subject || 'N/A'}</p>
//                                         </div>
//                                     </div>
//                                     <div className="flex items-start gap-3">
//                                         <Calendar className="text-purple-600 mt-1" size={20} />
//                                         <div>
//                                             <p className="text-sm text-gray-500 mb-1">Due Date</p>
//                                             <p className="font-semibold text-gray-900">{formatDate(assignmentInfo.dueDate)}</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Questions and Answers Section */}
//                             <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
//                                 <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//                                     <FileText className="text-purple-600" size={24} />
//                                     Questions & Answers
//                                 </h2>
//                                 <div className="space-y-6">
//                                     {questions.length === 0 ? (
//                                         <div className="text-center py-8 text-gray-500">
//                                             <p>No questions found in this assignment</p>
//                                         </div>
//                                     ) : (
//                                         questions.map((question, index) => {
//                                             // Normalize questionNo for matching
//                                             const questionNo = typeof question.questionNo === 'number' 
//                                                 ? question.questionNo 
//                                                 : parseInt(question.questionNo);
                                            
//                                             // Get answer by questionNo (try both numeric and original format)
//                                             const answer = answers[questionNo] || answers[question.questionNo];
                                            
//                                             // Debug logging for each question-answer pair
//                                             console.log(`Question ${questionNo} (${question.questionNo}):`, {
//                                                 questionKey: `q${questionNo}`,
//                                                 questionText: question.question,
//                                                 foundAnswer: !!answer,
//                                                 answerData: answer,
//                                                 answerText: answer?.answer
//                                             });
                                            
//                                             // Check if answer exists and is a valid answer (not an error message)
//                                             const answerText = answer?.answer || '';
//                                             const normalizedAnswerText = typeof answerText === 'string' ? answerText.trim().toLowerCase() : '';
                                            
//                                             // Check for various error message patterns
//                                             const isErrorAnswer = answer && 
//                                                 answerText && 
//                                                 typeof answerText === 'string' &&
//                                                 (normalizedAnswerText.includes("assignment code not found") ||
//                                                  normalizedAnswerText.includes("please refresh the page") ||
//                                                  normalizedAnswerText === "assignment code not found. please refresh the page.");
                                            
//                                             const hasValidAnswer = answer && 
//                                                 answerText && 
//                                                 typeof answerText === 'string' &&
//                                                 answerText.trim() !== '' &&
//                                                 !isErrorAnswer;
                                            
//                                             return (
//                                                 <div
//                                                     key={question._id || `question-${questionNo}` || `question-${index}`}
//                                                     className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all duration-200"
//                                                 >
//                                                     <div className="flex items-start gap-4">
//                                                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
//                                                             {questionNo || index + 1}
//                                                         </div>
//                                                         <div className="flex-1">
//                                                             <div className="mb-3">
//                                                                 <div className="flex items-center gap-2 mb-2">
//                                                                     <span className="text-sm font-semibold text-gray-700">Question {questionNo || index + 1}</span>
//                                                                     {question.difficulties && (
//                                                                         <span className={`px-2 py-0.5 rounded text-xs font-medium ${
//                                                                             question.difficulties.toLowerCase() === 'easy' 
//                                                                                 ? 'bg-green-100 text-green-700'
//                                                                                 : question.difficulties.toLowerCase() === 'medium'
//                                                                                 ? 'bg-yellow-100 text-yellow-700'
//                                                                                 : 'bg-red-100 text-red-700'
//                                                                         }`}>
//                                                                             {question.difficulties}
//                                                                         </span>
//                                                                     )}
//                                                                 </div>
//                                                                 <p className="text-gray-900 font-medium leading-relaxed">
//                                                                     {question.question}
//                                                                 </p>
//                                                             </div>
                                                            
//                                                             <div className="mt-4 pt-4 border-t border-gray-200">
//                                                                 <div className="flex items-center gap-2 mb-2">
//                                                                     <CheckCircle2 className={`${hasValidAnswer ? 'text-green-600' : isErrorAnswer ? 'text-red-600' : 'text-gray-400'}`} size={18} />
//                                                                     <span className="text-sm font-semibold text-gray-700">Answer</span>
//                                                                     {answer?.rate !== undefined && answer.rate !== null && (
//                                                                         <span className="text-xs text-gray-500">(Rate: {answer.rate})</span>
//                                                                     )}
//                                                                 </div>
//                                                                 {hasValidAnswer ? (
//                                                                     <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                                                                         <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
//                                                                             {answer.answer}
//                                                                         </p>
//                                                                     </div>
//                                                                 ) : isErrorAnswer ? (
//                                                                     // Show error message in a warning box
//                                                                     <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
//                                                                         <div className="flex items-start gap-2">
//                                                                             <XCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={18} />
//                                                                             <div className="flex-1">
//                                                                                 <p className="text-orange-800 text-sm font-medium mb-1">
//                                                                                     Submission Error
//                                                                                 </p>
//                                                                                 <p className="text-orange-700 text-sm">
//                                                                                     The answer was not properly saved during submission. This may have occurred due to a technical issue when the student submitted this question.
//                                                                                 </p>
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>
//                                                                 ) : (
//                                                                     <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
//                                                                         <p className="text-yellow-800 text-sm italic">
//                                                                             No answer submitted for this question
//                                                                         </p>
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             );
//                                         })
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Submission Summary */}
//                             {studentSubmission && (
//                                 <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
//                                     <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//                                         <FileText className="text-purple-600" size={24} />
//                                         Submission Summary
//                                     </h2>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         {studentSubmission.overallScore !== null && (
//                                             <div>
//                                                 <p className="text-sm text-gray-500 mb-1">Overall Score</p>
//                                                 <p className="text-2xl font-bold text-purple-600">{studentSubmission.overallScore}</p>
//                                             </div>
//                                         )}
//                                         {studentSubmission.teacherComments && (
//                                             <div>
//                                                 <p className="text-sm text-gray-500 mb-1">Teacher Comments</p>
//                                                 <p className="text-gray-900">{studentSubmission.teacherComments}</p>
//                                             </div>
//                                         )}
//                                         {studentSubmission.summary && (
//                                             <div className="md:col-span-2">
//                                                 <p className="text-sm text-gray-500 mb-1">Summary</p>
//                                                 <p className="text-gray-900">{studentSubmission.summary}</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </>
//                     ) : (
//                         <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
//                             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
//                                 <p className="text-xl font-medium text-gray-600">No submission data found</p>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ReviewAssignment;


import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    FileText, 
    CheckCircle2, 
    Clock, 
    Award, 
    BookOpen,
    Calendar,
    Sparkles,
    Loader2,
    AlertCircle,
    MessageSquare,
    Shield,
    User,
    Bot,
    Target,
    Send,
    Trophy,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Home,
    ChevronRight
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import BASE_URL from '../../../../../http/Service';
import { getStudentSubmission } from '../../../../../services/api';

const StudentDashbord = () => {
    const { assignmentCode: assignmentCodeParam, studentCode: studentCodeParam } = useParams();
    const navigate = useNavigate();
    // const { currentUser } = useSelector((state) => state.userData);
    const [assignmentData, setAssignmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [aiReview, setAiReview] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [reviewModel, setReviewModel] = useState(null);
    const [questionsAccordionOpen, setQuestionsAccordionOpen] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

    // Get student code - you can modify this to get from URL params or props
    const getStudentCode = () => {
        return studentCodeParam;
    };

    // Get assignment code - you might want to get this from URL params or props
    const getAssignmentCode = () => {
        return assignmentCodeParam;
    };

    useEffect(() => {
        fetchAssignmentData();
    }, []);

    const fetchAssignmentData = async () => {
        setLoading(true);
        setError('');
        const assignmentCode = getAssignmentCode();
        const studentCode = getStudentCode();
        
        try {
            const result = await getStudentSubmission(assignmentCode, studentCode);

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch assignment data');
            }

            const data = result.data;
            setAssignmentData(data);
            
            // Check if review data already exists
            if (data?.data?.studentSubmission) {
                const submission = data.data.studentSubmission;
                const questions = data.data.questions || {};
                // Convert questions object to array, ensuring questionNo is set
                const questionsArray = Object.entries(questions).map(([key, question]) => {
                    // Ensure questionNo is set (extract from key if not present: q1 -> 1)
                    if (!question.questionNo && typeof key === 'string' && key.startsWith('q')) {
                        const num = parseInt(key.substring(1), 10);
                        if (!isNaN(num)) {
                            question.questionNo = num;
                        }
                    }
                    return question;
                }).sort((a, b) => (a.questionNo || 0) - (b.questionNo || 0));
                const totalQuestions = questionsArray.length || 7;
                const answers = submission.answers || [];
                
                const hasReviewData = submission.overallScore !== null || 
                                    submission.teacherComments || 
                                    submission.summary || 
                                    (submission.needPractice && submission.needPractice.length > 0) ||
                                    (submission.topicUnderCovered && submission.topicUnderCovered.length > 0) ||
                                    (submission.resources && submission.resources.length > 0);
                
                if (hasReviewData) {
                    // Generate questionRatings from answers
                    let questionRatings = {};
                    const answerFeedback = [];
                    
                    // Generate answerFeedback for all questions, matching by questionNo
                    questionsArray.forEach(question => {
                        // Match answer by questionNo
                        const answer = answers.find(a => a.questionNo === question.questionNo);
                        const qKey = `q${question.questionNo}`;
                        const rate = answer?.rate !== undefined ? answer.rate : 0;
                        questionRatings[qKey] = rate;
                        
                        // Generate answer feedback based on rate
                        const status = getStatusFromRating(rate);
                        const answerText = answer?.answer || 'No answer provided';
                        let feedbackText = '';
                        
                        if (rate === 0 && !answer) {
                            feedbackText = 'No answer was provided for this question.';
                        } else if (rate >= 9) {
                            feedbackText = `The student correctly answered this question (${rate}/10). The answer demonstrates good understanding of the concept.`;
                        } else if (rate >= 4) {
                            feedbackText = `The student provided a partially correct answer (${rate}/10). The answer shows some understanding but needs improvement in certain areas.`;
                        } else {
                            feedbackText = `The student's answer is incorrect (${rate}/10). The answer needs significant improvement and demonstrates a lack of understanding.`;
                        }
                        
                        answerFeedback.push({
                            questionNo: question.questionNo,
                            status: status,
                            feedback: feedbackText,
                            rating: rate
                        });
                    });
                    
                    // Convert existing review data to aiReview format
                    const existingReview = {
                        overallScore: submission.overallScore !== null 
                            ? `${submission.overallScore}/${totalQuestions}` 
                            : `0/${totalQuestions}`,
                        originalityCheck: {
                            plagiarismRisk: 'Low',
                            aiGenerated: 'Unlikely',
                            explanation: 'Review data already exists from previous submission.'
                        },
                        answerFeedback: answerFeedback,
                        topicsUnderstood: submission.topicUnderCovered || [],
                        needsPractice: submission.needPractice || [],
                        summary: submission.summary || submission.teacherComments || '',
                        questionRatings: questionRatings
                    };
                    
                    setAiReview(existingReview);
                    setShowReview(true);
                    
                    // Set review model from existing data
                    const reviewModelData = {
                        assignmentCode: data.data.assignmentCode,
                        studentCode: data.studentCode,
                        overallScore: submission.overallScore || 0,
                        teacherComments: submission.teacherComments || '',
                        summary: submission.summary || '',
                        needPractice: submission.needPractice || [],
                        topicUnderCovered: submission.topicUnderCovered || [],
                        questionRatings: questionRatings,
                        resources: submission.resources || []
                    };
                    setReviewModel(reviewModelData);
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to load assignment data');
            console.error('Error fetching assignment:', err);
        } finally {
            setLoading(false);
        }
    };

    const matchAnswerToQuestion = (questionNo, answers) => {
        return answers.find(ans => ans.questionNo === questionNo);
    };

    const generateAIReview = async () => {
        if (!assignmentData?.data) return;

        setLoadingAI(true);
        const { questions, studentSubmission } = assignmentData.data;
        const answers = studentSubmission?.answers || [];

        // Convert questions object to array, ensuring questionNo is set from keys if needed
        const questionsArray = Object.entries(questions || {}).map(([key, q]) => {
            // If questionNo is not set, extract it from key (q1 -> 1)
            if (!q.questionNo && typeof key === 'string' && key.startsWith('q')) {
                const num = parseInt(key.substring(1), 10);
                if (!isNaN(num)) {
                    q.questionNo = num;
                }
            }
            return q;
        });
        
        // Match questions with answers by questionNo
        const qaPairs = questionsArray.map(q => {
            const answer = answers.find(a => a.questionNo === q.questionNo);
            return {
                questionNo: q.questionNo,
                question: q.question,
                difficulty: q.difficulties,
                answer: answer?.answer || 'No answer provided',
                rate: answer?.rate || 0
            };
        });

        const prompt = `You are an educational AI assistant reviewing a student's assignment. Analyze the following questions and answers, then provide:

1. Overall Score (out of total questions, e.g., "6/7")
2. Originality Check:
   - Plagiarism Risk: Low/Medium/High
   - AI Generated: Likely/Unlikely
   - Brief explanation
3. Answer Feedback: For each question, provide:
   - Status: "Correct", "Partially Correct", or "Incorrect"
   - Detailed feedback explaining why
4. Topics Understood: List topics the student demonstrated understanding of
5. Needs Practice: List topics that need more practice
6. Summary: A brief overall summary of the student's performance

Questions and Answers:
${qaPairs.map(qa => `
Question ${qa.questionNo}: ${qa.question}
Difficulty: ${qa.difficulty}
Student Answer: ${qa.answer}
Current Rate: ${qa.rate}/10
`).join('\n')}

Provide the response in JSON format with this structure:
{
  "overallScore": "6/7",
  "originalityCheck": {
    "plagiarismRisk": "Low",
    "aiGenerated": "Unlikely",
    "explanation": "..."
  },
  "answerFeedback": [
    {
      "questionNo": 1,
      "status": "Correct",
      "feedback": "...",
      "rating": 9
    }
  ],
  "questionRatings": {
    "q1": 9,
    "q2": 7
  },
  "topicsUnderstood": ["Topic1", "Topic2"],
  "needsPractice": ["Topic3"],
  "summary": "..."
}

For each question, provide a rating from 0-10 where:
- 0-3: Incorrect
- 4-8: Partially Correct
- 9-10: Correct

The questionRatings object should map question numbers to ratings (e.g., "q1": 9, "q2": 7).`;

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
                            content: 'You are an educational AI assistant that provides detailed, constructive feedback on student assignments.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    
                    // Generate questionRatings from answerFeedback if not provided
                    let questionRatings = parsed.questionRatings || {};
                    if (!parsed.questionRatings && parsed.answerFeedback) {
                        parsed.answerFeedback.forEach(feedback => {
                            const rating = feedback.rating !== undefined ? feedback.rating : getRatingFromStatus(feedback.status);
                            questionRatings[`q${feedback.questionNo}`] = rating;
                        });
                    }
                    
                    // Update answerFeedback with ratings if missing
                    if (parsed.answerFeedback) {
                        parsed.answerFeedback = parsed.answerFeedback.map(feedback => {
                            if (feedback.rating === undefined) {
                                const qKey = `q${feedback.questionNo}`;
                                feedback.rating = questionRatings[qKey] || getRatingFromStatus(feedback.status);
                            }
                            return feedback;
                        });
                    }
                    
                    setAiReview(parsed);
                    
                    // Generate review model
                    const reviewModelData = {
                        assignmentCode: assignmentData.data.assignmentCode,
                        studentCode: assignmentData.studentCode,
                        overallScore: calculateOverallScore(parsed.overallScore),
                        teacherComments: generateTeacherComments(parsed),
                        summary: parsed.summary || '',
                        needPractice: parsed.needsPractice || [],
                        topicUnderCovered: parsed.topicsUnderstood || [],
                        questionRatings: questionRatings,
                        resources: generateResources(parsed.needsPractice || [])
                    };
                    setReviewModel(reviewModelData);
                    setShowReview(true);
                } else {
                    throw new Error('Invalid AI response format');
                }
            } catch (parseError) {
                console.error('Error parsing AI response:', parseError);
                setError('Failed to parse AI review. Please try again.');
            }
        } catch (err) {
            console.error('Error generating AI review:', err);
            setError('Failed to generate AI review. Please try again.');
        } finally {
            setLoadingAI(false);
        }
    };

    const calculateOverallScore = (scoreString) => {
        if (!scoreString) return 0;
        const match = scoreString.match(/(\d+)\/(\d+)/);
        if (match) {
            const [numerator, denominator] = match.slice(1).map(Number);
            return Math.round((numerator / denominator) * 100);
        }
        return 0;
    };

    const generateTeacherComments = (aiReview) => {
        if (!aiReview) return '';
        const score = aiReview.overallScore || 'N/A';
        const summary = aiReview.summary || '';
        return `Overall Score: ${score}. ${summary}`;
    };

    const generateResources = (needsPractice) => {
        if (!needsPractice || needsPractice.length === 0) return [];
        return needsPractice.map(topic => ({
            type: 'pdf',
            link: `http://example.com/resources/${topic.toLowerCase().replace(/\s+/g, '_')}.pdf`
        }));
    };

    const getRatingFromStatus = (status) => {
        if (!status) return 0;
        const statusLower = status.toLowerCase();
        if (statusLower.includes('correct') && !statusLower.includes('partially') && !statusLower.includes('incorrect')) {
            return 9; // Correct
        } else if (statusLower.includes('partially')) {
            return 6; // Partially Correct
        } else {
            return 2; // Incorrect
        }
    };

    const getStatusFromRating = (rating) => {
        if (rating >= 9) return 'Correct';
        if (rating >= 4) return 'Partially Correct';
        return 'Incorrect';
    };

    const handleSubmitReview = async () => {
        if (!reviewModel) return;

        setSubmittingReview(true);
        setSubmitError('');
        setSubmitSuccess(false);

        try {
            const response = await fetch(`${BASE_URL}/api/assignments/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify(reviewModel)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSubmitSuccess(true);
            console.log('Review submitted successfully:', data);
            
            // Reset success message after 3 seconds
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 3000);
        } catch (err) {
            console.error('Error submitting review:', err);
            setSubmitError(err.message || 'Failed to submit review. Please try again.');
            setTimeout(() => {
                setSubmitError('');
            }, 5000);
        } finally {
            setSubmittingReview(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Correct':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'Partially Correct':
                return <AlertTriangle className="text-yellow-600" size={20} />;
            case 'Incorrect':
                return <XCircle className="text-red-600" size={20} />;
            default:
                return <AlertCircle className="text-gray-600" size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Correct':
                return 'bg-green-50 border-green-200';
            case 'Partially Correct':
                return 'bg-yellow-50 border-yellow-200';
            case 'Incorrect':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 text-lg">Loading assignment...</p>
                </div>
            </div>
        );
    }

    if (error && !assignmentData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchAssignmentData}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!assignmentData?.data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <p className="text-gray-600 text-lg">No assignment data available</p>
            </div>
        );
    }

    const { data } = assignmentData;
    const { questions, studentSubmission } = data;
    
    // Convert questions object to array, ensuring questionNo is properly set
    // Questions come as { q1: {...}, q2: {...} } and each has questionNo property
    const questionsArray = Object.entries(questions || {}).map(([key, question]) => {
        // Ensure questionNo is set (extract from key if not present: q1 -> 1)
        if (!question.questionNo && typeof key === 'string' && key.startsWith('q')) {
            const num = parseInt(key.substring(1), 10);
            if (!isNaN(num)) {
                question.questionNo = num;
            }
        }
        return question;
    }).sort((a, b) => (a.questionNo || 0) - (b.questionNo || 0)); // Sort by questionNo
    
    const answers = studentSubmission?.answers || [];
    
    // Check if review already exists
    const hasExistingReview = studentSubmission?.overallScore !== null || 
                             studentSubmission?.teacherComments || 
                             studentSubmission?.summary || 
                             (studentSubmission?.needPractice && studentSubmission.needPractice.length > 0) ||
                             (studentSubmission?.topicUnderCovered && studentSubmission.topicUnderCovered.length > 0) ||
                             (studentSubmission?.resources && studentSubmission.resources.length > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-10">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="px-6 py-5">
                    <div className="flex items-center">
                        {/* Title on Left */}
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900">
                                {data.assignmentName || 'Review Assignment'}
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
                                Review Assignment
                            </span>
                        </nav>
                    </div>
                </div>

                {/* Questions and Answers Section - Accordion */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                        onClick={() => setQuestionsAccordionOpen(!questionsAccordionOpen)}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="text-purple-600" size={24} />
                            Questions & Answers
                        </h2>
                        {questionsAccordionOpen ? (
                            <ChevronUp className="text-gray-600" size={24} />
                        ) : (
                            <ChevronDown className="text-gray-600" size={24} />
                        )}
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        questionsAccordionOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="px-6 pb-6 space-y-6">
                            {questionsArray.map((question) => {
                                // Match answer by questionNo
                                const answer = answers.find(a => a.questionNo === question.questionNo);
                                return (
                                    <div key={question._id || `q${question.questionNo}`} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                Q{question.questionNo}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                                                        {question.difficulties}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                    {question.question}
                                                </h3>
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                                                    <p className="text-gray-900">
                                                        {answer?.answer || 'No answer provided'}
                                                    </p>
                                                    {answer?.rate !== undefined && (
                                                        <div className="mt-2">
                                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                                answer.rate >= 7 ? 'bg-green-100 text-green-700' :
                                                                answer.rate >= 4 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                                Rate: {answer.rate}/10
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Review By AI Button or Heading */}
                {!showReview ? (
                    <div className="flex justify-center">
                        <button
                            onClick={generateAIReview}
                            disabled={loadingAI}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingAI ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Generating Review...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Review By AI
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100  p-6 ">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="text-purple-600" size={28} />
                            Review Assignment by AI
                        </h2>
                    </div>
                )}

                {/* AI Review Section */}
                {(showReview || hasExistingReview) && aiReview && (
                    <div className="space-y-6">
                        {/* AI Feedback Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageSquare className="text-purple-600" size={24} />
                                    <h3 className="text-xl font-bold text-gray-900">AI Feedback</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="text-purple-600" size={32} />
                                        <div>
                                            <p className="text-sm text-gray-600">Overall Score</p>
                                            <p className="text-2xl font-bold text-gray-900">{aiReview.overallScore || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Shield className="text-blue-600" size={20} />
                                            <span className="font-semibold text-gray-900">Originality Check</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <User className="text-gray-600" size={16} />
                                                <span className="text-sm text-gray-700">
                                                    <span className="font-medium">Plagiarism Risk:</span>{' '}
                                                    <span className={`font-semibold ${
                                                        aiReview.originalityCheck?.plagiarismRisk === 'Low' ? 'text-green-600' :
                                                        aiReview.originalityCheck?.plagiarismRisk === 'Medium' ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                        {aiReview.originalityCheck?.plagiarismRisk || 'N/A'}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Bot className="text-gray-600" size={16} />
                                                <span className="text-sm text-gray-700">
                                                    <span className="font-medium">AI Generated:</span>{' '}
                                                    <span className={`font-semibold ${
                                                        aiReview.originalityCheck?.aiGenerated === 'Unlikely' ? 'text-green-600' :
                                                        'text-yellow-600'
                                                    }`}>
                                                        {aiReview.originalityCheck?.aiGenerated || 'N/A'}
                                                    </span>
                                                </span>
                                            </div>
                                            {aiReview.originalityCheck?.explanation && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    {aiReview.originalityCheck.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Answer Feedback */}
                            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="text-purple-600" size={24} />
                                    <h3 className="text-xl font-bold text-gray-900">Answer Feedback</h3>
                                </div>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {aiReview.answerFeedback?.map((feedback, idx) => {
                                        const rating = feedback.rating !== undefined ? feedback.rating : 
                                                      (aiReview.questionRatings?.[`q${feedback.questionNo}`] || getRatingFromStatus(feedback.status));
                                        const status = getStatusFromRating(rating);
                                        return (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-lg border ${getStatusColor(status)}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {getStatusIcon(status)}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900">
                                                                Question {feedback.questionNo}
                                                            </span>
                                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                                status === 'Correct' ? 'bg-green-200 text-green-800' :
                                                                status === 'Partially Correct' ? 'bg-yellow-200 text-yellow-800' :
                                                                'bg-red-200 text-red-800'
                                                            }`}>
                                                                {status}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                (Rating: {rating}/10)
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{feedback.feedback}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Topics Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Topics Understood */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle className="text-green-600" size={24} />
                                    <h3 className="text-xl font-bold text-gray-900">Topics Understood</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {aiReview.topicsUnderstood?.map((topic, idx) => (
                                        <span
                                            key={idx}
                                            className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                    {(!aiReview.topicsUnderstood || aiReview.topicsUnderstood.length === 0) && (
                                        <p className="text-gray-500 text-sm">No topics identified</p>
                                    )}
                                </div>
                            </div>

                            {/* Needs Practice */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <Target className="text-orange-600" size={24} />
                                    <h3 className="text-xl font-bold text-gray-900">Needs Practice</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {aiReview.needsPractice?.map((topic, idx) => (
                                        <span
                                            key={idx}
                                            className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                    {(!aiReview.needsPractice || aiReview.needsPractice.length === 0) && (
                                        <p className="text-gray-500 text-sm">No topics need practice</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-8 bg-blue-600 rounded"></div>
                                <h3 className="text-xl font-bold text-gray-900">Summary</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{aiReview.summary || 'No summary available'}</p>
                        </div>

                        {/* Teacher Comment Section */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Teacher Comment</h3>
                            <p className="text-gray-500">
                                {studentSubmission?.teacherComments || 'No teacher comment yet'}
                            </p>
                        </div>

                        {/* Submit Review Button */}
                        <div className="space-y-4">
                            {/* Success Message */}
                            {submitSuccess && (
                                <div className="bg-green-50 border border-green-200 p-4 flex items-center gap-3">
                                    <CheckCircle className="text-green-600" size={24} />
                                    <div>
                                        <p className="text-green-800 font-semibold">Review submitted successfully!</p>
                                        <p className="text-green-600 text-sm">Your review has been saved.</p>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {submitError && (
                                <div className="bg-red-50 border border-red-200  p-4 flex items-center gap-3">
                                    <AlertCircle className="text-red-600" size={24} />
                                    <div>
                                        <p className="text-red-800 font-semibold">Failed to submit review</p>
                                        <p className="text-red-600 text-sm">{submitError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submittingReview || !reviewModel}
                                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingReview ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Submit Review
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashbord;

