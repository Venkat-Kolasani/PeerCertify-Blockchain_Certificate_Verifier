import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, CheckCircle, Calendar, User, BookOpen, Award, ExternalLink, AlertCircle } from 'lucide-react';
import { AlgorandService } from '../services/algorand';
import { Certificate } from '../types/certificate';

export const CertificateViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCertificate(id);
    }
  }, [id]);

  const loadCertificate = async (certificateId: string) => {
    setLoading(true);
    setError(null);

    try {
      const algorandService = AlgorandService.getInstance();
      const result = await algorandService.verifyCertificate(certificateId);
      
      if (result.isValid && result.certificate) {
        setCertificate(result.certificate);
      } else {
        setError('Certificate not found or invalid');
      }
    } catch (err) {
      setError('Error loading certificate');
    } finally {
      setLoading(false);
    }
  };

  const openAlgorandExplorer = () => {
    if (certificate?.tokenId) {
      // In a real implementation, this would open the actual Algorand explorer
      window.open(`https://testnet.algoexplorer.io/asset/${certificate.tokenId}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificate from blockchain...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificate Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || 'The certificate you\'re looking for could not be found on the blockchain.'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <span className="text-lg font-semibold text-green-700">Verified Certificate</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Certificate Viewer</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This certificate has been verified on the Algorand blockchain and is guaranteed to be authentic and tamper-proof.
          </p>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Award className="h-12 w-12" />
              <h2 className="text-3xl font-bold">Certificate of Completion</h2>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-100">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Verified on Algorand Blockchain</span>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="p-12">
            <div className="text-center mb-12">
              <p className="text-lg text-gray-600 mb-4">This is to certify that</p>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">{certificate.studentName}</h3>
              <p className="text-lg text-gray-600 mb-2">has successfully completed the course</p>
              <h4 className="text-2xl font-semibold text-blue-600 mb-6">{certificate.courseName}</h4>
              <p className="text-gray-600">
                issued by <span className="font-semibold text-gray-900">{certificate.issuerName}</span>
              </p>
            </div>

            {/* Certificate Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Completion Date</p>
                    <p className="font-semibold text-gray-900">{certificate.completionDate}</p>
                  </div>
                </div>

                {certificate.metadata.duration && (
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Course Duration</p>
                      <p className="font-semibold text-gray-900">{certificate.metadata.duration}</p>
                    </div>
                  </div>
                )}

                {certificate.metadata.grade && (
                  <div className="flex items-center space-x-3">
                    <Award className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Grade</p>
                      <p className="font-semibold text-gray-900">{certificate.metadata.grade}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {certificate.tokenId && (
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">NFT Token ID</p>
                      <p className="font-semibold text-gray-900">#{certificate.tokenId}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <User className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(certificate.metadata.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-green-700">Blockchain Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Description */}
            {certificate.metadata.description && (
              <div className="mb-8">
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Course Description</h5>
                <p className="text-gray-700 leading-relaxed">{certificate.metadata.description}</p>
              </div>
            )}

            {/* Skills */}
            {certificate.metadata.skills.length > 0 && (
              <div className="mb-8">
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Skills Acquired</h5>
                <div className="flex flex-wrap gap-2">
                  {certificate.metadata.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Actions */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={openAlgorandExplorer}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>View on Algorand Explorer</span>
                </button>
                
                <button
                  onClick={() => window.location.href = '/verify'}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <Shield className="h-5 w-5" />
                  <span>Verify Another Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h6 className="font-semibold text-gray-900 mb-2">Blockchain Secured</h6>
            <p className="text-sm text-gray-600">Stored permanently on Algorand blockchain</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h6 className="font-semibold text-gray-900 mb-2">Tamper-Proof</h6>
            <p className="text-sm text-gray-600">Cannot be altered or forged</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h6 className="font-semibold text-gray-900 mb-2">Instantly Verifiable</h6>
            <p className="text-sm text-gray-600">Verify authenticity in seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};