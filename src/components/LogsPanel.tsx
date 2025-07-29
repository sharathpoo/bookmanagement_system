import React from 'react';
import { Activity, Clock, Globe, Monitor, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useLogs } from '../hooks/useLogs';
import type { LogEntry } from '../types';

interface LogsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ isOpen, onClose }) => {
  const { logs, loading, error, refetch } = useLogs(isOpen, 3000);

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 bg-green-50';
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600 bg-blue-50';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-blue-600 bg-blue-50';
      case 'POST': return 'text-green-600 bg-green-50';
      case 'PUT': return 'text-yellow-600 bg-yellow-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatResponseTime = (responseTime: string) => {
    const ms = parseInt(responseTime.replace('ms', ''));
    if (ms < 100) return 'text-green-600';
    if (ms < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Activity className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Request Logs</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {logs.length} requests
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refetch}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading logs...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12 text-red-600">
              <AlertCircle size={20} className="mr-2" />
              <span>Failed to load logs: {error}</span>
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Monitor size={20} className="mr-2" />
              <span>No request logs available</span>
            </div>
          )}

          {!loading && !error && logs.length > 0 && (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(log.method)}`}>
                        {log.method}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                      <span className={`text-sm font-mono ${formatResponseTime(log.responseTime)}`}>
                        {log.responseTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-900">{log.url}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Globe size={12} />
                      <span>{log.ip}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Monitor size={12} />
                      <span className="truncate max-w-xs" title={log.userAgent}>
                        {log.userAgent}
                      </span>
                    </div>
                  </div>

                  {log.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <div className="font-medium text-red-800">Error:</div>
                      <div className="text-red-600">{log.error.message}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};