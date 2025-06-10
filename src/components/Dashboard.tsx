import React, { useState, useEffect } from 'react';
import { Award, Calendar, User, BookOpen, ExternalLink, Eye } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { AlgorandService } from '../services/algorand';
import { Certificate } from '../types/certificate';

export const Dashboard: React.FC = () => {
  const { connected, address, connectWallet } = useWallet();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    if (connected && address) {
      loadCertificates();
    }
  }, [connected, address]);

  const loadCertificates = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const algorandService = AlgorandService.getInstance();
      const userCertificates = await algorandService.getCertificatesByWallet(address);
      setCertificates(userCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareableLink = (certificateId: string) => {
    return `${window.location.origin}?verify=${certificateId}`;
  };

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Connect your wallet to view and manage your certificates on the Algorand blockchain.
          </p>
          <button
            onClick={connectWallet}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h2>
          <p className="text-gray-600">
            Manage and share your blockchain-verified certificates
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Connected Wallet</p>
          <p className="font-mono text-sm text-gray-800">
            {address?.slice(0, 6)}...{address?.slice(-6)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">No Certificates Found</h3>
          <p className="text-gray-600 mb-8">
            You don't have any certificates yet. Start by minting your first certificate!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      #{certificate.tokenId}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Verified</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {certificate.courseName}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{certificate.studentName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{certificate.issuerName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{certificate.completionDate}</span>
                  </div>
                </div>

                {certificate.metadata.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {certificate.metadata.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {certificate.metadata.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{certificate.metadata.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedCertificate(certificate)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => {
                      const link = generateShareableLink(certificate.id);
                      navigator.clipboard.writeText(link);
                      // Could add toast notification here
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Detail Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Certificate Details</h3>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Student Name</p>
                    <p className="font-medium text-gray-900">{selectedCertificate.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Token ID</p>
                    <p className="font-medium text-gray-900">#{selectedCertificate.tokenId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium text-gray-900">{selectedCertificate.courseName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issuer</p>
                    <p className="font-medium text-gray-900">{selectedCertificate.issuerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completion Date</p>
                    <p className="font-medium text-gray-900">{selectedCertificate.completionDate}</p>
                  </div>
                  {selectedCertificate.metadata.grade && (
                    <div>
                      <p className="text-sm text-gray-500">Grade</p>
                      <p className="font-medium text-gray-900">{selectedCertificate.metadata.grade}</p>
                    </div>
                  )}
                </div>

                {selectedCertificate.metadata.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-gray-700">{selectedCertificate.metadata.description}</p>
                  </div>
                )}

                {selectedCertificate.metadata.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Skills Acquired</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCertificate.metadata.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const link = generateShareableLink(selectedCertificate.id);
                      navigator.clipboard.writeText(link);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Copy Shareable Link</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};