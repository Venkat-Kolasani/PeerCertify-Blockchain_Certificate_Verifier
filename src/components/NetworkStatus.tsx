import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { AlgorandService } from '../services/algorand';
import { AlgorandNetworkStatus } from '../types/certificate';

export const NetworkStatus: React.FC = () => {
  const [status, setStatus] = useState<AlgorandNetworkStatus>({
    connected: false,
    network: 'Checking...',
    nodeHealth: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkNetworkStatus();
    const interval = setInterval(checkNetworkStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const checkNetworkStatus = async () => {
    try {
      const algorandService = AlgorandService.getInstance();
      const networkStatus = await algorandService.getNetworkStatus();
      setStatus(networkStatus);
    } catch (error) {
      setStatus({
        connected: false,
        network: 'Error',
        nodeHealth: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) {
      return <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />;
    }
    
    if (status.connected && status.nodeHealth) {
      return <Wifi className="h-4 w-4 text-green-600" />;
    } else if (status.connected && !status.nodeHealth) {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    } else {
      return <WifiOff className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusText = () => {
    if (loading) return 'Checking...';
    
    if (status.connected && status.nodeHealth) {
      return 'Algorand Connected';
    } else if (status.connected && !status.nodeHealth) {
      return 'Algorand Issues';
    } else {
      return 'Algorand Offline';
    }
  };

  const getStatusColor = () => {
    if (loading) return 'text-gray-600';
    
    if (status.connected && status.nodeHealth) {
      return 'text-green-600';
    } else if (status.connected && !status.nodeHealth) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-white rounded-lg border border-gray-200 shadow-sm">
      {getStatusIcon()}
      <span className={`text-xs font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
};