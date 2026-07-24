import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Log environment on startup
console.log('🚀 App started');
console.log('📡 API URL:', process.env.REACT_APP_API_URL);
console.log('🔌 WS URL:', process.env.REACT_APP_WS_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
