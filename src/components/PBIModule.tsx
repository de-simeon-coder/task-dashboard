import { useState, useMemo } from 'react';

interface DataRow {
  id: number;
  item: string;
  category: string;
  amount: number;
  region: string;
}

interface VisualCard {
  id: string;
  title: string;
  type: 'card' | 'bar' | 'line' | 'table' | 'pie' | 'text' | 'measure';
  value?: string;
}

const defaultData: DataRow[] = [
  { id: 1, item: 'Laptop', category: 'Electronics', amount: 2400, region: 'North' },
  { id: 2, item: 'Desk', category: 'Furniture', amount: 1800, region: 'South' },
  { id: 3, item: 'Lamp', category: 'Furniture', amount: 800, region: 'East' },
  { id: 4, item: 'Phone', category: 'Electronics', amount: 3100, region: 'West' },
  { id: 5, item: 'Monitor', category: 'Electronics', amount: 1500, region: 'North' },
];

export const PBIModule = () => {
  const [activeTab, setActiveTab] = useState<'Home' | 'Insert' | 'Modeling' | 'View' | 'Optimize'>('Home');
  const [viewMode, setViewMode] = useState<'report' | 'data' | 'model'>('report');
  
  const [dataset, setDataset] = useState<DataRow[]>(defaultData);
  const [sourceName, setSourceName] = useState<string>('Sample Data');
  
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [pauseVisuals, setPauseVisuals] = useState<boolean>(false);
  
  const [measures, setMeasures] = useState<Array<{ name: string; dax: string; val: number }>>([
    { name: 'Total Revenue', dax: 'SUM(Sales[Amount])', val: 9600 }
  ]);
  const [newMeasureName, setNewMeasureName] = useState('');
  const [newMeasureDAX, setNewMeasureDAX] = useState('');

  const [pages, setPages] = useState<string[]>(['Page 1']);
  const [currentPage, setCurrentPage] = useState<string>('Page 1');
  const [pageVisuals, setPageVisuals] = useState<Record<string, VisualCard[]>>({
    'Page 1': [
      { id: 'v1', title: 'Total Revenue KPI', type: 'card' },
      { id: 'v2', title: 'Sales Breakdown', type: 'bar' }
    ]
  });

  const filteredData = useMemo(() => {
    return dataset.filter(item => {
      const catMatch = filterCategory === 'All' || item.category === filterCategory;
      const regMatch = filterRegion === 'All' || item.region === filterRegion;
      return catMatch && regMatch;
    });
  }, [dataset, filterCategory, filterRegion]);

  const totalAmount = useMemo(() => filteredData.reduce((s, r) => s + r.amount, 0), [filteredData]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(dataset.map(d => d.category)))], [dataset]);
  const regions = useMemo(() => ['All', ...Array.from(new Set(dataset.map(d => d.region)))], [dataset]);

  const loadExcelData = () => {
    setDataset([
      { id: 101, item: 'Excel License', category: 'Software', amount: 600, region: 'Global' },
      { id: 102, item: 'Data Clean Up', category: 'Services', amount: 1200, region: 'West' },
      { id: 103, item: 'Office Chair', category: 'Furniture', amount: 950, region: 'South' },
    ]);
    setSourceName('Excel Workbook');
    setFilterCategory('All');
    setFilterRegion('All');
  };

  const loadSQLData = () => {
    setDataset([
      { id: 501, item: 'Enterprise DB', category: 'Infrastructure', amount: 8500, region: 'North' },
      { id: 502, item: 'Cloud Sync', category: 'Infrastructure', amount: 3400, region: 'East' },
      { id: 503, item: 'Storage Array', category: 'Hardware', amount: 6200, region: 'West' },
    ]);
    setSourceName('SQL Server');
    setFilterCategory('All');
    setFilterRegion('All');
  };

  const loadOneLakeData = () => {
    setDataset([
      { id: 901, item: 'Fabric Lakehouse', category: 'Analytics', amount: 4300, region: 'Global' },
      { id: 902, item: 'Pipeline Run', category: 'Analytics', amount: 2100, region: 'North' },
    ]);
    setSourceName('OneLake Catalog');
    setFilterCategory('All');
    setFilterRegion('All');
  };

  const handleEnterData = () => {
    const newItem: DataRow = {
      id: Date.now(),
      item: 'Manual Entry',
      category: 'Custom',
      amount: Math.floor(Math.random() * 2000) + 500,
      region: 'Local'
    };
    setDataset([...dataset, newItem]);
    setSourceName('Manual Entered Data');
  };

  const addVisual = (type: VisualCard['type'], title: string) => {
    const current = pageVisuals[currentPage] || [];
    const newVisual: VisualCard = {
      id: `v_${Date.now()}`,
      title: `${title} (${current.length + 1})`,
      type
    };
    setPageVisuals({
      ...pageVisuals,
      [currentPage]: [...current, newVisual]
    });
  };

  const handleAddMeasure = () => {
    if (!newMeasureName.trim()) return;
    const computedVal = Math.floor(Math.random() * 5000) + 1000;
    setMeasures([...measures, { name: newMeasureName, dax: newMeasureDAX || 'CUSTOM_DAX()', val: computedVal }]);
    addVisual('measure', `Measure: ${newMeasureName}`);
    setNewMeasureName('');
    setNewMeasureDAX('');
  };

  const addPage = () => {
    const nextName = `Page ${pages.length + 1}`;
    setPages([...pages, nextName]);
    setPageVisuals({ ...pageVisuals, [nextName]: [] });
    setCurrentPage(nextName);
  };

  return (
    <div style={{ backgroundColor: '#18181b', color: '#e4e4e7', borderRadius: '8px', overflow: 'hidden', border: '1px solid #27272a', fontFamily: 'sans-serif', minHeight: '620px', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ backgroundColor: '#f2c811', color: '#000', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' }}>
        <span>🟡 Power BI Desktop - [{sourceName}]</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setViewMode('report')} style={viewBtn(viewMode === 'report')}>📊 Report View</button>
          <button onClick={() => setViewMode('data')} style={viewBtn(viewMode === 'data')}>🗄️ Data View</button>
          <button onClick={() => setViewMode('model')} style={viewBtn(viewMode === 'model')}>🔗 Model View</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#27272a', display: 'flex', borderBottom: '1px solid #3f3f46' }}>
        {(['Home', 'Insert', 'Modeling', 'View', 'Optimize'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? '#18181b' : 'transparent',
              color: activeTab === tab ? '#f2c811' : '#a1a1aa',
              border: 'none',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #f2c811' : 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#18181b', padding: '8px 12px', borderBottom: '1px solid #27272a', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {activeTab === 'Home' && (
          <>
            <button onClick={loadExcelData} style={toolBtn}>📂 Excel Workbook</button>
            <button onClick={loadOneLakeData} style={toolBtn}>🌊 OneLake Catalog</button>
            <button onClick={loadSQLData} style={toolBtn}>🗄️ SQL Server</button>
            <button onClick={handleEnterData} style={toolBtn}>✏️ Enter Data</button>
            <button onClick={() => setDataset([...dataset])} style={{ ...toolBtn, backgroundColor: '#0284c7', color: '#fff' }}>🔄 Refresh</button>
            <button onClick={() => addVisual('card', 'New Visual')} style={toolBtn}>➕ New Visual</button>
          </>
        )}

        {activeTab === 'Insert' && (
          <>
            <button onClick={() => addVisual('card', 'KPI Card')} style={toolBtn}>📊 Key Card</button>
            <button onClick={() => addVisual('bar', 'Bar Chart')} style={toolBtn}>📈 Bar Chart</button>
            <button onClick={() => addVisual('pie', 'Pie Chart')} style={toolBtn}>🥧 Pie Chart</button>
            <button onClick={() => addVisual('table', 'Data Grid')} style={toolBtn}>📋 Table Visual</button>
            <button onClick={() => addVisual('text', 'TextBox')} style={toolBtn}>📝 Text Box</button>
            <button onClick={addPage} style={{ ...toolBtn, backgroundColor: '#10b981', color: '#fff' }}>📄 Add New Page</button>
          </>
        )}

        {activeTab === 'Modeling' && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Measure Name"
              value={newMeasureName}
              onChange={e => setNewMeasureName(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="DAX (e.g. SUM(Sales[Amount]))"
              value={newMeasureDAX}
              onChange={e => setNewMeasureDAX(e.target.value)}
              style={{ ...inputStyle, width: '180px' }}
            />
            <button onClick={handleAddMeasure} style={{ ...toolBtn, backgroundColor: '#f2c811', color: '#000' }}>➕ Add Measure</button>
          </div>
        )}

        {activeTab === 'View' && (
          <>
            <button onClick={() => setViewMode('report')} style={{ ...toolBtn, backgroundColor: viewMode === 'report' ? '#f2c811' : '#27272a', color: viewMode === 'report' ? '#000' : '#fff' }}>📊 Report Canvas View</button>
            <button onClick={() => setViewMode('data')} style={{ ...toolBtn, backgroundColor: viewMode === 'data' ? '#f2c811' : '#27272a', color: viewMode === 'data' ? '#000' : '#fff' }}>🗄️ Data Table View</button>
            <button onClick={() => setViewMode('model')} style={{ ...toolBtn, backgroundColor: viewMode === 'model' ? '#f2c811' : '#27272a', color: viewMode === 'model' ? '#000' : '#fff' }}>🔗 Model Relationship View</button>
          </>
        )}

        {activeTab === 'Optimize' && (
          <>
            <button onClick={() => setPauseVisuals(!pauseVisuals)} style={{ ...toolBtn, backgroundColor: pauseVisuals ? '#ef4444' : '#10b981', color: '#fff' }}>
              {pauseVisuals ? '▶️ Resume Visuals' : '⏸️ Pause Visual Queries'}
            </button>
            <button onClick={() => alert('Performance Inspection: All visuals loading under 12ms.')} style={toolBtn}>⚡ Performance Analyzer</button>
          </>
        )}

      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#09090b' }}>
          
          {pauseVisuals && (
            <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '8px 12px', borderRadius: '4px', marginBottom: '12px', fontSize: '12px' }}>
              ⏸️ Visual rendering paused via Optimize Ribbon. Click 'Resume Visuals' to unpause.
            </div>
          )}

          {viewMode === 'report' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#f2c811' }}>Canvas View: {currentPage}</h3>
                <span style={{ fontSize: '11px', color: '#10b981', backgroundColor: '#064e3b', padding: '2px 8px', borderRadius: '4px' }}>
                  Source: {sourceName} ({filteredData.length} Records)
                </span>
              </div>

              {!pauseVisuals && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {(pageVisuals[currentPage] || []).map(v => (
                    <div key={v.id} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '12px', minHeight: '140px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#a1a1aa', marginBottom: '8px' }}>{v.title}</div>
                      
                      {v.type === 'card' && (
                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f2c811' }}>₦{totalAmount.toLocaleString()}</div>
                          <span style={{ fontSize: '10px', color: '#71717a' }}>Sum of Amount</span>
                        </div>
                      )}

                      {v.type === 'bar' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                          {filteredData.slice(0, 3).map(d => (
                            <div key={d.id}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                <span>{d.item}</span>
                                <span>₦{d.amount}</span>
                              </div>
                              <div style={{ height: '4px', width: '100%', backgroundColor: '#27272a', borderRadius: '2px', marginTop: '2px' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, (d.amount / 5000) * 100)}%`, backgroundColor: '#f2c811', borderRadius: '2px' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {v.type === 'pie' && (
                        <div style={{ fontSize: '11px', color: '#e4e4e7', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                          <div>🔵 North: 35%</div>
                          <div>🟡 South: 25%</div>
                          <div>🟢 West: 40%</div>
                        </div>
                      )}

                      {v.type === 'table' && (
                        <div style={{ fontSize: '10px', marginTop: '6px' }}>
                          {filteredData.slice(0, 2).map(r => (
                            <div key={r.id} style={{ borderBottom: '1px solid #27272a', padding: '2px 0' }}>{r.item} - ₦{r.amount}</div>
                          ))}
                        </div>
                      )}

                      {v.type === 'text' && (
                        <div style={{ fontSize: '11px', color: '#a1a1aa', fontStyle: 'italic', marginTop: '8px' }}>
                          "Add key analytics summary or report notes here."
                        </div>
                      )}

                      {v.type === 'measure' && (
                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                          <div style={{ fontSize: '18px', color: '#38bdf8', fontWeight: 'bold' }}>Active DAX</div>
                          <div style={{ fontSize: '11px', color: '#e4e4e7' }}>Calculated dynamically</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {viewMode === 'data' && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#f2c811' }}>Data Table Inspector</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#27272a', color: '#a1a1aa' }}>
                    <th style={{ padding: '6px', border: '1px solid #3f3f46' }}>ID</th>
                    <th style={{ padding: '6px', border: '1px solid #3f3f46' }}>Item</th>
                    <th style={{ padding: '6px', border: '1px solid #3f3f46' }}>Category</th>
                    <th style={{ padding: '6px', border: '1px solid #3f3f46' }}>Amount (₦)</th>
                    <th style={{ padding: '6px', border: '1px solid #3f3f46' }}>Region</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(row => (
                    <tr key={row.id}>
                      <td style={{ padding: '6px', border: '1px solid #27272a' }}>{row.id}</td>
                      <td style={{ padding: '6px', border: '1px solid #27272a' }}>{row.item}</td>
                      <td style={{ padding: '6px', border: '1px solid #27272a' }}>{row.category}</td>
                      <td style={{ padding: '6px', border: '1px solid #27272a', color: '#f2c811' }}>₦{row.amount}</td>
                      <td style={{ padding: '6px', border: '1px solid #27272a' }}>{row.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'model' && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h3 style={{ color: '#f2c811', margin: '0 0 16px 0' }}>Data Model & Relationships</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ backgroundColor: '#18181b', border: '1px solid #f2c811', padding: '12px', borderRadius: '6px', width: '160px', textAlign: 'left' }}>
                  <b style={{ fontSize: '12px' }}>{sourceName}</b>
                  <hr style={{ borderColor: '#27272a', margin: '6px 0' }} />
                  <div style={{ fontSize: '11px', color: '#a1a1aa' }}>🔑 id<br/>📦 item<br/>🏷️ category<br/>💵 amount</div>
                </div>
                <div style={{ alignSelf: 'center', color: '#f2c811' }}>1 ─── *</div>
                <div style={{ backgroundColor: '#18181b', border: '1px solid #38bdf8', padding: '12px', borderRadius: '6px', width: '160px', textAlign: 'left' }}>
                  <b style={{ fontSize: '12px' }}>Measures</b>
                  <hr style={{ borderColor: '#27272a', margin: '6px 0' }} />
                  {measures.map((m, i) => (
                    <div key={i} style={{ fontSize: '10px', color: '#e4e4e7' }}>📐 {m.name}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        <div style={{ width: '200px', backgroundColor: '#18181b', borderLeft: '1px solid #27272a', padding: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#f2c811', textTransform: 'uppercase' }}>Build Visual</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              <button onClick={() => addVisual('card', 'Card')} style={iconBtn} title="Card">📊</button>
              <button onClick={() => addVisual('bar', 'Bar Chart')} style={iconBtn} title="Bar Chart">📈</button>
              <button onClick={() => addVisual('pie', 'Pie Chart')} style={iconBtn} title="Pie Chart">🥧</button>
              <button onClick={() => addVisual('table', 'Table')} style={iconBtn} title="Table">📋</button>
              <button onClick={() => addVisual('text', 'Text Box')} style={iconBtn} title="Text Box">📝</button>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#f2c811', textTransform: 'uppercase' }}>Category Filter</h4>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              style={{ width: '100%', backgroundColor: '#09090b', color: '#e4e4e7', border: '1px solid #3f3f46', padding: '4px', borderRadius: '4px', fontSize: '11px' }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#f2c811', textTransform: 'uppercase' }}>Region Filter</h4>
            <select
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
              style={{ width: '100%', backgroundColor: '#09090b', color: '#e4e4e7', border: '1px solid #3f3f46', padding: '4px', borderRadius: '4px', fontSize: '11px' }}
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#f2c811', textTransform: 'uppercase' }}>Data Fields</h4>
            <div style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>☑️ id</div>
              <div>☑️ item</div>
              <div>☑️ category</div>
              <div>☑️ amount</div>
              <div>☑️ region</div>
            </div>
          </div>
        </div>

      </div>

      <div style={{ backgroundColor: '#27272a', borderTop: '1px solid #3f3f46', padding: '4px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#71717a' }}>Pages:</span>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            style={{
              backgroundColor: currentPage === p ? '#f2c811' : '#18181b',
              color: currentPage === p ? '#000' : '#e4e4e7',
              border: 'none',
              padding: '3px 8px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {p}
          </button>
        ))}
        <button onClick={addPage} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
      </div>

    </div>
  );
};

const toolBtn = {
  backgroundColor: '#27272a',
  color: '#e4e4e7',
  border: '1px solid #3f3f46',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 'bold' as const,
  cursor: 'pointer'
};

const iconBtn = {
  backgroundColor: '#27272a',
  color: '#fff',
  border: '1px solid #3f3f46',
  padding: '6px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

const viewBtn = (active: boolean) => ({
  backgroundColor: active ? '#000' : 'transparent',
  color: active ? '#f2c811' : '#000',
  border: 'none',
  padding: '2px 6px',
  borderRadius: '3px',
  fontSize: '10px',
  fontWeight: 'bold' as const,
  cursor: 'pointer'
});

const inputStyle = {
  backgroundColor: '#09090b',
  color: '#e4e4e7',
  border: '1px solid #3f3f46',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '11px'
};
