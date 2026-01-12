import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FileText, 
    Calendar, 
    BookOpen, 
    ArrowLeft,
    Upload,
    Send,
    CheckCircle2,
    File,
    ChevronDown,
    ChevronUp,
    Loader2,
    XCircle,
    ExternalLink,
    Star,
    MessageSquare
} from 'lucide-react';
import { submitAssignment, getAssignmentByCode } from '../../../services/api';

const AttemptAssignments = () => {
    const navigate = useNavigate();
    const { assignmentCode: assignmentCodeParam, assignmentName: assignmentNameParam } = useParams();
    const { currentUser } = useSelector((state) => state.userData);
    
    const assignmentCode = assignmentCodeParam ? decodeURIComponent(assignmentCodeParam) : '';
    const assignmentName = assignmentNameParam ? decodeURIComponent(assignmentNameParam) : '';
    
    const [assignment, setAssignment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [openAccordion, setOpenAccordion] = useState(null);
    const [attemptingQuestion, setAttemptingQuestion] = useState(null);
    const [submittedQuestions, setSubmittedQuestions] = useState(new Set());
    const [isAssignmentSubmitted, setIsAssignmentSubmitted] = useState(false);
    const [submittedAccordionOpen, setSubmittedAccordionOpen] = useState(false);
    const [questionSubmittedAccordionOpen, setQuestionSubmittedAccordionOpen] = useState({});
    const [answers, setAnswers] = useState({});
    const [attachments, setAttachments] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingQuestion, setSubmittingQuestion] = useState(null);
    const [handwrittenFile, setHandwrittenFile] = useState(null);
    const [isProcessingHandwritten, setIsProcessingHandwritten] = useState(false);

    useEffect(() => {
        const fetchAssignment = async () => {
            if (!assignmentCode) {
                setError('Assignment code not found in URL');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const result = await getAssignmentByCode(assignmentCode);

                if (result.success) {
                    const assignmentData = result.data?.data || result.data;
                    
                    // Convert questions object to array format
                    const questionsArray = assignmentData.questions 
                        ? Object.values(assignmentData.questions).map((q, index) => ({
                            id: index + 1,
                            question: q.question,
                            questionNo: q.questionNo,
                            difficulty: q.difficulties?.toLowerCase() || 'medium',
                            difficulties: q.difficulties,
                            _id: q._id
                        }))
                        : [];

                    // Get student's submission if exists
                    const studentSubmission = currentUser?.userCode && assignmentData.submissions?.[currentUser.userCode];
                    const submissionStatus = studentSubmission?.status || 'pending';
                    const isReviewed = submissionStatus === 'reviewed';

                    const mappedAssignment = {
                        _id: assignmentData._id,
                        assignmentName: assignmentData.assignmentName,
                        subject: assignmentData.subject,
                        dueDate: assignmentData.dueDate,
                        status: assignmentData.status,
                        assignedTo: assignmentData.assignedTo,
                        teacherCode: assignmentData.teacherCode,
                        assignmentCode: assignmentData.assignmentCode,
                        questions: questionsArray,
                        questionsCount: questionsArray.length,
                        submissions: assignmentData.submissions || {},
                        studentSubmission: studentSubmission || null,
                        submissionStatus: submissionStatus,
                        isReviewed: isReviewed,
                        createdAt: assignmentData.createdAt,
                        updatedAt: assignmentData.updatedAt
                    };

                    setAssignment(mappedAssignment);
                    
                    // Check if assignment is already submitted
                    if (studentSubmission) {
                        setIsAssignmentSubmitted(true);
                        
                        // Pre-fill answers from submission if reviewed
                        if (isReviewed && studentSubmission.answers) {
                            const submittedAnswers = {};
                            studentSubmission.answers.forEach(answer => {
                                const question = questionsArray.find(q => q.questionNo === answer.questionNo);
                                if (question) {
                                    submittedAnswers[question.id] = answer.answer;
                                }
                            });
                            setAnswers(submittedAnswers);
                            
                            // Mark all questions as submitted
                            const submittedIds = new Set(questionsArray.map(q => q.id));
                            setSubmittedQuestions(submittedIds);
                        }
                    }
                } else {
                    setError(result.error || 'Failed to load assignment');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while loading assignment');
                console.error('Error fetching assignment:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssignment();
    }, [assignmentCode]);

    const handleAttemptQuestion = (questionId) => {
        // Toggle accordion open/close when attempting
        if (attemptingQuestion === questionId) {
            setAttemptingQuestion(null);
            setOpenAccordion(null);
        } else {
            setAttemptingQuestion(questionId);
            setOpenAccordion(questionId);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleFileChange = (questionId, file) => {
        setAttachments(prev => ({
            ...prev,
            [questionId]: file
        }));
    };

    const handleSubmitQuestion = async (questionId) => {
        // Check if question has answer or attachment
        const hasAnswer = answers[questionId] && answers[questionId].trim().length > 0;
        const hasAttachment = attachments[questionId];
        
        if (!hasAnswer && !hasAttachment) {
            alert('Please provide either a text answer or attach a document before submitting this question.');
            return;
        }

        setSubmittingQuestion(questionId);

        try {
            // Simulate API call for individual question submission
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mark question as submitted
            setSubmittedQuestions(prev => new Set([...prev, questionId]));
            // Close attempt section
            setAttemptingQuestion(null);
            setOpenAccordion(null);
        } catch (error) {
            console.error('Error submitting question:', error);
            alert('Failed to submit question. Please try again.');
        } finally {
            setSubmittingQuestion(null);
        }
    };

    const toggleQuestionSubmittedAccordion = (questionId) => {
        setQuestionSubmittedAccordionOpen(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    // Check if all questions are submitted
    const allQuestionsSubmitted = assignment && assignment.questions && 
        assignment.questions.length > 0 &&
        assignment.questions.every(q => submittedQuestions.has(q.id));

    const handleSubmitAssignment = async () => {
        // Validate that all questions are submitted
        if (!allQuestionsSubmitted) {
            alert('Please submit all questions before submitting the assignment.');
            return;
        }

        // Validate required data - use assignmentCode from URL params
        if (!assignmentCode) {
            alert('Assignment code not found. Please refresh the page.');
            return;
        }

        // Also ensure assignment object has assignmentCode
        if (!assignment?.assignmentCode) {
            alert('Assignment code not found. Please refresh the page.');
            return;
        }

        if (!currentUser?.userCode) {
            alert('Student code not found. Please login again.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Format answers array from submitted questions
            const answersArray = assignment.questions
                .filter(q => submittedQuestions.has(q.id))
                .map(q => {
                    const answerText = answers[q.id] || '';
                    const attachmentName = attachments[q.id]?.name || '';
                    
                    // Combine text answer and attachment info
                    let answer = answerText;
                    if (attachmentName) {
                        answer = answerText 
                            ? `${answerText}\n[Attached file: ${attachmentName}]`
                            : `[Attached file: ${attachmentName}]`;
                    }

                    return {
                        questionNo: q.questionNo || q.id,
                        answer: answer || '[No answer provided]',
                        rate: 0 // Keep rate as 0 for now
                    };
                });

            // Prepare submission data - use assignmentCode from assignment object or URL params
            const submissionData = {
                assignmentCode: assignment.assignmentCode || assignmentCode,
                studentCode: currentUser.userCode,
                answers: answersArray
            };

            // Call API to submit assignment
            const result = await submitAssignment(submissionData);

            if (result.success) {
                setIsAssignmentSubmitted(true);
                setAttemptingQuestion(null);
                setOpenAccordion(null);
                
                // Show success message
                alert('Assignment submitted successfully!');
                
                // Optionally navigate back to assignments list after a delay
                setTimeout(() => {
                    navigate('/student/assignments');
                }, 2000);
            } else {
                alert(result.error || 'Failed to submit assignment. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            alert(error.message || 'Failed to submit assignment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSubmittedAccordion = () => {
        setSubmittedAccordionOpen(prev => !prev);
    };

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // Extract text from image/PDF using OpenAI Vision API
    const extractTextFromFile = async (file) => {
        try {
            const fileType = file.type;
            const isImage = fileType.startsWith('image/');
            const isPDF = fileType === 'application/pdf';
            const isExcel = fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                          fileType === 'application/vnd.ms-excel';
            
            // For Excel files, show a message that they need to be converted to PDF or image first
            if (isExcel) {
                throw new Error('Excel files are not directly supported. Please convert your Excel file to PDF or image format first.');
            }
            
            if (!isImage && !isPDF) {
                throw new Error('Unsupported file type. Please upload PNG, JPEG, JPG, or PDF.');
            }

            const base64 = await fileToBase64(file);
            const base64Data = base64.split(',')[1]; // Remove data:image/png;base64, prefix
            const mimeType = fileType;

            // Build question list for context
            const questionsList = assignment.questions?.map((q, idx) => 
                `Q${q.questionNo || idx + 1}: ${q.question}`
            ).join('\n') || '';

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: `Extract all text content from this ${isImage ? 'image' : 'PDF'} of a handwritten assignment. 

The assignment contains the following questions:
${questionsList}

Please extract the text and identify which answers correspond to which questions. Format your response as:
Q1: [answer for question 1]
Q2: [answer for question 2]
etc.

If you find an answer for a question, include it. If not, write "NOT FOUND" for that question. Preserve the exact text from the handwritten document.`
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:${mimeType};base64,${base64Data}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 4096
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to extract text from file');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error extracting text:', error);
            throw error;
        }
    };

    // Parse extracted text and match with questions
    const parseAnswersFromText = (extractedText, questions) => {
        const parsedAnswers = {};
        
        // First, try to parse the structured format from AI (Q1: answer, Q2: answer, etc.)
        questions.forEach(question => {
            const questionNo = question.questionNo || question.id;
            
            // Look for structured format: Q1: answer, Q1: answer, etc.
            const structuredPattern = new RegExp(`Q${questionNo}\\s*:\\s*([\\s\\S]*?)(?=Q\\d+\\s*:|NOT FOUND|$)`, 'i');
            let match = extractedText.match(structuredPattern);
            
            if (match && match[1]) {
                let answer = match[1].trim();
                // Remove "NOT FOUND" if present
                if (answer.toUpperCase().includes('NOT FOUND')) {
                    return; // Skip this question
                }
                // Clean up the answer
                answer = answer.replace(/^(Answer|Ans|A\.|Solution)[\s:]*/i, '').trim();
                if (answer.length > 3 && !answer.toUpperCase().includes('NOT FOUND')) {
                    parsedAnswers[question.id] = answer;
                    return;
                }
            }
            
            // Fallback: Try other patterns
            const patterns = [
                new RegExp(`(?:Question|Q|Q\\.|Q\\s*${questionNo}|${questionNo}\\.?)[\\s\\S]*?(?:Answer|Ans|A\\.|Solution)[\\s:]*([\\s\\S]*?)(?=(?:Question|Q|Q\\.|Q\\s*\\d+|\\d+\\.|$))`, 'i'),
                new RegExp(`(?:Q${questionNo}|Question\\s*${questionNo}|${questionNo}\\.)[\\s\\S]*?(?:Answer|Ans|A\\.|Solution)[\\s:]*([\\s\\S]*?)(?=(?:Q\\d+|Question\\s*\\d+|\\d+\\.|$))`, 'i'),
                new RegExp(`(?:Answer|Ans|A\\.|Solution)\\s*${questionNo}[\\s:]*([\\s\\S]*?)(?=(?:Answer|Ans|A\\.|Solution)\\s*\\d+|$)`, 'i'),
            ];
            
            for (const pattern of patterns) {
                match = extractedText.match(pattern);
                if (match && match[1]) {
                    let answer = match[1].trim();
                    answer = answer.replace(/^(Answer|Ans|A\.|Solution)[\s:]*/i, '').trim();
                    if (answer.length > 3 && !answer.toUpperCase().includes('NOT FOUND')) {
                        parsedAnswers[question.id] = answer;
                        break;
                    }
                }
            }
        });
        
        return parsedAnswers;
    };

    // Handle handwritten assignment upload and processing
    const handleHandwrittenAssignmentUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PNG, JPEG, JPG, PDF, or Excel file.');
            return;
        }

        // Validate file size (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
            alert('File size should be less than 20MB.');
            return;
        }

        setHandwrittenFile(file);
        setIsProcessingHandwritten(true);

        try {
            // Extract text from file
            const extractedText = await extractTextFromFile(file);
            
            if (!extractedText || extractedText.trim().length === 0) {
                alert('Could not extract text from the file. Please try again or enter answers manually.');
                setIsProcessingHandwritten(false);
                return;
            }

            // Parse answers from extracted text
            const parsedAnswers = parseAnswersFromText(extractedText, assignment.questions || []);
            
            if (Object.keys(parsedAnswers).length === 0) {
                alert('Could not find answers in the uploaded file. Please enter answers manually.');
                setIsProcessingHandwritten(false);
                return;
            }

            // Auto-fill answers
            setAnswers(prev => ({
                ...prev,
                ...parsedAnswers
            }));

            // Auto-submit questions that have answers
            const questionsToSubmit = Object.keys(parsedAnswers);
            for (const questionId of questionsToSubmit) {
                const questionIdNum = parseInt(questionId);
                if (!submittedQuestions.has(questionIdNum)) {
                    // Mark as submitted
                    setSubmittedQuestions(prev => new Set([...prev, questionIdNum]));
                }
            }

            const foundCount = questionsToSubmit.length;
            const totalCount = assignment.questions?.length || 0;
            const missingCount = totalCount - foundCount;

            if (missingCount > 0) {
                alert(`Found answers for ${foundCount} out of ${totalCount} questions. Please enter answers manually for the remaining ${missingCount} question(s).`);
            } else {
                alert(`Successfully extracted and filled answers for all ${foundCount} questions!`);
            }

        } catch (error) {
            console.error('Error processing handwritten assignment:', error);
            alert(`Error processing file: ${error.message}. Please try again or enter answers manually.`);
        } finally {
            setIsProcessingHandwritten(false);
            // Reset file input
            event.target.value = '';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white p-6 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4 text-[#0066ff]" size={48} />
                    <p className="text-lg font-medium text-[#3c4043]">Loading assignment...</p>
                </div>
            </div>
        );
    }

    if (error || !assignment) {
  return (
            <div className="min-h-screen bg-white p-6 flex items-center justify-center">
                <div className="text-center">
                    <XCircle size={64} className="mx-auto mb-4 text-red-500 opacity-50" />
                    <p className="text-xl font-medium text-[#3c4043] mb-2">
                        {error || 'Assignment not found'}
                    </p>
                    <p className="text-sm text-[#5f6368] mb-4">
                        Assignment Code: {assignmentCode || 'N/A'}
                    </p>
                    <button
                        onClick={() => navigate('/student/assignments')}
                        className="mt-4 px-6 py-2 bg-[#c2e7ff] hover:bg-[#b0deff] text-[#001d35] rounded-full font-medium transition-all duration-200"
                    >
                        Back to Assignments
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/student/assignments')}
                        className="flex items-center gap-2 text-[#3c4043] hover:text-[#001d35] mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} strokeWidth={2} />
                        <span className="font-medium">Back to Assignments</span>
                    </button>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-[#001d35] mb-2 flex items-center gap-3">
                                    <FileText className="text-[#0066ff]" size={32} />
                                    {assignment.assignmentName}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 mt-3">
                                    <div className="flex items-center gap-2 text-[#5f6368]">
                                        <BookOpen size={18} className="text-[#0066ff]" strokeWidth={2} />
                                        <span className="font-medium">{assignment.subject}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#5f6368]">
                                        <Calendar size={18} className="text-[#0066ff]" strokeWidth={2} />
                                        <span className="font-medium">Due: {formatDate(assignment.dueDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#d3e3fd] text-[#001d35]">
                                            {assignment.questions?.length || 0} Questions
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {assignment.summury && (
                            <p className="text-[#5f6368] text-sm leading-relaxed">{assignment.summury}</p>
                        )}
                        
                        {assignment.topicUnderCovered && assignment.topicUnderCovered.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-[#3c4043] mb-2">Topics Covered:</p>
                                <div className="flex flex-wrap gap-2">
                                    {assignment.topicUnderCovered.map((topic, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-[#3c4043]"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Overall Submission Status */}
                        {isAssignmentSubmitted && !assignment?.isReviewed && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle2 size={20} />
                                    <span className="font-semibold">Assignment Submitted Successfully</span>
                                </div>
                                <p className="text-sm text-green-600 mt-1">
                                    Your assignment has been submitted. Waiting for teacher review.
                                </p>
                            </div>
                        )}
                        {assignment?.isReviewed && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <Star size={20} />
                                    <span className="font-semibold">Assignment Reviewed</span>
                                </div>
                                <p className="text-sm text-blue-600 mt-1">
                                    Your assignment has been reviewed. Check the review section below for detailed feedback.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Questions Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-[#001d35] mb-4">Questions</h2>
                    
                    {assignment.questions && assignment.questions.length > 0 ? (
                        assignment.questions.map((question, index) => {
                            const isOpen = openAccordion === question.id;
                            const isAttempting = attemptingQuestion === question.id;
                            const isSubmitted = submittedQuestions.has(question.id);
                            const hasAnswer = answers[question.id] && answers[question.id].trim().length > 0;
                            const hasAttachment = attachments[question.id];
                            
                            return (
                                <div
                                    key={question.id}
                                    className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                                        isSubmitted
                                            ? 'border-green-500 bg-green-50/30'
                                            : isOpen
                                            ? 'border-[#0066ff] shadow-md'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    {/* Accordion Header */}
                                    <div className="w-full px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1 text-left">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                                                isSubmitted
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-[#d3e3fd] text-[#001d35]'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-[#001d35]">
                                                        Question {index + 1}
                                                    </h3>
                                                    {isSubmitted && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white flex items-center gap-1">
                                                            <CheckCircle2 size={12} />
                                                            Submitted
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-[#5f6368] mt-1 line-clamp-2">
                                                    {question.question || 'No question text provided'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {isSubmitted ? (
                                                <button
                                                    onClick={() => toggleQuestionSubmittedAccordion(question.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                                >
                                                    <CheckCircle2 size={16} strokeWidth={2} />
                                                    Submitted
                                                    {questionSubmittedAccordionOpen[question.id] ? (
                                                        <ChevronUp size={16} strokeWidth={2} />
                                                    ) : (
                                                        <ChevronDown size={16} strokeWidth={2} />
                                                    )}
                                                </button>
                                            ) : !isAssignmentSubmitted ? (
                                                <button
                                                    onClick={() => handleAttemptQuestion(question.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#c2e7ff] hover:bg-[#b0deff] text-[#001d35] rounded-full font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                                >
                                                    <FileText size={16} strokeWidth={2} />
                                                    Attempt
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Attempt Section - Inline Accordion Content */}
                                    {isAttempting && (
                                        <div className="border-t border-gray-200 bg-white">
                                            <div className="p-6 space-y-6">
                                                {/* Question Display */}
                                                <div>
                                                    <h5 className="text-sm font-semibold text-[#3c4043] mb-3">Question:</h5>
                                                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                                                        <p className="text-[#5f6368] leading-relaxed">{question.question || 'No question text provided'}</p>
                                                    </div>
                                                </div>

                                                {/* Answer Input */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-[#3c4043] mb-3">
                                                        Write Your Answer:
                                                    </label>
                                                    <textarea
                                                        value={answers[question.id] || ''}
                                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                        placeholder="Type your answer here..."
                                                        rows={8}
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none transition-all text-[#3c4043] bg-gray-100 resize-none"
                                                    />
                                                </div>

                                                {/* File Upload */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-[#3c4043] mb-3">
                                                        Or Attach Handwritten Assignment:
                                                    </label>
                                                    <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center">
                                                        <input
                                                            type="file"
                                                            id={`file-${question.id}`}
                                                            accept="image/*,.pdf"
                                                            onChange={(e) => {
                                                                if (e.target.files[0]) {
                                                                    handleFileChange(question.id, e.target.files[0]);
                                                                }
                                                            }}
                                                            className="hidden"
                                                        />
                                                        <label
                                                            htmlFor={`file-${question.id}`}
                                                            className="cursor-pointer flex flex-col items-center gap-3"
                                                        >
                                                            {attachments[question.id] ? (
                                                                <>
                                                                    <File size={32} className="text-blue-500" />
                                                                    <p className="text-sm font-medium text-[#3c4043]">
                                                                        {attachments[question.id].name}
                                                                    </p>
                                                                    <p className="text-xs text-[#5f6368]">Click to change file</p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload size={32} className="text-[#5f6368]" />
                                                                    <p className="text-sm font-medium text-[#3c4043]">
                                                                        Click to upload or drag and drop
                                                                    </p>
                                                                    <p className="text-xs text-[#5f6368]">PNG, JPG, PDF up to 10MB</p>
                                                                </>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Submit Question Button */}
                                                <div className="pt-4 border-t border-gray-200">
                                                    <button
                                                        onClick={() => handleSubmitQuestion(question.id)}
                                                        disabled={submittingQuestion === question.id || (!hasAnswer && !hasAttachment)}
                                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0066ff] to-[#8b5cf6] hover:from-[#0052cc] hover:to-[#7c3aed] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                                    >
                                                        {submittingQuestion === question.id ? (
                                                            <>
                                                                <Loader2 className="animate-spin" size={18} strokeWidth={2} />
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send size={18} strokeWidth={2} />
                                                                Submit Answer
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submitted Question Details - Accordion */}
                                    {isSubmitted && !isAttempting && questionSubmittedAccordionOpen[question.id] && (
                                        <div className="border-t border-gray-200 bg-white">
                                            <div className="px-6 py-4">
                                                <div className={`border rounded-lg p-4 ${
                                                    assignment?.isReviewed 
                                                        ? 'bg-blue-50 border-blue-200' 
                                                        : 'bg-green-50 border-green-200'
                                                }`}>
                                                    <div className={`flex items-center gap-2 mb-3 ${
                                                        assignment?.isReviewed ? 'text-blue-700' : 'text-green-700'
                                                    }`}>
                                                        <CheckCircle2 size={18} />
                                                        <span className="font-semibold">
                                                            {assignment?.isReviewed ? 'This question has been reviewed' : 'This question has been submitted'}
                                                        </span>
                                                        {assignment?.isReviewed && assignment?.studentSubmission?.answers && (() => {
                                                            const answerData = assignment.studentSubmission.answers.find(
                                                                ans => ans.questionNo === question.questionNo
                                                            );
                                                            return answerData && (
                                                                <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-blue-200 text-blue-800">
                                                                    Score: {answerData.rate || 0}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                    {hasAnswer && (
                                                        <div className="mt-3">
                                                            <p className={`text-sm font-medium mb-1 ${
                                                                assignment?.isReviewed ? 'text-blue-600' : 'text-green-600'
                                                            }`}>Your Answer:</p>
                                                            <p className="text-sm text-[#3c4043] bg-white rounded p-2 border border-gray-200">{answers[question.id]}</p>
                                                        </div>
                                                    )}
                                                    {hasAttachment && (
                                                        <div className="mt-3">
                                                            <p className={`text-sm font-medium mb-1 ${
                                                                assignment?.isReviewed ? 'text-blue-600' : 'text-green-600'
                                                            }`}>Attached File:</p>
                                                            <div className="flex items-center gap-2 text-sm text-[#3c4043] bg-white rounded p-2 border border-gray-200">
                                                                <File size={16} className={assignment?.isReviewed ? 'text-blue-500' : 'text-green-500'} />
                                                                <span>{attachments[question.id].name}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                            <FileText size={48} className="mx-auto mb-4 text-[#5f6368] opacity-50" />
                            <p className="text-lg font-medium text-[#3c4043]">No questions available for this assignment</p>
                        </div>
                    )}

                    {/* Attach Handwritten Assignment Button */}
                    {!isAssignmentSubmitted && (
                        <div className="mt-6 bg-white rounded-xl border-2 border-blue-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#001d35] mb-1">
                                        Attach Handwritten Assignment
                                    </h3>
                                    <p className="text-sm text-[#5f6368]">
                                        Upload a PDF, PNG, JPEG, JPG, or Excel file. AI will automatically extract and fill answers.
                                    </p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="handwritten-assignment"
                                        accept=".pdf,.png,.jpeg,.jpg,.xlsx,.xls"
                                        onChange={handleHandwrittenAssignmentUpload}
                                        disabled={isProcessingHandwritten}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="handwritten-assignment"
                                        className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer ${
                                            isProcessingHandwritten ? 'opacity-75' : ''
                                        }`}
                                    >
                                        {isProcessingHandwritten ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} strokeWidth={2} />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={18} strokeWidth={2} />
                                                Attach Handwritten Assignment
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                            {handwrittenFile && !isProcessingHandwritten && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <File size={16} />
                                        <span className="text-sm font-medium">{handwrittenFile.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Overall Submit Button */}
                    {!isAssignmentSubmitted && (
                        <div className={`mt-6 bg-white rounded-xl border-2 p-6 ${
                            allQuestionsSubmitted 
                                ? 'border-green-500 bg-green-50/30' 
                                : 'border-gray-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#001d35] mb-1">
                                        {allQuestionsSubmitted ? 'Ready to Submit Assignment?' : 'Submit All Questions First'}
                                    </h3>
                                    <p className="text-sm text-[#5f6368]">
                                        {allQuestionsSubmitted 
                                            ? `All ${assignment.questions?.length || 0} questions have been submitted. You can now submit the entire assignment.`
                                            : `${submittedQuestions.size} of ${assignment.questions?.length || 0} questions submitted. Please submit all questions before submitting the assignment.`
                                        }
                                    </p>
                                </div>
                                <button
                                    onClick={handleSubmitAssignment}
                                    disabled={isSubmitting || !allQuestionsSubmitted}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#0066ff] to-[#8b5cf6] hover:from-[#0052cc] hover:to-[#7c3aed] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} strokeWidth={2} />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} strokeWidth={2} />
                                            Submit Assignment
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Review Section - Show when status is reviewed */}
                    {assignment?.isReviewed && assignment?.studentSubmission && (
                        <div className="mt-6 bg-white rounded-xl border-2 border-blue-500 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200">
                                <div className="flex items-center gap-3">
                                    <Star size={24} className="text-blue-600" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-700">
                                            Assignment Reviewed
                                        </h3>
                                        <p className="text-sm text-blue-600">
                                            Your assignment has been reviewed by your teacher
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Overall Score */}
                                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-700 mb-1">Overall Score</p>
                                            <p className="text-3xl font-bold text-blue-900">
                                                {assignment.studentSubmission.overallScore !== null && assignment.studentSubmission.overallScore !== undefined
                                                    ? `${assignment.studentSubmission.overallScore}/${assignment.questionsCount || 0}`
                                                    : 'Not Scored'}
                                            </p>
                                        </div>
                                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Star size={32} className="text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Teacher Comments */}
                                {assignment.studentSubmission.teacherComments && (
                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <div className="flex items-start gap-3">
                                            <MessageSquare size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Teacher Comments</h4>
                                                <p className="text-sm text-yellow-900 leading-relaxed">
                                                    {assignment.studentSubmission.teacherComments}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                {assignment.studentSubmission.summary && (
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <h4 className="text-sm font-semibold text-green-800 mb-2">Summary</h4>
                                        <p className="text-sm text-green-900 leading-relaxed">
                                            {assignment.studentSubmission.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Answer Rates and Scores */}
                                {assignment.studentSubmission.answers && assignment.studentSubmission.answers.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-[#001d35] mb-4">Question-wise Scores</h4>
                                        <div className="space-y-3">
                                            {assignment.questions && assignment.questions.map((question, index) => {
                                                const answerData = assignment.studentSubmission.answers.find(
                                                    ans => ans.questionNo === question.questionNo
                                                );
                                                return (
                                                    <div key={question.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h5 className="font-semibold text-[#001d35]">
                                                                Question {index + 1}: {question.question}
                                                            </h5>
                                                            {answerData && (
                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                                    Score: {answerData.rate || 0}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {answerData && (
                                                            <div className="mt-2">
                                                                <p className="text-sm font-medium text-[#5f6368] mb-1">Your Answer:</p>
                                                                <p className="text-sm text-[#3c4043] bg-white rounded p-2 border border-gray-200">
                                                                    {answerData.answer}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Resources */}
                                {assignment.studentSubmission.resources && assignment.studentSubmission.resources.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-[#001d35] mb-4">Recommended Resources</h4>
                                        <div className="space-y-2">
                                            {assignment.studentSubmission.resources.map((resource, index) => (
                                                <a
                                                    key={index}
                                                    href={resource.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                                                >
                                                    <File size={20} className="text-blue-600 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-blue-900">
                                                            {resource.type.toUpperCase()} Resource
                                                        </p>
                                                        <p className="text-xs text-blue-700 truncate">
                                                            {resource.link}
                                                        </p>
                                                    </div>
                                                    <ExternalLink size={16} className="text-blue-600 flex-shrink-0" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Topics Need Practice */}
                                {assignment.studentSubmission.needPractice && assignment.studentSubmission.needPractice.length > 0 && (
                                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                        <h4 className="text-sm font-semibold text-orange-800 mb-2">Topics That Need Practice</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {assignment.studentSubmission.needPractice.map((topic, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submission Details Accordion */}
                    {isAssignmentSubmitted && !assignment?.isReviewed && (
                        <div className="mt-6 bg-white rounded-xl border-2 border-green-500 overflow-hidden">
                            <button
                                onClick={toggleSubmittedAccordion}
                                className="w-full px-6 py-4 flex items-center justify-between bg-green-50 hover:bg-green-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={24} className="text-green-600" />
                                    <div className="text-left">
                                        <h3 className="text-lg font-semibold text-green-700">
                                            Assignment Submitted Successfully
                                        </h3>
                                        <p className="text-sm text-green-600">
                                            View your submission details
                                        </p>
                                    </div>
                                </div>
                                {submittedAccordionOpen ? (
                                    <ChevronUp size={20} className="text-green-600" />
                                ) : (
                                    <ChevronDown size={20} className="text-green-600" />
                                )}
                            </button>

                            {submittedAccordionOpen && (
                                <div className="border-t border-green-200 bg-white">
                                    <div className="p-6 space-y-4">
                                        {assignment.questions && assignment.questions.map((question, index) => (
                                            <div key={question.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <h4 className="font-semibold text-[#001d35] mb-2">
                                                    Question {index + 1}: {question.question}
                                                </h4>
                                                {answers[question.id] && (
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium text-[#5f6368] mb-1">Your Answer:</p>
                                                        <p className="text-sm text-[#3c4043] bg-white rounded p-2 border border-gray-200">
                                                            {answers[question.id]}
                                                        </p>
                                                    </div>
                                                )}
                                                {attachments[question.id] && (
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium text-[#5f6368] mb-1">Attached File:</p>
                                                        <div className="flex items-center gap-2 text-sm text-[#3c4043] bg-white rounded p-2 border border-gray-200">
                                                            <File size={16} className="text-[#0066ff]" />
                                                            <span>{attachments[question.id].name}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {!answers[question.id] && !attachments[question.id] && (
                                                    <p className="text-sm text-[#5f6368] italic">No answer provided for this question</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttemptAssignments;
