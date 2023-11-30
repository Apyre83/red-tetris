// reducers/index.js

import { combineReducers } from 'redux';
import socketReducer from './socketReducer';

const rootReducer = combineReducers({
    socket: socketReducer
    // autres réducteurs...
});

export default rootReducer;

