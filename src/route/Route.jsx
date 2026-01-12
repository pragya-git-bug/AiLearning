import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '../pages/landingPages/home/Home';
import Login from '../pages/auth/loginPage/Login';
import StudentDashbord from '../pages/student/dashbord/StudentDashbord';
import StuAssignment from '../pages/student/assignments/StuAssignment';
import AttemptAssignments from '../pages/student/assignments/attemptAssignments';
import Reports from '../pages/student/reports/Reports';
import StuQuiz from '../pages/student/quizes/StuQuiz';
import AttemptQuiz from '../pages/student/quizes/attemptQuiz';
import Layout from '../components/layout/Layout';
import TeacherDashbord from '../pages/teachers/dashboard/TeacherDashbord';
import TeachAssignment from '../pages/teachers/assignments/TeachAssignment';
import CreateAssignments from '../pages/teachers/assignments/createAssignments/CreateAssignments';
import SubmittedStudents from '../pages/teachers/assignments/viewSubmissions/SubmittedStudents/SubmittedStudents';
import ReviewAssignment from '../pages/teachers/assignments/viewSubmissions/reviewAssignment/ReviewAssignment';
import TeachQuiz from '../pages/teachers/quizes/TeachQuiz';
import CreateQuizes from '../pages/teachers/quizes/createQuizes/CreateQuizes';
import QuizResults from '../pages/teachers/quizes/viewResults/QuizResults';


const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/student',
        element: <Layout />,
        children: [

            //student routes
            {
                path: 'dashboard',
                element: <StudentDashbord />
            },
            {
                path: 'assignments',
                element: <StuAssignment />
            },
            {
                path: 'assignments/attempt/:assignmentCode/:assignmentName',
                element: <AttemptAssignments />
            },
            {
                path: 'quizzes',
                element: <StuQuiz />
            },
            {
                path: 'quizzes/attempt/:quizeCode/:quizName',
                element: <AttemptQuiz />
            },
            {
                path: 'quizzes/view/:quizeCode/:quizName',
                element: <AttemptQuiz />
            },
            {
                path: 'reports',
                element: <Reports />
            },
        ]
    },
    {
        path: '/teacher',
        element: <Layout />,
        children: [
            //student routes
            {
                path: 'dashboard',
                element: <TeacherDashbord />
            },
            {
                path: 'assignments',
                element: <TeachAssignment />
            },
            {
                path: 'assignments/create',
                element: <CreateAssignments />
            },
            {
                path: 'assignments/submissions/:assignmentCode/:assignmentName',
                element: <SubmittedStudents />
            },
            {
                path: 'assignments/review/:assignmentCode/:studentCode',
                element: <ReviewAssignment />
            },
            {
                path: 'quizzes',
                element: <TeachQuiz />
            },
            {
                path: 'quizzes/create',
                element: <CreateQuizes />
            },
            {
                path: 'quizzes/results/:quizeCode/:quizName',
                element: <QuizResults />
            },
        ]
    }



])


const Route = () => {
  return <RouterProvider router={router} />;
};

export default Route;