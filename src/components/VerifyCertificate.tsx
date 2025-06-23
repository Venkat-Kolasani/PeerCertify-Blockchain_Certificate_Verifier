import React, { useState } from 'react';
import { Search, Shield, AlertCircle, CheckCircle, Clock, User, BookOpen, Award, Calendar, Copy } from 'lucide-react';
import { AlgorandService } from '../services/algorand';
import { VerificationResult } from '../types/certificate';

export const VerifyCertificate: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [walletInput, setWalletInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  // Demo certificates for easy testing
  const demoCertificates = [
    {
      id: 'cert_react_2024_001',
      name: 'Advanced React Development',
      student: 'Alice Johnson',
      issuer: 'TechAcademy Pro'
    },
    {
      id: 'cert_blockchain_2024_002',
      name: 'Blockchain Fundamentals & Smart Contracts',
      student: 'Bob Smith',
      issuer: 'CryptoUniversity'
    }
  ];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInput.trim()) return;

    setVerifying(true);
    setResult(null);

    try {
      const algorandService = AlgorandService.getInstance();
      const verificationResult = await algorandService.verifyCertificate(
        searchInput.trim(),
        walletInput.trim() || undefined
      );
      
      setResult(verificationResult);
    } catch (error) {
      setResult({
        isValid: false,
        certificate: null,
        tokenExists: false,
        ownershipVerified: false,
        message: 'Error occurred during verification',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDemoCertificateClick = (certificateId: string) => {
    setSearchInput(certificateId);
    setWalletInput('DEMO7XVFWK2JGHPQXNVQJDUMXC5NVGM6QJKM3HXLWMZPQJDUMXC5NVGM6Q');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = () => {
    if (!result) return null;
    
    if (result.isValid && result.ownershipVerified) {
      return <CheckCircle className="h-8 w-8 text-emerald-600" />;
    } else if (result.isValid && !result.ownershipVerified) {
      return <AlertCircle className="h-8 w-8 text-yellow-600" />;
    } else {
      return <AlertCircle className="h-8 w-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    if (!result) return '';
    
    if (result.isValid && result.ownershipVerified) {
      return 'border-emerald-200 bg-emerald-50';
    } else if (result.isValid && !result.ownershipVerified) {
      return 'border-yellow-200 bg-yellow-50';
    } else {
      return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Verify Certificate</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter a certificate ID to verify its authenticity on the Algorand blockchain. 
          Optionally include a wallet address to verify ownership.
        </p>
      </div>

      {/* Demo Certificates Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Award className="h-5 w-5 text-teal-600" />
            <span>Try Demo Certificates</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Click on any demo certificate below to automatically fill the verification form and test the feature.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoCertificates.map((cert) => (
              <div
                key={cert.id}
                onClick={() => handleDemoCertificateClick(cert.id)}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm group-hover:text-teal-700 transition-colors">
                    {cert.name}
                  </h4>
                  <Copy className="h-4 w-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Student: {cert.student}</p>
                <p className="text-xs text-gray-600 mb-2">Issuer: {cert.issuer}</p>
                <p className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded">
                  {cert.id}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
        <div className="p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Shield className="h-4 w-4" />
                <span>Certificate ID *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors pr-10"
                  placeholder="Enter certificate ID to verify"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(searchInput)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4" />
                <span>Wallet Address (Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors pr-10"
                  placeholder="Enter wallet address to verify ownership"
                />
                {walletInput && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(walletInput)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to verify certificate existence only
              </p>
            </div>

            <button
              type="submit"
              disabled={verifying || !searchInput.trim()}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 focus:ring-4 focus:ring-teal-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Verifying on Blockchain...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Verify Certificate</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div className={`rounded-2xl border-2 ${getStatusColor()} transition-all duration-300`}>
          <div className="p-8">
            <div className="flex items-start space-x-4 mb-6">
              {getStatusIcon()}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Verification Result
                </h3>
                <p className="text-gray-600">{result.message}</p>
              </div>
            </div>

            {result.certificate && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Certificate Details</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-emerald-700 font-medium">Verified on Blockchain</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Student Name</p>
                        <p className="font-medium text-gray-900">{result.certificate.studentName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Course Name</p>
                        <p className="font-medium text-gray-900">{result.certificate.courseName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Issued By</p>
                        <p className="font-medium text-gray-900">{result.certificate.issuerName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Completion Date</p>
                        <p className="font-medium text-gray-900">{result.certificate.completionDate}</p>
                      </div>
                    </div>

                    {result.certificate.metadata.duration && (
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium text-gray-900">{result.certificate.metadata.duration}</p>
                        </div>
                      </div>
                    )}

                    {result.certificate.metadata.grade && (
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Grade</p>
                          <p className="font-medium text-gray-900">{result.certificate.metadata.grade}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {result.certificate.metadata.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Course Description</p>
                    <p className="text-gray-700">{result.certificate.metadata.description}</p>
                  </div>
                )}

                {result.certificate.metadata.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Skills Acquired</p>
                    <div className="flex flex-wrap gap-2">
                      {result.certificate.metadata.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.certificate.tokenId && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Token ID: #{result.certificate.tokenId}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};