import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/main.css';
import App from '../App';
import { ToastProvider } from '../contexts/ToastContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
    React.createElement(React.StrictMode, null,
        React.createElement(BrowserRouter, null,
            React.createElement(ToastProvider, null,
                React.createElement(App, null)
            )
        )
    )
);