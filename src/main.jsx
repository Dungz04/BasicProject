import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{
                backgroundColor: 'var(--color-secondary)',
                color: '#ffffff',
                borderLeft: '4px solid var(--color-primary)',
                fontFamily: "'Lexend', sans-serif",
                zIndex: 9999,
            }}
            progressStyle={{
                background: 'var(--color-primary)',
            }}
            containerStyle={{
                zIndex: 9999,
            }}
        />
    </StrictMode>
);