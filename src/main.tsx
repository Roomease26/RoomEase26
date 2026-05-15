import {StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-[#5469D4] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[#697386] font-medium pulse">Starting RoomEase...</p>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);
