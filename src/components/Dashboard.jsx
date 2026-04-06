"use client";

import { useEffect, useState } from "react";
import EntrantTable from "./EntrantTable";

export default function Dashboard() {
  const [apiKey, setApiKey] = useState("");
  const [eventSlug, setEventSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [eventName, setEventName] = useState("");
  const [eventId, setEventId] = useState(null);
  const [entrants, setEntrants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('startgg_api_key');
    if (saved) setApiKey(saved);
  }, []);

  const handleFetch = async () => {
    if (!apiKey || !eventSlug) return;
    
    setLoading(true);
    setError(null);
    localStorage.setItem('startgg_api_key', apiKey);

    try {
      const resData = await fetch('/api/fetchEntrants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, eventSlug })
      });

      const json = await resData.json();

      if (!resData.ok) {
        throw new Error(json.error || 'Failed to fetch from Start.gg');
      }

      setEventName(`${json.event.tournament.name} - ${json.event.name}`);
      setEventId(json.event.id);
      setEntrants(json.event.entrants.nodes);
      setTotalCount(json.event.entrants.pageInfo.total);

      const dbRes = await fetch(`/api/payments?eventId=${json.event.id}`);
      const dbJson = await dbRes.json();
      
      if (dbRes.ok) {
        setPayments(dbJson);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayment = async (entrantId, isPaid) => {
    if (!eventId) return;

    try {
      // Optimistic visual update
      setPayments(prev => {
        const exists = prev.find(p => p.entrantId === entrantId);
        if (exists) {
          return prev.map(p => p.entrantId === entrantId ? { ...p, isPaid } : p);
        }
        return [...prev, { entrantId, isPaid }];
      });

      // Write to DB
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entrantId,
          eventId: eventId.toString(),
          isPaid
        })
      });

      if (!res.ok) {
        throw new Error();
      }
    } catch(e) {
      // Revert optimism simply
      handleFetch();
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 className="title">Tracker Dashboard</h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Sync Start.gg entrants to the SQLite payment database seamlessly.</p>
      
      <div className="glass-panel">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Start.gg API Key</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              placeholder="Paste developer token here..."
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Event URL or Slug</label>
            <input 
              type="text" 
              value={eventSlug} 
              onChange={e => setEventSlug(e.target.value)} 
              placeholder="e.g. tournament/xyz/event/melee-singles"
            />
          </div>
        </div>
        <button onClick={handleFetch} disabled={loading || !apiKey || !eventSlug}>
          {loading ? 'Fetching...' : 'Load Entrants ->'}
        </button>

        {error && <div style={{ marginTop: '1rem', color: '#ff7a93' }}>Error: {error}</div>}
      </div>

      {eventName && <h2 style={{marginTop: '2rem', color: '#fff'}}>{eventName} ({totalCount} Entrants)</h2>}

      <EntrantTable 
        entrants={entrants} 
        payments={payments} 
        onTogglePayment={handleTogglePayment}
        searchParams={searchFilter}
        onSearchChange={setSearchFilter}
      />
    </div>
  );
}
