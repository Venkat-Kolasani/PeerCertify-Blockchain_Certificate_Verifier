import React, { useState } from 'react';
import { Award, Calendar, User, BookOpen, Upload, CheckCircle } from 'lucide-react';
import { Certificate } from '../types/certificate';
import { AlgorandService } from '../services/algorand';
import { useWallet } from '../hooks/useWallet';

export const MintCertificate: React.FC = () => {
  const { connected, address, connectWallet } = useWallet();
  const [formData, setFormData] = useState({
    studentName: '',
    courseName: '',
    issuerName: '',
    description: '',
    skills: '',
    duration: '',
    grade: '',
  });
  const [minting, setMinting] = useState(false);
  const [success, setSuccess] = useState<{ tokenId: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const generateCertificateId = () => {
    return `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      await connectWallet();
      return;
    }

    setMinting(true);
    setError(null);
    setSuccess(null);

    try {
      const certificate: Certificate = {
        id: generateCertificateId(),
        studentName: formData.studentName,
        courseName: formData.courseName,
        completionDate: new Date().toISOString().split('T')[0],
        issuerName: formData.issuerName,
        certificateHash: `hash_${Date.now()}`,
        metadata: {
          description: formData.description,
          issueDate: new Date().toISOString(),
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          duration: formData.duration,
          grade: formData.grade,
        },
      };

      const algorandService = AlgorandService.getInstance();
      const result = await algorandService.mintCertificate(certificate, address!);

      if (result.success) {
        setSuccess({ tokenId: result.tokenId! });
        setFormData({
          studentName: '',
          courseName: '',
          issuerName: '',
          description: '',
          skills: '',
          duration: '',
          grade: '',
        });
      } else {
        setError(result.error || 'Failed to mint certificate');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Mint New Certificate</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create a tamper-proof certificate NFT on the Algorand blockchain. 
          Once minted, the certificate can be verified by anyone without relying on third parties.
        </p>
      </div>

      {success && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Certificate Minted Successfully!</h3>
              <p className="text-green-700">Token ID: #{success.tokenId}</p>
              <p className="text-sm text-green-600 mt-1">
                Your certificate has been permanently recorded on the Algorand blockchain.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleMint} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4" />
                  <span>Student Name *</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter student's full name"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Course Name *</span>
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Award className="h-4 w-4" />
                  <span>Issuing Institution *</span>
                </label>
                <input
                  type="text"
                  name="issuerName"
                  value={formData.issuerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Institution or platform name"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Course Duration</span>
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 8 weeks, 40 hours"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Brief description of the course content and learning outcomes"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills Acquired
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="React, TypeScript, Blockchain (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade/Score
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="A+, 95%, Pass, etc."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={minting || !connected}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {minting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Minting Certificate...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>{connected ? 'Mint Certificate NFT' : 'Connect Wallet to Mint'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};