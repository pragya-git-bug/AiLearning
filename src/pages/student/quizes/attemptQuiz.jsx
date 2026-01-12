import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
    BookOpen, 
    Calendar, 
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Send,
    Radio,
    XCircle
} from 'lucide-react';
import { getQuizByCode, submitQuiz, getStudentQuizSubmission } from '../../../services/api';

const AttemptQuiz = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { quizeCode: quizCodeParam, quizName: quizNameParam } = useParams();
    const { currentUser } = useSelector((state) => state.userData);
    
    const quizCode = quizCodeParam ? decodeURIComponent(quizCodeParam) : '';
    const quizName = quizNameParam ? decodeURIComponent(quizNameParam) : '';
    const isViewMode = location.pathname.includes('/view/');
    
    const [quiz, setQuiz] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizCode) {
                setError('Quiz code not found in URL');
                setIsLoading(false);
                return;
            }

            if (!currentUser?.userCode) {
                setError('Student code not found. Please login again.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                // If viewing a submitted quiz, use student submission API
                if (isViewMode) {
                    const submissionResult = await getStudentQuizSubmission(quizCode, currentUser.userCode);
                    
                    if (submissionResult.success && submissionResult.data.success) {
                        const submissionData = submissionResult.data.data;
                        const quizData = submissionData.data || submissionData;
                        
                        // Convert questions object to array format
                        const questionsArray = quizData.questions 
                            ? Object.values(quizData.questions).sort((a, b) => a.questionNo - b.questionNo).map((q) => ({
                                questionNo: q.questionNo,
                                question: q.question,
                                options: q.options || {},
                                correctOption: q.correctOption,
                                difficulties: q.difficulties,
                                _id: q._id
                            }))
                            : [];

                        const mappedQuiz = {
                            _id: quizData._id || quizData.id,
                            quizName: quizData.quizeName,
                            subject: quizData.subject,
                            dueDate: quizData.dueDate,
                            status: quizData.status,
                            assignedTo: quizData.assignedTo,
                            teacherCode: quizData.teacherCode,
                            quizeCode: quizData.quizeCode,
                            questions: questionsArray,
                            questionsCount: questionsArray.length,
                            submissions: quizData.submissions || {}
                        };

                        setQuiz(mappedQuiz);
                        
                        // Get submission data if available
                        if (submissionData.studentSubmission) {
                            setIsSubmitted(true);
                            // Format answers from submission
                            const answersObj = {};
                            if (submissionData.studentSubmission.answers) {
                                submissionData.studentSubmission.answers.forEach(answer => {
                                    answersObj[answer.questionNo] = answer.selectedOption;
                                });
                            }
                            setSelectedAnswers(answersObj);
                            setScore(submissionData.studentSubmission.score || null);
                        }
                    } else {
                        // If no submission found, try to get quiz anyway
                        const result = await getQuizByCode(quizCode);
                        if (result.success && result.data.success) {
                            const quizData = result.data.data;
                            const questionsArray = quizData.questions 
                                ? Object.values(quizData.questions).sort((a, b) => a.questionNo - b.questionNo).map((q) => ({
                                    questionNo: q.questionNo,
                                    question: q.question,
                                    options: q.options || {},
                                    correctOption: q.correctOption,
                                    difficulties: q.difficulties,
                                    _id: q._id
                                }))
                                : [];

                            const mappedQuiz = {
                                _id: quizData._id || quizData.id,
                                quizName: quizData.quizeName,
                                subject: quizData.subject,
                                dueDate: quizData.dueDate,
                                status: quizData.status,
                                assignedTo: quizData.assignedTo,
                                teacherCode: quizData.teacherCode,
                                quizeCode: quizData.quizeCode,
                                questions: questionsArray,
                                questionsCount: questionsArray.length,
                                submissions: quizData.submissions || {}
                            };
                            setQuiz(mappedQuiz);
                        } else {
                            setError(submissionResult.error || result.error || 'Failed to load quiz');
                        }
                    }
                } else {
                    // Attempt mode - get quiz and check if already submitted
                    const result = await getQuizByCode(quizCode);

                    if (result.success && result.data.success) {
                        const quizData = result.data.data;
                        
                        // Convert questions object to array format
                        const questionsArray = quizData.questions 
                            ? Object.values(quizData.questions).sort((a, b) => a.questionNo - b.questionNo).map((q) => ({
                                questionNo: q.questionNo,
                                question: q.question,
                                options: q.options || {},
                                correctOption: q.correctOption,
                                difficulties: q.difficulties,
                                _id: q._id
                            }))
                            : [];

                        const mappedQuiz = {
                            _id: quizData._id || quizData.id,
                            quizName: quizData.quizeName,
                            subject: quizData.subject,
                            dueDate: quizData.dueDate,
                            status: quizData.status,
                            assignedTo: quizData.assignedTo,
                            teacherCode: quizData.teacherCode,
                            quizeCode: quizData.quizeCode,
                            questions: questionsArray,
                            questionsCount: questionsArray.length,
                            submissions: quizData.submissions || {}
                        };

                        setQuiz(mappedQuiz);
                        
                        // Check if quiz is already submitted
                        const studentCode = currentUser?.userCode;
                        if (quizData.submissions && studentCode && quizData.submissions[studentCode]) {
                            setIsSubmitted(true);
                            setSelectedAnswers(quizData.submissions[studentCode].answers || {});
                            setScore(quizData.submissions[studentCode].score || null);
                        }
                    } else {
                        setError(result.error || 'Failed to load quiz');
                    }
                }
            } catch (err) {
                setError(err.message || 'An error occurred while loading quiz');
                console.error('Error fetching quiz:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuiz();
    }, [quizCode, currentUser?.userCode, isViewMode]);

    const handleAnswerSelect = (questionNo, option) => {
        if (isSubmitted) return; // Don't allow changes after submission
        
        setSelectedAnswers(prev => ({
            ...prev,
            [questionNo]: option
        }));
    };

    const handleSubmitQuiz = async () => {
        if (!quizCode || !currentUser?.userCode) {
            setError('Quiz code or student code not found. Please refresh the page.');
            return;
        }

        if (!quiz) {
            setError('Quiz data not loaded. Please refresh the page.');
            return;
        }

        // Check if all questions are answered
        const unansweredQuestions = quiz.questions.filter(q => !selectedAnswers[q.questionNo]);
        if (unansweredQuestions.length > 0) {
            setError(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Format answers for submission according to API structure
            // API expects: { questionNo: number, answer: string }
            const answers = quiz.questions.map(q => ({
                questionNo: q.questionNo,
                answer: selectedAnswers[q.questionNo] || null
            }));

            const submissionData = {
                quizeCode: quizCode,
                studentCode: currentUser.userCode,
                answers: answers
            };

            console.log('Submitting quiz with data:', submissionData);

            const result = await submitQuiz(submissionData);

            if (result.success) {
                setIsSubmitted(true);
                
                // Calculate score locally as fallback
                let correctCount = 0;
                quiz.questions.forEach(q => {
                    if (selectedAnswers[q.questionNo] === q.correctOption) {
                        correctCount++;
                    }
                });
                const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
                
                // Use API score if available, otherwise use calculated score
                if (result.data?.data?.score !== undefined) {
                    setScore(result.data.data.score);
                } else if (result.data?.score !== undefined) {
                    setScore(result.data.score);
                } else {
                    setScore(calculatedScore);
                }
                
                // Show success message and navigate
                setTimeout(() => {
                    navigate('/student/quizzes');
                }, 2000);
            } else {
                setError(result.error || 'Failed to submit quiz. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while submitting quiz');
            console.error('Error submitting quiz:', err);
        } finally {
            setIsSubmitting(false);
        }
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

    const getOptionLabel = (optionKey) => {
        return optionKey.replace('op', 'Option ').replace(/(\d)/, '$1');
    };

    const allQuestionsAnswered = quiz && quiz.questions.every(q => selectedAnswers[q.questionNo]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 text-lg">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (error && !quiz) {
        return (
            <div className="min-h-screen bg-white p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                    <button
                        onClick={() => navigate('/student/quizzes')}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/student/quizzes')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Quizzes</span>
                </button>

                {/* Quiz Header */}
                <div className="bg-white border-l-4 border-blue-500 rounded-lg p-6 mb-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <BookOpen className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{quiz.quizName}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-blue-600" />
                            <span>{quiz.subject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-600" />
                            <span>Due: {formatDate(quiz.dueDate)}</span>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {quiz.questionsCount} Questions
                        </span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {isSubmitted && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                        <CheckCircle2 size={20} />
                        <span>
                            Quiz submitted successfully! {score !== null && `Your score: ${score}%`}
                        </span>
                    </div>
                )}

                {/* Questions */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Questions</h2>
                    <div className="space-y-4">
                        {quiz.questions.map((question, index) => {
                            const isAnswered = selectedAnswers[question.questionNo];
                            const isCorrect = isSubmitted && question.correctOption && 
                                            selectedAnswers[question.questionNo] === question.correctOption;
                            const isIncorrect = isSubmitted && question.correctOption && 
                                              selectedAnswers[question.questionNo] !== question.correctOption;

                            return (
                                <div
                                    key={question.questionNo}
                                    className="bg-white border-l-4 border-blue-500 rounded-lg p-6 shadow-sm"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-blue-600 font-bold">{question.questionNo}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-2">Question {question.questionNo}</h3>
                                            <p className="text-gray-700 mb-4">{question.question}</p>
                                            
                                            {/* Options */}
                                            <div className="space-y-2">
                                                {Object.entries(question.options || {}).map(([optionKey, optionText]) => {
                                                    const isSelected = selectedAnswers[question.questionNo] === optionKey;
                                                    const isCorrectAnswer = isSubmitted && question.correctOption === optionKey;
                                                    
                                                    return (
                                                        <label
                                                            key={optionKey}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                                isSubmitted
                                                                    ? isCorrectAnswer
                                                                        ? 'bg-green-50 border-green-500'
                                                                        : isSelected && isIncorrect
                                                                        ? 'bg-red-50 border-red-500'
                                                                        : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                                                    : isSelected
                                                                    ? 'bg-blue-50 border-blue-500'
                                                                    : 'bg-white border-gray-200 hover:border-blue-300'
                                                            }`}
                                                        >
                                                            <Radio
                                                                size={18}
                                                                className={`${
                                                                    isSubmitted
                                                                        ? isCorrectAnswer
                                                                            ? 'text-green-600'
                                                                            : isSelected && isIncorrect
                                                                            ? 'text-red-600'
                                                                            : 'text-gray-400'
                                                                        : isSelected
                                                                        ? 'text-blue-600'
                                                                        : 'text-gray-400'
                                                                }`}
                                                            />
                                                            <input
                                                                type="radio"
                                                                name={`question-${question.questionNo}`}
                                                                value={optionKey}
                                                                checked={isSelected}
                                                                onChange={() => handleAnswerSelect(question.questionNo, optionKey)}
                                                                disabled={isSubmitted}
                                                                className="hidden"
                                                            />
                                                            <span className={`flex-1 ${
                                                                isSubmitted && isCorrectAnswer
                                                                    ? 'text-green-700 font-semibold'
                                                                    : isSubmitted && isSelected && isIncorrect
                                                                    ? 'text-red-700'
                                                                    : 'text-gray-700'
                                                            }`}>
                                                                {optionText}
                                                            </span>
                                                            {isSubmitted && isCorrectAnswer && (
                                                                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                                                            )}
                                                            {isSubmitted && isSelected && isIncorrect && (
                                                                <XCircle size={18} className="text-red-600 flex-shrink-0" />
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            {/* Show correct answer after submission if wrong */}
                                            {isSubmitted && isIncorrect && question.correctOption && (
                                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-sm text-green-700">
                                                        <span className="font-semibold">Correct Answer:</span>{' '}
                                                        {question.options[question.correctOption]}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Submit Button */}
                {!isSubmitted && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Ready to Submit?</h3>
                                <p className="text-sm text-gray-600">
                                    {Object.keys(selectedAnswers).length} of {quiz.questionsCount} questions answered
                                </p>
                            </div>
                            <button
                                onClick={handleSubmitQuiz}
                                disabled={!allQuestionsAnswered || isSubmitting}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                    allQuestionsAnswered && !isSubmitting
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Quiz
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Summary */}
                {isSubmitted && score !== null && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Results</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{score}%</div>
                                <div className="text-sm text-gray-600 mt-1">Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {quiz.questions.filter(q => 
                                        selectedAnswers[q.questionNo] === q.correctOption
                                    ).length}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Correct</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600">
                                    {quiz.questions.filter(q => 
                                        selectedAnswers[q.questionNo] !== q.correctOption
                                    ).length}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Incorrect</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttemptQuiz;
