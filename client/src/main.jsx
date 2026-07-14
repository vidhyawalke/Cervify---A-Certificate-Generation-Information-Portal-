/**
 * @file main.jsx
 * @description React application entry point for Cervify.
 *
 * Mounts the root React component tree into the `#root` DOM element.
 * The AppProvider wraps the entire tree to supply global context (auth,
 * theme, navigation, and cached API data) to all child components.
 *
 * Global stylesheet (index.css) is imported here so it applies to the
 * full application unconditionally.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* AppProvider supplies token, user, theme, and all master data globally */}
        <AppProvider>
            <App />
        </AppProvider>
    </StrictMode>
);
