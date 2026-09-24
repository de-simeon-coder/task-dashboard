import { useState } from 'react';

interface SalesRecord {
  id: number;
  product: string;
  category: string;
  sales: number;
  units: number;
  region: string;
}

const initialDatabase: SalesRecord[] = [
  { id: 1, product: 'Widget Alpha', category: 'Electronics', sales: 1200, units: 15, region: 'North' },
  { id: 2, product: 'Gadget Beta', category: 'Electronics', sales: 850, units: 10, region: 'South' },
  { id: 3, product: 'Pro Chair', category: 'Furniture', sales: 450, units: 3, region: 'East' },
  { id: 4, product: 'Desk Lamp', category: 'Furniture', sales: 210, units: 7, region: 'North' },
  { id: 5, product: 'USB Hub', category: 'Accessories', sales: 180, units: 12, region: 'West' },
  { id: 6, product: 'Monitor 4K', category: 'Electronics', sales: 1500, units: 5, region: 'East' },
];

export const SqlModule = () => {
  const [query, setQuery] = useState<string>('SELECT * FROM sales_data WHERE sales > 300 ORDER BY sales DESC;');
  const [results, setResults] = useState<SalesRecord[]>(initialDatabase);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const runQuery = () => {
    setErrorMessage('');
    const cleanQuery = query.trim().replace(/;$/, '');

    try {
      if (!cleanQuery.toLowerCase().startsWith('select')) {
        throw new Error('Only SELECT queries are supported in this sandbox.');
      }

      let filteredData = [...initialDatabase];

      // Parse WHERE clause
      if (cleanQuery.toLowerCase().includes('where')) {
        const whereClause = cleanQuery.split(/where/i)[1].split(/order by|group by/i)[0].trim();
        if (whereClause.includes('sales >')) {
          const val = Number(whereClause.split('sales >')[1].trim());
          if (!isNaN(val)) filteredData = filteredData.filter((item) => item.sales > val);
        } else if (whereClause.includes('sales <')) {
          const val = Number(whereClause.split('sales <')[1].trim());
          if (!isNaN(val)) filteredData = filteredData.filter((item) => item.sales < val);
        } else if (whereClause.includes('category =')) {
          const cat = whereClause.split('category =')[1].trim().replace(/['"]/g, '');
          filteredData = filteredData.filter((item) => item.category.toLowerCase() === cat.toLowerCase());
        }
      }

      // Parse ORDER BY clause
      if (cleanQuery.toLowerCase().includes('order by')) {
        const orderByClause = cleanQuery.split(/order by/i)[1].trim();
        if (orderByClause.includes('sales DESC')) {
          filteredData.sort((a, b) => b.sales - a.sales);
        } else if (orderByClause.includes('sales ASC')) {
          filteredData.sort((a, b) => a.sales - b.sales);
        }
      }

      setResults(filteredData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error executing query.');
    }
  };

  const presetQueries = [
    { label: 'All Records', sql: 'SELECT * FROM sales_data;' },
    { label: 'Sales > $300 (Desc)', sql: 'SELECT * FROM sales_data WHERE sales > 300 ORDER BY sales DESC;' },
    { label: 'Electronics Category', sql: "SELECT * FROM sales_data WHERE category = 'Electronics';" },
  ];

  return (
    <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', border: '1px solid #374151' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>🗄️ SQL Query Engine</h2>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>Offline SQL query execution sandbox</p>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', color: '#9ca3af', alignSelf: 'center' }}>Presets:</span>
        {presetQueries.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => setQuery(preset.sql)}
            style={{ backgroundColor: '#374151', color: '#60a5fa', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          style={{ width: '100%', backgroundColor: '#111827', color: '#60a5fa', border: '1px solid #374151', borderRadius: '6px', padding: '12px', fontFamily: 'monospace', fontSize: '14px', resize: 'vertical' }}
        />
        <button
          onClick={runQuery}
          style={{ backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '8px' }}
        >
          ▶ Run Query
        </button>
      </div>

      {errorMessage && (
        <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
          {errorMessage}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e7eb', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#111827', borderBottom: '2px solid #374151', color: '#9ca3af' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>Product</th>
              <th style={{ padding: '10px' }}>Category</th>
              <th style={{ padding: '10px' }}>Sales ($)</th>
              <th style={{ padding: '10px' }}>Units</th>
              <th style={{ padding: '10px' }}>Region</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '10px', fontFamily: 'monospace', color: '#9ca3af' }}>{row.id}</td>
                <td style={{ padding: '10px' }}>{row.product}</td>
                <td style={{ padding: '10px' }}>{row.category}</td>
                <td style={{ padding: '10px', fontFamily: 'monospace', color: '#34d399' }}>${row.sales}</td>
                <td style={{ padding: '10px', fontFamily: 'monospace' }}>{row.units}</td>
                <td style={{ padding: '10px' }}>{row.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
