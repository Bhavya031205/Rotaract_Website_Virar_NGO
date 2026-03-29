import { useEffect, useState } from 'react';
import axios from '../../api/axios';

interface LogEntry {
  id: number;
  name: string;
  email: string;
  role: string;
  login_time: string;
  ip_address: string;
  device_info: string;
}

const ActivityLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/logs');
        setLogs(res.data);
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Helper to make the User Agent string readable
  const parseDevice = (agent: string) => {
    if (agent.includes("Windows")) return "Windows PC";
    if (agent.includes("Macintosh")) return "Mac";
    if (agent.includes("Linux")) return "Linux PC";
    if (agent.includes("Android")) return "Android Mobile";
    if (agent.includes("iPhone")) return "iPhone";
    return "Unknown Device";
  };

  if (loading) return <div className="p-6">Loading activity...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Live Activity Monitor</h1>
      <p className="text-gray-500 mb-6">Real-time tracking of user logins and sessions.</p>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device Info</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{log.name}</div>
                  <div className="text-sm text-gray-500">{log.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    log.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {log.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.login_time).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.device_info}>
                  <span className="font-bold text-gray-700 block">{parseDevice(log.device_info)}</span>
                  <span className="text-xs">{log.device_info.substring(0, 50)}...</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {log.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="p-10 text-center text-gray-500">No activity recorded yet.</div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;