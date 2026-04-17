import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import './i18n/config';

// Extract token from URL if present and store it
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
    localStorage.setItem('aai_token', token);
    urlParams.delete('token');
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
}

const storedToken = localStorage.getItem('aai_token') || localStorage.getItem('token') || localStorage.getItem('access_token');

if (storedToken && !localStorage.getItem('aai_token')) {
    localStorage.setItem('aai_token', storedToken); // Normalize
}

if (!storedToken) {
    // If we don't have a token, we must redirect to the reference project's login or show an error.
    // Assuming the reference project is on the same domain or port 8000 for local dev
    const loginUrl = window.location.port === '5000' || window.location.port === '5173' 
        ? `http://${window.location.hostname}:8000/accounts/local_login/` 
        : '/accounts/local_login/';
        
    window.location.href = loginUrl;
} else {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
}
