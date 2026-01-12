// API Configuration

import BASE_URL from "../http/Service";

/**
 * Login API call
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} API response
 */
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'An error occurred during login'
        };
    }
};

/**
 * Create Assignment API call
 * @param {Object} assignmentData - Assignment data object
 * @returns {Promise} API response
 */
export const createAssignment = async (assignmentData) => {
    try {
        const url = `${BASE_URL}/api/assignments/add`;
        console.log('Making API call to:', url);
        console.log('Request payload:', assignmentData);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(assignmentData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create assignment');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while creating assignment'
        };
    }
};

/**
 * Get Assignments by Teacher Code API call
 * @param {string} teacherCode - Teacher code
 * @returns {Promise} API response
 */
export const getAssignmentsByTeacher = async (teacherCode) => {
    try {
        const url = `${BASE_URL}/api/assignments/teacher/${teacherCode}`;
        console.log('Fetching assignments from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch assignments');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching assignments'
        };
    }
};

/**
 * Get Assignments by Assigned To (Class Name) API call
 * @param {string} assignedTo - Class name (e.g., "8th Class")
 * @returns {Promise} API response
 */
export const getAssignmentsByClass = async (assignedTo) => {
    try {
        // URL encode the class name to handle spaces
        const encodedClass = encodeURIComponent(assignedTo);
        const url = `${BASE_URL}/api/assignments/assigned-to/${encodedClass}`;
        console.log('Fetching assignments for class:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch assignments');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching assignments'
        };
    }
};

/**
 * Submit Assignment API call
 * @param {Object} submissionData - Assignment submission data
 * @param {string} submissionData.assignmentCode - Assignment code
 * @param {string} submissionData.studentCode - Student code
 * @param {Array} submissionData.answers - Array of answers with questionNo, answer, and rate
 * @returns {Promise} API response
 */
export const submitAssignment = async (submissionData) => {
    try {
        const url = `${BASE_URL}/api/assignments/submit`;
        console.log('Submitting assignment to:', url);
        console.log('Request payload:', submissionData);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(submissionData)
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit assignment');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while submitting assignment'
        };
    }
};

/**
 * Get Submitted Students for Assignment API call
 * @param {string} assignmentCode - Assignment code
 * @returns {Promise} API response
 */
export const getSubmittedStudents = async (assignmentCode) => {
    try {
        const url = `${BASE_URL}/api/assignments/submitted-students/${assignmentCode}`;
        console.log('Fetching submitted students from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch submitted students');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching submitted students'
        };
    }
};

/**
 * Get Assignment by Assignment Code API call
 * @param {string} assignmentCode - Assignment code
 * @returns {Promise} API response
 */
export const getAssignmentByCode = async (assignmentCode) => {
    try {
        const url = `${BASE_URL}/api/assignments/${assignmentCode}`;
        console.log('Fetching assignment from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch assignment');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching assignment'
        };
    }
};

/**
 * Get Student Submission for Assignment API call
 * @param {string} assignmentCode - Assignment code
 * @param {string} studentCode - Student code
 * @returns {Promise} API response
 */
export const getStudentSubmission = async (assignmentCode, studentCode) => {
    try {
        const url = `${BASE_URL}/api/assignments/student-submission/${assignmentCode}/${studentCode}`;
        console.log('Fetching student submission from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch student submission');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching student submission'
        };
    }
};

/**
 * Create Quiz API call
 * @param {Object} quizData - Quiz data object
 * @returns {Promise} API response
 */
export const createQuiz = async (quizData) => {
    try {
        const url = `${BASE_URL}/api/quizes/add`;
        console.log('Creating quiz at:', url);
        console.log('Request payload:', quizData);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(quizData)
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create quiz');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while creating quiz'
        };
    }
};

/**
 * Get All Quizzes API call
 * @returns {Promise} API response
 */
export const getAllQuizzes = async () => {
    try {
        const url = `${BASE_URL}/api/quizes/all`;
        console.log('Fetching quizzes from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch quizzes');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching quizzes'
        };
    }
};

/**
 * Get Quizzes by Assigned To (Class Name) API call
 * @param {string} assignedTo - Class name (e.g., "8th Class")
 * @returns {Promise} API response
 */
export const getQuizzesByClass = async (assignedTo) => {
    try {
        const encodedClass = encodeURIComponent(assignedTo);
        const url = `${BASE_URL}/api/quizes/assigned-to/${encodedClass}`;
        console.log('Fetching quizzes from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch quizzes');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching quizzes'
        };
    }
};

/**
 * Get Quiz by Quiz Code API call
 * @param {string} quizCode - Quiz code
 * @returns {Promise} API response
 */
export const getQuizByCode = async (quizCode) => {
    try {
        const url = `${BASE_URL}/api/quizes/${quizCode}`;
        console.log('Fetching quiz from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch quiz');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching quiz'
        };
    }
};

/**
 * Submit Quiz API call
 * @param {Object} submissionData - Quiz submission data
 * @param {string} submissionData.quizeCode - Quiz code
 * @param {string} submissionData.studentCode - Student code
 * @param {Array} submissionData.answers - Array of answer objects with questionNo and answer
 * @returns {Promise} API response
 */
export const submitQuiz = async (submissionData) => {
    try {
        const url = `${BASE_URL}/api/quizes/submit`;
        console.log('Submitting quiz to:', url);
        console.log('Request payload:', submissionData);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(submissionData)
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit quiz');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while submitting quiz'
        };
    }
};

/**
 * Get Student Quiz Submission API call
 * @param {string} quizeCode - Quiz code
 * @param {string} studentCode - Student code
 * @returns {Promise} API response
 */
export const getStudentQuizSubmission = async (quizeCode, studentCode) => {
    try {
        const url = `${BASE_URL}/api/quizes/student-submission/${quizeCode}/${studentCode}`;
        console.log('Fetching student quiz submission from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch student quiz submission');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching student quiz submission'
        };
    }
};

/**
 * Get Submitted Students for Quiz API call
 * @param {string} quizeCode - Quiz code
 * @returns {Promise} API response
 */
export const getSubmittedStudentsForQuiz = async (quizeCode) => {
    try {
        const url = `${BASE_URL}/api/quizes/submitted-students/${quizeCode}`;
        console.log('Fetching submitted students for quiz from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch submitted students');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while fetching submitted students'
        };
    }
};
