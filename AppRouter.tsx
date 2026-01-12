import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RecruitmentInterface } from './components/RecruitmentInterface';
import { SalesInterface } from './components/SalesInterface';
import App from './App';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Interface de recrutement */}
        <Route 
          path="/recruitment" 
          element={
            <RecruitmentInterface 
              linkId={new URLSearchParams(window.location.search).get('linkId') || undefined}
              referrerId={new URLSearchParams(window.location.search).get('referrerId') || undefined}
            />
          } 
        />
        
        {/* Interface de vente */}
        <Route 
          path="/sales" 
          element={
            <SalesInterface 
              customerId={new URLSearchParams(window.location.search).get('customerId') || undefined}
            />
          } 
        />
        
        {/* Application principale */}
        <Route path="/app/*" element={<App />} />
        
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/app" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
