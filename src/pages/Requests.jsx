import { useEffect, useState } from 'react';
import { getAllRequests, deleteRequest, getUserById } from '../api/requestsDb';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const navigate = useNavigate();

  useEffect(() => {
    getAllRequests().then(async (data) => {
      const enriched = await Promise.all(
        data.map(async (r) => {
          const user = await getUserById(r.userId);
          return { ...r, user };
        })
      );
      setRequests(enriched);
      setFiltered(enriched);
    });
  }, []);

  useEffect(() => {
    let result = [...requests];

    if (statusFilter !== 'All') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(term) ||
          r.user?.email?.toLowerCase().includes(term)
      );
    }

    setFiltered(result);
  }, [search, statusFilter, requests]);

  const handleDelete = async (id) => {
    toast.promise(
      deleteRequest(id).then(() =>
        setRequests((prev) => prev.filter((r) => r.id !== id))
      ),
      {
        loading: 'Deleting...',
        success: 'Request deleted',
        error: 'Failed to delete request',
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-moodark mb-6">Requests</h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Answered">Answered</option>
            <option value="Additional Information Required">Additional Information Required</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Request List */}
        <div className="grid gap-4">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white border rounded-xl shadow p-4 transform transition-transform hover:scale-[1.02] hover:shadow-lg duration-200 flex gap-4"
            >
              {req.imageUrls?.length > 0 && (
                <img
                  src={req.imageUrls[0]}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              )}
              <div className="flex-1 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    {req.name || 'Unknown Product'}
                  </h3>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>User:</strong> {req.user?.email || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    <strong>Status:</strong> {req.status}
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    <strong>Created:</strong>{' '}
                    {new Date(req.createdAt).toISOString().split('T')[0]}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="bg-moogreen text-white text-sm py-1 px-4 rounded hover:bg-moodark transition"
                  >
                    Answer
                  </button>
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="bg-red-500 text-white text-sm py-1 px-4 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-500 italic text-center mt-10">
              No matching requests.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
