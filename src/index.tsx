import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoutes from './components/AppRoutes';
import reportWebVitals from './reportWebVitals';
import { ToastContainer } from 'react-toastify';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ToastContainer />
    <AppRoutes />
  </React.StrictMode>
);
reportWebVitals();