"use client";

import { FaCheck } from "react-icons/fa";

export default function EntrantTable({ entrants, payments, onTogglePayment, searchParams, onSearchChange }) {
  if (!entrants || entrants.length === 0) return null;

  // Merge the payments with startgg entrants
  // start.gg ID is nested as participant -> id
  const enhancedEntrants = entrants.map((entrant) => {
    // Participants array usually has 1 person for singles. 
    // We'll flatten gamerTag for easy display.
    const tag = entrant.participants?.[0]?.gamerTag || 'Unknown Player';
    const rawId = entrant.id.toString();
    const isPaid = payments.find(p => p.entrantId === rawId)?.isPaid || false;
    
    return {
      id: rawId,
      tag,
      isPaid
    };
  });

  // Filter based on search
  const filtered = enhancedEntrants.filter(e => 
    e.tag.toLowerCase().includes(searchParams.toLowerCase())
  );

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="search-container glass-panel" style={{ padding: '16px' }}>
        <input 
          type="text" 
          placeholder="Search entrants by tag..." 
          value={searchParams}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-dim)' }}>
          {filtered.length} found
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>Paid</th>
              <th>Player Tag</th>
              <th>Entrant ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(entrant => (
              <tr key={entrant.id}>
                <td style={{ textAlign: 'center' }}>
                  <div 
                    className={`checkbox-wrapper ${entrant.isPaid ? 'paid' : ''}`}
                    onClick={() => onTogglePayment(entrant.id, !entrant.isPaid)}
                  ></div>
                </td>
                <td style={{ fontWeight: 600, color: '#fff' }}>{entrant.tag}</td>
                <td style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{entrant.id}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                  No entrants matched your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
