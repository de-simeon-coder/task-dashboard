import { useState } from 'react';
import { ExcelModule } from './components/ExcelModule';
import { SqlModule } from './components/SqlModule';
import { PBIModule } from './components/PBIModule';

export function App() {
  const [activeTab, setActiveTab] = useState<'excel' | 'sql' | 'powerbi'>('excel');

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Data Analytics Workspace</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>Excel Engine • SQL Console • Power BI Dashboard</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
          <button
            onClick={() => setActiveTab('excel')}
            style={{
              backgroundColor: activeTab === 'excel' ? '#059669' : '#1f2937',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Excel Grid
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            style={{
              backgroundColor: activeTab === 'sql' ? '#2563eb' : '#1f2937',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            SQL Engine
          </button>
          <button
            onClick={() => setActiveTab('powerbi')}
            style={{
              backgroundColor: activeTab === 'powerbi' ? '#d97706' : '#1f2937',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Power BI
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto' }}>
        {activeTab === 'excel' && <ExcelModule />}
        {activeTab === 'sql' && <SqlModule />}
        {activeTab === 'powerbi' && <PBIModule />}
      </main>
    </div>
  );
}

export default App;
