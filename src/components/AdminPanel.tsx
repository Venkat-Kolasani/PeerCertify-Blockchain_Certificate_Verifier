import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Search, Filter, Calendar, Award, Users, TrendingUp } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { AlgorandService } from '../services/algorand';
import { Certificate } from '../types/certificate';

export const AdminPanel: React.FC = () => {
  const { connected, address, connectWallet } = useWallet();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    totalCertificates: 0,
    thisMonth: 0,
    uniqueStudents: 0,
    uniqueCourses: 0,
  });

  useEffect(() => {
    if (connected && address) {
      loadCertificates();
    }
  }, [connected, address]);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, dateFilter]);

  const loadCertificates = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const algorandService = AlgorandService.getInstance();
      const userCertificates = await algorandService.getCertificatesByWallet(address);
      setCertificates(userCertificates);
      calculateStats(userCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (certs: Certificate[]) => {
    const now = new Date();
    const thisMonth = certs.filter(cert => {
      const issueDate = new Date(cert.metadata.issueDate);
      return issueDate.getMonth() === now.getMonth() && issueDate.getFullYear() === now.getFullYear();
    });

    const uniqueStudents = new Set(certs.map(cert => cert.studentName)).size;
    const uniqueCourses = new Set(certs.map(cert => cert.courseName)).size;

    setStats({
      totalCertificates: certs.length,
      thisMonth: thisMonth.length,
      uniqueStudents,
      uniqueCourses,
    });
  };

  const filterCertificates = () => {
    let filtered = certificates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(cert => {
        const issueDate = new Date(cert.metadata.issueDate);
        switch (dateFilter) {
          case 'today':
            return issueDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return issueDate >= weekAgo;
          case 'month':
            return issueDate.getMonth() === now.getMonth() && issueDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredCertificates(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Student Name', 'Course Name', 'Issuer', 'Completion Date', 'Token ID', 'Grade'];
    const csvContent = [
      headers.join(','),
      ...filteredCertificates.map(cert => [
        cert.studentName,
        cert.courseName,
        cert.issuerName,
        cert.completionDate,
        cert.tokenId || '',
        cert.metadata.grade || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel Access</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Connect your wallet to access the admin panel and view certificate analytics.
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h2>
          <p className="text-gray-600">
            Manage and analyze your issued certificates
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Certificates</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCertificates}</p>
            </div>
            <Award className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unique Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.uniqueStudents}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unique Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.uniqueCourses}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Issued Certificates ({filteredCertificates.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-16">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Found</h4>
            <p className="text-gray-600">
              {searchTerm || dateFilter !== 'all' 
                ? 'No certificates match your current filters.' 
                : 'You haven\'t issued any certificates yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertificates.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{certificate.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{certificate.courseName}</div>
                      <div className="text-sm text-gray-500">{certificate.issuerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {certificate.completionDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{certificate.tokenId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {certificate.metadata.grade || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};