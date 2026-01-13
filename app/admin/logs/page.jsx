'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import { History, Search, Filter, ChevronLeft, ChevronRight, Loader2, Eye, RotateCcw } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs(pagination.page);
  }, [pagination.page]);

  const fetchLogs = async (page) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/audit-logs?page=${page}&limit=${pagination.limit}`);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const formatAction = (action) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-700 border-green-200',
      UPDATE: 'bg-blue-100 text-blue-700 border-blue-200',
      DELETE: 'bg-red-100 text-red-700 border-red-200',
      LOGIN: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors[action] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Audit Logs"
          description="Track system activity and changes."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logs List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Entity</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">User</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading logs...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No logs found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr 
                        key={log.id} 
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedLog?.id === log.id ? 'bg-blue-50/50' : ''}`}
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-4 py-3">{formatAction(log.action)}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {log.entity} <span className="text-slate-400 text-xs">#{log.entityId}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {log.user?.name || log.user?.email || 'System'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-slate-400 hover:text-indigo-600">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedLog ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Log Details</h3>
                  <span className="text-xs text-slate-400">ID: {selectedLog.id}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Action</label>
                    <div className="flex items-center gap-2">
                      {formatAction(selectedLog.action)}
                      <span className="text-sm text-slate-700 font-medium">on {selectedLog.entity}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">User</label>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                        {selectedLog.user?.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <span className="text-sm text-slate-700">{selectedLog.user?.name || 'System'}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedLog.user?.email}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Changes</label>
                    <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-[10px] text-slate-300 font-mono">
                        {JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Undo Button Placeholder - Implementation would require specific logic per entity */}
                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
                      title="Undo functionality requires complex state management"
                    >
                      <RotateCcw size={16} />
                      Undo Changes (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400 h-full flex flex-col items-center justify-center min-h-[300px]">
                <History size={32} className="mb-3 opacity-20" />
                <p>Select a log entry to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
