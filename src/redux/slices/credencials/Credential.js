import { createSlice } from '@reduxjs/toolkit'

// Load user data from localStorage on initialization
const loadUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return {
        currentUser: userData,
        isAuthenticated: true
      };
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
  }
  return {
    currentUser: null,
    isAuthenticated: false
  };
};

const storedUserData = loadUserFromStorage();

const initialState = {
  users: [
    {
        name: 'Hemant Yadav',
        email: 'hemantyadav@gmail.com',
        number: '9876543210',
        password: 'password123',
        role: 'student',
        className: 'Eirth class'
    },
    {
        name: 'John Doe',
        email: 'johndoe@gmail.com',
        number: '9876543211',
        password: 'password456',
        role: 'teacher',
        className: 'Eighth class'
    }
  ],
  currentUser: storedUserData.currentUser,
  isAuthenticated: storedUserData.isAuthenticated
}

export const userCredentialSlice = createSlice({
  name: 'userCredential',
  initialState,
  reducers: {

    // Add new user
    addUser: (state, action) => {
      state.users.push(action.payload); 
    },

    // Check login credentials and set current user
    checkCredentials: (state, action) => {
      const { email, password, number } = action.payload;
      // Check by email or phone number
      const credential = email || number;
      const user = state.users.find(
        u => {
          // Check if credential matches email, number, or if email is used as credential
          const emailMatch = u.email === credential || u.email === email;
          const numberMatch = u.number === credential || u.number === number;
          const passwordMatch = u.password === password;
          return (emailMatch || numberMatch) && passwordMatch;
        }
      );
      
      if (user) {
        state.currentUser = user;
        state.isAuthenticated = true;
      } else {
        state.currentUser = null;
        state.isAuthenticated = false;
      }
    },

    // Set user from API response
    setUserFromAPI: (state, action) => {
      const apiData = action.payload;
      // Map API response to our user format
      const userData = {
        fullName: apiData.fullName || apiData.name,
        email: apiData.email,
        mobileNumber: apiData.mobileNumber || apiData.number,
        role: apiData.role?.toLowerCase() || 'student',
        className: apiData.className || '',
        userCode: apiData.userCode,
        _id: apiData._id,
        // Keep backward compatibility
        name: apiData.fullName || apiData.name,
        number: apiData.mobileNumber || apiData.number
      };
      
      state.currentUser = userData;
      state.isAuthenticated = true;
      
      // Save to localStorage
      try {
        const dataToStore = {
          fullName: userData.fullName,
          email: userData.email,
          mobileNumber: userData.mobileNumber,
          role: userData.role,
          className: userData.className,
          userCode: userData.userCode
        };
        localStorage.setItem('userData', JSON.stringify(dataToStore));
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
    },

    // Logout user
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      // Clear localStorage
      try {
        localStorage.removeItem('userData');
      } catch (error) {
        console.error('Error clearing user from localStorage:', error);
      }
    },

    // Get all users
    getAllUsers: (state) => {
      return state.users;
    }

  },
})

export const { addUser, checkCredentials, setUserFromAPI, logout, getAllUsers } = userCredentialSlice.actions;

export default userCredentialSlice.reducer;

