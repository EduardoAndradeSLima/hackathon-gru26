import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

export function useResource(path, initialQuery = {}) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(initialQuery);

  const load = useCallback(async (override = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(path, { params: { ...query, ...override } });
      setItems(data.data || data);
      setMeta(data.meta || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [path, query]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(payload) {
    await api.post(path, payload);
    await load();
  }

  async function update(id, payload) {
    await api.put(`${path}/${id}`, payload);
    await load();
  }

  async function remove(id) {
    await api.delete(`${path}/${id}`);
    await load();
  }

  return { items, meta, loading, error, query, setQuery, load, create, update, remove };
}
