import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { MintCertificate } from './components/MintCertificate';
import { VerifyCertificate } from './components/VerifyCertificate';
import { CertificateViewer } from './components/CertificateViewer';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';

type Page = 'home' | 'mint' | 'verify' | 'dashboard' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    // Check if there's a verification query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const verifyParam = urlParams.get('verify');
    
    if (verifyParam) {
      setCurrentPage('verify');
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onPageChange={setCurrentPage} />;
      case 'mint':
        return <MintCertificate />;
      case 'verify':
        return <VerifyCertificate />;
      case 'dashboard':
        return <Dashboard />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <LandingPage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Routes>
          {/* Certificate viewer route */}
          <Route path="/cert/:id" element={<CertificateViewer />} />
          
          {/* Main app routes */}
          <Route path="/*" element={
            <>
              {currentPage !== 'home' && (
                <Header currentPage={currentPage} onPageChange={setCurrentPage} />
              )}
              
              <main className={currentPage !== 'home' ? 'pb-16' : ''}>
                {renderPage()}
              </main>

              {currentPage !== 'home' && (
                <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200 mt-16">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">
                        Built on Algorand blockchain for trustless certificate verification
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        © 2024 PeerCertify. Empowering education through blockchain technology.
                      </p>
                    </div>
                  </div>
                </footer>
              )}
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;