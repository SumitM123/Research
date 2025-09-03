import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingPage from './pages/loadingPage.jsx';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FilesProvider } from './Contexts/filesContext.js';
import {ColumnInfoProvider} from './Contexts/columnInfoContext.js';
import CollectDetails from './pages/collectDetails.jsx'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FilesProvider>
      <ColumnInfoProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="/collectDetails" element={<CollectDetails/>} />
          </Routes>
        </BrowserRouter>
      </ColumnInfoProvider>
    </FilesProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
