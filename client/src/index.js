import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './App';
import { ScreenProvider } from './contexts/ScreenContext'
import { LoggedProvider } from './contexts/LoggedContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ScreenProvider>
      <LoggedProvider>
        <App />
      </LoggedProvider>
    </ScreenProvider >
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
