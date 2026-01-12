import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  assignments: [
    {
      assignmentName: 'Math Assignment 1',
      subject: 'Mathematics',
      dueDate: '2024-09-15',
      status: 'pending',
      assignedTo: 'class A',
      overallScore: null,
      submissionDate: null,
      teacherComments: null,
      summury: 'This assignment covers algebra and geometry topics.',
      topicUnderCovered: ['Algebra', 'Geometry'],
      resources: [
        { type: 'pdf', link: 'http://example.com/math_assignment_1.pdf' },
      ],
      needPractice: [],
      questions: [
        {
          id: 1,
          question: 'Sample question',
          type: 'short-answer',
          options: null,
          correctAnswer: null,
          difficulty: 'medium'
        }
      ],
      assignment: {
        question: '',
        asnsewer: '',
        aiSuggestions: '',
        rate: '' // low | medium | high
      }
    }
  ],
}

export const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {

    // ➕ Add new assignment
    addAssignment: (state, action) => {
      state.assignments.push(action.payload);
    },

    // Get all assignments
    selectAllAssignments: (state) => {
      return state.assignments;
    },

    // Filter by subject
    selectAssignmentsBySubject: (state, action) => {
      return state.assignments.filter(
        assignment => assignment.subject === action.payload
      );
    },

    // Filter by status
    selectAssignmentsByStatus: (state, action) => {
      return state.assignments.filter(
        assignment => assignment.status === action.payload
      );
    }

  },
})

export const { addAssignment ,selectAllAssignments, selectAssignmentsBySubject, selectAssignmentsByStatus} = assignmentsSlice.actions;

export default assignmentsSlice.reducer;
