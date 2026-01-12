import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, CheckCircle2, Plus, X, BookOpen, GraduationCap, Target, Zap, Calendar, FileText } from 'lucide-react';
import { createQuiz } from '../../../../services/api';
import BASE_URL from '../../../../http/Service';

const CreateQuizes = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.userData);
    
    const [formData, setFormData] = useState({
        className: '',
        subjects: '',
        topics: '',
        difficulty: 'medium'
    });
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [quizDetails, setQuizDetails] = useState({
        quizName: '',
        dueDate: ''
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const generateQuizzes = async () => {
        if (!formData.className || !formData.subjects || !formData.topics) {
            setError('Please fill in all required fields');
            return;
        }

        setIsGenerating(true);
        setError('');
        setGeneratedQuestions([]);

        try {
            const prompt = `Generate 20 quiz questions for ${formData.className} class on the subject ${formData.subjects}. 
            Topics to cover: ${formData.topics}. 
            Difficulty level: ${formData.difficulty}. 
            Format each question as a JSON object with: question, type (must be "multiple-choice" for quizzes), options (as an array of exactly 4 strings), correctAnswer (the index of the correct option, 0-based, where 0 is the first option), and difficulty.
            IMPORTANT: All questions must be multiple-choice with exactly 4 options. The correctAnswer should be a number (0, 1, 2, or 3) indicating which option is correct.
            Return as a JSON array with exactly 20 questions.`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an educational assistant that generates quiz questions. Always return valid JSON arrays.'
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
            
            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to generate questions');
            }

            const content = data.choices[0]?.message?.content;
            let questions = [];

            try {
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    questions = JSON.parse(jsonMatch[0]);
                } else {
                    const lines = content.split('\n').filter(line => line.trim());
                    questions = lines.slice(0, 20).map((line, index) => ({
                        id: index + 1,
                        question: line.replace(/^\d+\.\s*/, '').trim(),
                        type: 'short-answer',
                        difficulty: formData.difficulty
                    }));
                }
            } catch (parseError) {
                const lines = content.split('\n').filter(line => line.trim() && line.match(/^\d+\./));
                questions = lines.slice(0, 20).map((line, index) => ({
                    id: index + 1,
                    question: line.replace(/^\d+\.\s*/, '').trim(),
                    type: 'short-answer',
                    difficulty: formData.difficulty
                }));
            }

            // Process questions to ensure they have the correct format
            questions = questions.map((q, index) => {
                // Convert options array to object format { op1, op2, op3, op4 } if needed
                let optionsObj = null;
                if (q.options) {
                    if (Array.isArray(q.options)) {
                        // Ensure we have exactly 4 options
                        const optionsArray = [...q.options];
                        while (optionsArray.length < 4) {
                            optionsArray.push('');
                        }
                        optionsObj = {
                            op1: optionsArray[0] || '',
                            op2: optionsArray[1] || '',
                            op3: optionsArray[2] || '',
                            op4: optionsArray[3] || ''
                        };
                    } else if (typeof q.options === 'object') {
                        // Ensure it has op1, op2, op3, op4 format
                        optionsObj = {
                            op1: q.options.op1 || q.options[0] || '',
                            op2: q.options.op2 || q.options[1] || '',
                            op3: q.options.op3 || q.options[2] || '',
                            op4: q.options.op4 || q.options[3] || ''
                        };
                    }
                } else {
                    // If no options provided, create empty options (will need to be filled manually)
                    optionsObj = {
                        op1: '',
                        op2: '',
                        op3: '',
                        op4: ''
                    };
                }

                // Determine correctOption from correctAnswer
                let correctOption = null;
                if (q.correctAnswer !== undefined && q.correctAnswer !== null) {
                    if (typeof q.correctAnswer === 'number') {
                        // 0-based index, convert to op1, op2, op3, op4
                        if (q.correctAnswer >= 0 && q.correctAnswer < 4) {
                            correctOption = `op${q.correctAnswer + 1}`;
                        }
                    } else if (typeof q.correctAnswer === 'string') {
                        if (q.correctAnswer.startsWith('op')) {
                            correctOption = q.correctAnswer;
                        } else {
                            // Try to parse as number
                            const answerIndex = parseInt(q.correctAnswer);
                            if (!isNaN(answerIndex) && answerIndex >= 0 && answerIndex < 4) {
                                correctOption = `op${answerIndex + 1}`;
                            }
                        }
                    }
                }

                return {
                    ...q,
                    id: q.id || index + 1,
                    selected: false,
                    options: optionsObj,
                    correctOption: correctOption,
                    correctAnswer: q.correctAnswer, // Keep original for reference
                    type: q.type || 'multiple-choice' // Default to multiple-choice for quizzes
                };
            });

            setGeneratedQuestions(questions);
        } catch (err) {
            setError(err.message || 'Failed to generate quiz questions. Please try again.');
            console.error('Error generating quiz questions:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleQuestionSelection = (question) => {
        const isSelected = selectedQuestions.some(q => q.id === question.id);
        
        if (isSelected) {
            setSelectedQuestions(selectedQuestions.filter(q => q.id !== question.id));
            setGeneratedQuestions(generatedQuestions.map(q => 
                q.id === question.id ? { ...q, selected: false } : q
            ));
        } else {
            setSelectedQuestions([...selectedQuestions, { ...question, selected: true }]);
            setGeneratedQuestions(generatedQuestions.map(q => 
                q.id === question.id ? { ...q, selected: true } : q
            ));
        }
    };

    const removeSelectedQuestion = (questionId) => {
        setSelectedQuestions(selectedQuestions.filter(q => q.id !== questionId));
        setGeneratedQuestions(generatedQuestions.map(q => 
            q.id === questionId ? { ...q, selected: false } : q
        ));
    };

    const handleFinalizeClick = () => {
        if (selectedQuestions.length === 0) {
            setError('Please select at least one question');
            return;
        }

        // Validate that all selected questions have options
        const questionsWithoutOptions = selectedQuestions.filter(q => 
            !q.options || 
            (typeof q.options === 'object' && Object.keys(q.options).length === 0) ||
            (typeof q.options === 'object' && !q.options.op1 && !q.options.op2 && !q.options.op3 && !q.options.op4)
        );

        if (questionsWithoutOptions.length > 0) {
            setError('All quiz questions must have options. Please ensure all selected questions have multiple-choice options.');
            return;
        }

        // Validate that all questions have correctOption
        const questionsWithoutCorrect = selectedQuestions.filter(q => !q.correctOption);
        if (questionsWithoutCorrect.length > 0) {
            setError('All quiz questions must have a correct answer. Please ensure all selected questions have a correct option specified.');
            return;
        }

        setError('');
        setShowDialog(true);
    };

    const handleDialogChange = (e) => {
        setQuizDetails({
            ...quizDetails,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateQuiz = async () => {
        if (!quizDetails.quizName || !quizDetails.dueDate) {
            setError('Please fill in quiz name and due date');
            return;
        }

        if (!currentUser?.userCode) {
            setError('Teacher code not found. Please login again.');
            return;
        }

        setIsCreating(true);
        setError('');
        setSuccessMessage('');

        try {
            // Format questions according to API structure (q1, q2, etc.)
            const questionsObject = {};
            selectedQuestions.forEach((q, index) => {
                const questionKey = `q${index + 1}`;
                
                // Format options object (op1, op2, op3, op4)
                let optionsObj = null;
                if (q.options) {
                    if (Array.isArray(q.options)) {
                        optionsObj = {
                            op1: q.options[0] || '',
                            op2: q.options[1] || '',
                            op3: q.options[2] || '',
                            op4: q.options[3] || ''
                        };
                    } else if (typeof q.options === 'object') {
                        // Ensure it has op1, op2, op3, op4 format
                        optionsObj = {
                            op1: q.options.op1 || q.options[0] || '',
                            op2: q.options.op2 || q.options[1] || '',
                            op3: q.options.op3 || q.options[2] || '',
                            op4: q.options.op4 || q.options[3] || ''
                        };
                    }
                }

                // Determine correctOption
                let correctOption = q.correctOption;
                if (!correctOption && q.correctAnswer !== undefined && q.correctAnswer !== null) {
                    if (typeof q.correctAnswer === 'number') {
                        correctOption = `op${q.correctAnswer + 1}`;
                    } else if (typeof q.correctAnswer === 'string') {
                        if (q.correctAnswer.startsWith('op')) {
                            correctOption = q.correctAnswer;
                        } else {
                            const answerIndex = parseInt(q.correctAnswer);
                            if (!isNaN(answerIndex) && answerIndex >= 0 && answerIndex < 4) {
                                correctOption = `op${answerIndex + 1}`;
                            }
                        }
                    }
                }

                questionsObject[questionKey] = {
                    questionNo: index + 1,
                    question: q.question,
                    difficulties: q.difficulty || formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1),
                    options: optionsObj,
                    correctOption: correctOption
                };
            });

            // Create quiz object matching the API structure
            const quizData = {
                teacherCode: currentUser.userCode,
                quizeName: quizDetails.quizName, // Note: API uses "quizeName" not "quizName"
                subject: formData.subjects,
                dueDate: quizDetails.dueDate,
                assignedTo: formData.className,
                questions: questionsObject
            };

            console.log('Creating quiz with data:', quizData);
            console.log('API URL:', `${BASE_URL}/api/quizes/add`);

            // Call API to create quiz
            const result = await createQuiz(quizData);

            console.log('API Response:', result);

            if (result.success) {
                setSuccessMessage(`Quiz "${quizDetails.quizName}" created successfully!`);
                
                setTimeout(() => {
                    setIsCreating(false);
                    setShowDialog(false);
                    navigate('/teacher/quizzes');
                }, 2000);
            } else {
                setError(result.error || 'Failed to create quiz. Please try again.');
                setIsCreating(false);
            }
        } catch (err) {
            setError(err.message || 'An error occurred while creating quiz. Please try again.');
            setIsCreating(false);
            console.error('Error creating quiz:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-2 border-gray-200 rounded-lg">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Sparkles className="text-purple-600" size={32} />
                        Create AI Quizzes
                    </h1>
                    <p className="text-gray-600 text-lg">Generate personalized quizzes using AI</p>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-2xl p-8 mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Class Name */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <GraduationCap size={18} className="text-purple-600" />
                                Class Name
                            </label>
                            <input
                                type="text"
                                name="className"
                                value={formData.className}
                                onChange={handleChange}
                                placeholder="e.g., 8th Grade, Class 10"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all text-gray-900"
                            />
                        </div>

                        {/* Subjects */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <BookOpen size={18} className="text-purple-600" />
                                Subjects
                            </label>
                            <input
                                type="text"
                                name="subjects"
                                value={formData.subjects}
                                onChange={handleChange}
                                placeholder="e.g., Mathematics, Science"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all text-gray-900"
                            />
                        </div>

                        {/* Topics */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Target size={18} className="text-purple-600" />
                                All Topics
                            </label>
                            <textarea
                                name="topics"
                                value={formData.topics}
                                onChange={handleChange}
                                placeholder="e.g., Algebra, Geometry, Trigonometry (comma-separated)"
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all resize-none text-gray-900"
                            />
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Zap size={18} className="text-purple-600" />
                                Difficulty Level
                            </label>
                            <div className="flex gap-4">
                                {['easy', 'medium', 'hard'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, difficulty: level })}
                                        className={`px-6 py-3 rounded-xl font-semibold transition-all capitalize ${
                                            formData.difficulty === level
                                                ? 'bg-purple-600 text-white shadow-lg scale-105'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Generate Button */}
                    <button
                        onClick={generateQuizzes}
                        disabled={isGenerating}
                        className="mt-6 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                Generating Quiz Questions...
                            </>
                        ) : (
                            <>
                                <Sparkles size={24} />
                                Generate Quiz Questions
                            </>
                        )}
                    </button>
                </div>

                {/* Two Column Layout */}
                {generatedQuestions.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Section - AI Generated Questions */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="text-purple-600" size={24} />
                                    AI Generated Questions
                                </h2>
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    {generatedQuestions.length} Questions
                                </span>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {generatedQuestions.map((question) => (
                                    <div
                                        key={question.id}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                            question.selected
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                        }`}
                                        onClick={() => toggleQuestionSelection(question)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 flex-shrink-0 ${
                                                question.selected ? 'text-purple-600' : 'text-gray-400'
                                            }`}>
                                                {question.selected ? (
                                                    <CheckCircle2 size={20} className="text-purple-600" />
                                                ) : (
                                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                        Q{question.id}
                                                    </span>
                                                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded capitalize">
                                                        {question.type || 'short-answer'}
                                                    </span>
                                                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded capitalize">
                                                        {question.difficulty || formData.difficulty}
                                                    </span>
                                                </div>
                                                <p className="text-gray-900 font-medium">{question.question}</p>
                                                {question.options && (
                                                    <div className="mt-2 space-y-1">
                                                        {Object.entries(question.options)
                                                            .filter(([key, value]) => value && value.trim() !== '')
                                                            .map(([key, option], idx) => (
                                                                <div key={key} className="text-sm text-gray-600 ml-4">
                                                                    {String.fromCharCode(65 + idx)}. {option}
                                                                    {question.correctOption === key && (
                                                                        <span className="ml-2 text-xs text-green-600 font-semibold">✓ Correct</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Section - Selected Questions */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <CheckCircle2 className="text-green-600" size={24} />
                                    Selected Questions
                                </h2>
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    {selectedQuestions.length} Selected
                                </span>
                            </div>

                            {selectedQuestions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                                    <CheckCircle2 size={64} className="mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No questions selected</p>
                                    <p className="text-sm mt-2">Click on questions from the left to add them here</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    {selectedQuestions.map((question, index) => (
                                        <div
                                            key={question.id}
                                            className="p-4 rounded-xl border-2 border-green-200 bg-green-50"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                                                            Question {index + 1}
                                                        </span>
                                                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded capitalize">
                                                            {question.type || 'short-answer'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-900 font-medium">{question.question}</p>
                                                    {question.options && (
                                                        <div className="mt-2 space-y-1">
                                                            {Object.entries(question.options)
                                                                .filter(([key, value]) => value && value.trim() !== '')
                                                                .map(([key, option], idx) => (
                                                                    <div key={key} className="text-sm text-gray-600 ml-4">
                                                                        {String.fromCharCode(65 + idx)}. {option}
                                                                        {question.correctOption === key && (
                                                                            <span className="ml-2 text-xs text-green-600 font-semibold">✓ Correct</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeSelectedQuestion(question.id)}
                                                    className="flex-shrink-0 p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Finalize Button */}
                            {selectedQuestions.length > 0 && (
                                <button 
                                    onClick={handleFinalizeClick}
                                    className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                                >
                                    <CheckCircle2 size={24} />
                                    Finalize Quiz ({selectedQuestions.length} questions)
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Dialog Modal */}
                {showDialog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="text-purple-600" size={28} />
                                    Create Quiz
                                </h3>
                                <button
                                    onClick={() => setShowDialog(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Quiz Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <FileText size={18} className="text-purple-600" />
                                        Quiz Name
                                    </label>
                                    <input
                                        type="text"
                                        name="quizName"
                                        value={quizDetails.quizName}
                                        onChange={handleDialogChange}
                                        placeholder="e.g., Math Quiz 1"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all text-gray-900"
                                    />
                                </div>

                                {/* Due Date */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Calendar size={18} className="text-purple-600" />
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={quizDetails.dueDate}
                                        onChange={handleDialogChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all text-gray-900"
                                    />
                                </div>

                                {/* Summary Info */}
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-semibold">Subject:</span> {formData.subjects}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-semibold">Class:</span> {formData.className}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Questions:</span> {selectedQuestions.length}
                                    </p>
                                </div>

                                {/* Success Message */}
                                {successMessage && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                                        <CheckCircle2 size={18} className="text-green-600" />
                                        <span>{successMessage}</span>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowDialog(false);
                                            setError('');
                                        }}
                                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateQuiz}
                                        disabled={isCreating}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={20} />
                                                Create Quiz
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes scale-in {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default CreateQuizes;
