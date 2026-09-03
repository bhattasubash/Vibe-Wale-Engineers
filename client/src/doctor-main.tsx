import React from 'react';
import ReactDOM from 'react-dom/client';
import { DoctorApp } from './DoctorApp';
import './index.css';

ReactDOM.createRoot(document.getElementById('doctor-root')!).render(
  <React.StrictMode>
    <DoctorApp />
  </React.StrictMode>
);
