import { configureStore, combineReducers } from '@reduxjs/toolkit'
import userCredentialReducer from '../slices/credencials/Credential'
import { assignmentsSlice } from '../slices/assignments/Assignments'

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage,
}

// Combine reducers into a single reducer function
const rootReducer = combineReducers({
  userData: userCredentialReducer,
  assignments: assignmentsSlice.reducer
})

// Persist the combined reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer
})

export const persistor = persistStore(store)