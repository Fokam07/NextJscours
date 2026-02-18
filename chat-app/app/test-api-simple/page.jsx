// app/test-api-simple/page.jsx
'use client';

import { useAuth } from '../../frontend/hooks/useAuth.js';
import { useState } from 'react';

export default function TestAPISimple() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('User ID:', user?.id);
      
      const res = await fetch('/api/roles', {
        headers: {
          'x-user-id': user.id,
        },
      });

      console.log('Status:', res.status);
      const data = await res.json();
      console.log('Data:', data);

      setResult({
        success: res.ok,
        status: res.status,
        data,
      });
    } catch (err) {
      setResult({
        success: false,
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test API Roles</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>User ID:</strong> {user?.id || 'Non connecté'}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
      </div>

      <button
        onClick={testAPI}
        disabled={!user || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
      >
        {loading ? 'Test en cours...' : 'Tester /api/roles'}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="font-bold">
            {result.success ? '✅ Succès!' : `❌ Erreur ${result.status}`}
          </p>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}