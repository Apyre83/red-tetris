// reducers/index.js

import { combineReducers } from 'redux';
import socketReducer from './socketReducer';
import authReducer from './authReducer';

const rootReducer = combineReducers({
    socket: socketReducer,
    auth: authReducer,
});

export default rootReducer;
