import { useState } from 'react';

interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

const currencies: CurrencyConfig[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1480.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.78 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', rate: 14.2 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 131.0 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18.4 },
];

const initialData: Record<string, string> = {
  A1: 'Item', B1: 'Category', C1: 'Price', D1: 'Qty', E1: 'Total', F1: 'Tax', G1: 'Final',
  A2: 'Laptop', B2: 'Electronics', C2: '1200', D2: '2', E2: '=PRODUCT(C2:D2)', F2: '10', G2: '=SUM(E2:F2)',
  A3: 'Desk', B3: 'Furniture', C3: '450', D3: '4', E3: '=PRODUCT(C3:D3)', F3: '15', G3: '=SUM(E3:F3)',
  A4: 'Lamp', B4: 'Furniture', C4: '80', D4: '10', E4: '=PRODUCT(C4:D4)', F4: '5', G4: '=SUM(E4:F4)',
  A5: 'Link', B5: 'Site', C5: '=HYPERLINK("https://google.com","Google")', D5: '', E5: '', F5: '', G5: '',
};

export const ExcelModule = () => {
  const [activeTab, setActiveTab] = useState<string>('Home');
  const [columns, setColumns] = useState<string[]>(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  const [rowCount, setRowCount] = useState<number>(10);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('NGN');
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [fileName, setFileName] = useState<string>('Book1.xlsx');

  // Text formatting states
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [fontFamily, setFontFamily] = useState<string>('Calibri');
  const [fontSize, setFontSize] = useState<string>('11');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [textColor, setTextColor] = useState<string>('#ffffff');

  // Per-cell styling storage
  const [cellStyles, setCellStyles] = useState<Record<string, any>>({});

  // Grid Data Store
  const [gridData, setGridData] = useState<Record<string, string>>(initialData);

  const activeCurrency = currencies.find(c => c.code === selectedCurrency) || currencies[0];

  const getCellValues = (rangeStr: string): number[] => {
    const values: number[] = [];
    if (rangeStr.includes(':')) {
      const [start, end] = rangeStr.split(':');
      const startCol = start.charAt(0).toUpperCase();
      const startRow = parseInt(start.slice(1), 10);
      const endCol = end.charAt(0).toUpperCase();
      const endRow = parseInt(end.slice(1), 10);

      const startColIdx = columns.indexOf(startCol);
      const endColIdx = columns.indexOf(endCol);

      if (startColIdx !== -1 && endColIdx !== -1) {
        for (let c = Math.min(startColIdx, endColIdx); c <= Math.max(startColIdx, endColIdx); c++) {
          for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
            const cellKey = `${columns[c]}${r}`;
            const evaluated = evaluateCell(cellKey);
            const val = parseFloat(evaluated);
            if (!isNaN(val)) values.push(val);
          }
        }
      }
    } else {
      const cellKeys = rangeStr.split(',').map(s => s.trim().toUpperCase());
      cellKeys.forEach(k => {
        const val = parseFloat(evaluateCell(k));
        if (!isNaN(val)) values.push(val);
      });
    }
    return values;
  };

  const evalComparison = (expr: string): boolean => {
    let clean = expr.trim();
    clean = clean.replace(/[A-Z]+\d+/gi, (ref) => {
      const val = evaluateCell(ref);
      return isNaN(Number(val)) ? `"${val}"` : val;
    });

    try {
      if (/^[0-9a-zA-Z_\s"'<>=!+.-]+$/.test(clean)) {
        return Function(`"use strict"; return (${clean})`)();
      }
    } catch {
      return false;
    }
    return false;
  };

  const evaluateCell = (cellKey: string): string => {
    const rawVal = gridData[cellKey] || '';
    if (!rawVal.startsWith('=')) return rawVal;

    const formula = rawVal.substring(1).trim();
    const match = formula.match(/^([A-Z]+)\((.*)\)$/i);
    if (!match) return '#VALUE!';

    const funcName = match[1].toUpperCase();
    const argStr = match[2];

    switch (funcName) {
      case 'SUM': {
        const nums = getCellValues(argStr);
        return nums.reduce((a, b) => a + b, 0).toString();
      }
      case 'AVERAGE':
      case 'AVG': {
        const nums = getCellValues(argStr);
        return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : '0';
      }
      case 'COUNT': {
        const nums = getCellValues(argStr);
        return nums.length.toString();
      }
      case 'MIN': {
        const nums = getCellValues(argStr);
        return nums.length ? Math.min(...nums).toString() : '0';
      }
      case 'MAX': {
        const nums = getCellValues(argStr);
        return nums.length ? Math.max(...nums).toString() : '0';
      }
      case 'PRODUCT': {
        const nums = getCellValues(argStr);
        return nums.length ? nums.reduce((a, b) => a * b, 1).toString() : '0';
      }
      case 'SIN': {
        const val = parseFloat(evaluateCell(argStr.trim()) || argStr.trim());
        if (isNaN(val)) return '#VALUE!';
        return Math.sin((val * Math.PI) / 180).toFixed(4);
      }
      case 'TYPE': {
        const val = evaluateCell(argStr.trim());
        if (val === '') return '1';
        if (!isNaN(Number(val))) return '1';
        if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') return '4';
        return '2';
      }
      case 'STDEV': {
        const nums = getCellValues(argStr);
        if (nums.length <= 1) return '0';
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (nums.length - 1);
        return Math.sqrt(variance).toFixed(2);
      }
      case 'IF': {
        const parts = argStr.split(',').map(p => p.trim());
        if (parts.length < 2) return '#ARG!';
        const condition = parts[0];
        const trueVal = parts[1].replace(/^["']|["']$/g, '');
        const falseVal = parts[2] ? parts[2].replace(/^["']|["']$/g, '') : '';
        
        const condResult = evalComparison(condition);
        return condResult ? trueVal : falseVal;
      }
      case 'HYPERLINK': {
        const parts = argStr.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
        const url = parts[0];
        const label = parts[1] || url;
        return `[LINK]:${url}:${label}`;
      }
      case 'VLOOKUP':
      case 'LOOKUP': {
        const parts = argStr.split(',').map(p => p.trim());
        if (parts.length < 3) return '#N/A';
        const lookupVal = evaluateCell(parts[0]).toLowerCase();
        const rangeStr = parts[1];
        const colIdx = parseInt(parts[2], 10);

        if (!rangeStr.includes(':')) return '#N/A';
        const [start, end] = rangeStr.split(':');
        const startCol = start.charAt(0).toUpperCase();
        const startRow = parseInt(start.slice(1), 10);
        const endRow = parseInt(end.slice(1), 10);

        const startColIdx = columns.indexOf(startCol);
        const targetColIdx = startColIdx + colIdx - 1;

        if (startColIdx === -1 || targetColIdx >= columns.length) return '#REF!';

        for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
          const keyCell = `${columns[startColIdx]}${r}`;
          const keyVal = evaluateCell(keyCell).toLowerCase();

          if (keyVal === lookupVal) {
            const targetCell = `${columns[targetColIdx]}${r}`;
            return evaluateCell(targetCell);
          }
        }
        return '#N/A';
      }
      default:
        return '#NAME?';
    }
  };

  const renderFormattedCell = (cellKey: string) => {
    const evaluated = evaluateCell(cellKey);
    
    if (evaluated.startsWith('[LINK]:')) {
      const [, url, label] = evaluated.split(':');
      return (
        <a href={url} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
          {label}
        </a>
      );
    }

    const num = parseFloat(evaluated);
    if (!isNaN(num) && evaluated !== '' && !gridData[cellKey]?.includes('HYPERLINK')) {
      const converted = num * activeCurrency.rate;
      return `${activeCurrency.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
    return evaluated;
  };

  const applyStyleToSelected = (styleKey: string, val: any) => {
    setCellStyles(prev => ({
      ...prev,
      [selectedCell]: {
        ...prev[selectedCell],
        [styleKey]: val
      }
    }));
  };

  const addColumn = () => {
    const lastCol = columns[columns.length - 1];
    const nextColChar = String.fromCharCode(lastCol.charCodeAt(0) + 1);
    if (columns.length < 15) setColumns([...columns, nextColChar]);
  };

  const removeColumn = () => {
    if (columns.length > 2) setColumns(columns.slice(0, -1));
  };

  const addRow = () => setRowCount(prev => prev + 1);
  const removeRow = () => { if (rowCount > 2) setRowCount(prev => prev - 1); };

  const createNewFile = () => {
    if (confirm("Create a new blank sheet? Unsaved changes will be lost.")) {
      setGridData({});
      setFileName('Untitled.xlsx');
    }
  };

  const saveToFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gridData));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${fileName.replace('.xlsx', '')}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          setGridData(parsed);
        } catch {
          alert("Invalid file format! Please select a valid JSON backup file.");
        }
      };
    }
  };

  const exportCSV = () => {
    let csv = '';
    csv += ['#', ...columns].join(',') + '\n';
    for (let r = 1; r <= rowCount; r++) {
      const rowVals = [r.toString()];
      columns.forEach(c => {
        const val = evaluateCell(`${c}${r}`);
        rowVals.push(`"${val.replace(/"/g, '""')}"`);
      });
      csv += rowVals.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.xlsx', '')}.csv`;
    a.click();
  };

  const ribbonTabs = ['File', 'Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'Review', 'View'];

  return (
    <div style={{ backgroundColor: '#18181b', borderRadius: '10px', overflow: 'hidden', border: '1px solid #27272a', fontFamily: 'sans-serif' }}>
      
      {/* Green Header Bar */}
      <div style={{ backgroundColor: '#107c41', color: 'white', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 'bold' }}>
        <span>📊 {fileName} - Excel Ribbon Workspace</span>
        <span>Cell Selected: <mark style={{ backgroundColor: '#15803d', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>{selectedCell}</mark></span>
      </div>

      {/* Ribbon Tabs */}
      <div style={{ backgroundColor: '#27272a', display: 'flex', borderBottom: '1px solid #3f3f46', paddingLeft: '8px' }}>
        {ribbonTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? (tab === 'File' ? '#059669' : '#18181b') : 'transparent',
              color: activeTab === tab ? '#ffffff' : '#a1a1aa',
              border: 'none',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              cursor: 'pointer',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              borderBottom: activeTab === tab && tab !== 'File' ? '2px solid #10b981' : 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ribbon Toolbar Content */}
      <div style={{ backgroundColor: '#18181b', padding: '12px 16px', borderBottom: '1px solid #27272a', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* FILE TAB */}
        {activeTab === 'File' && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={createNewFile} style={actionBtn}>📄 New File</button>
            <button onClick={saveToFile} style={{ ...actionBtn, backgroundColor: '#10b981', color: '#000' }}>💾 Save File</button>
            <label style={{ ...actionBtn, cursor: 'pointer', display: 'inline-block' }}>
              📂 Open File
              <input type="file" accept=".json" onChange={loadFile} style={{ display: 'none' }} />
            </label>
            <button onClick={exportCSV} style={{ ...actionBtn, backgroundColor: '#059669', color: 'white' }}>📥 Export CSV</button>
          </div>
        )}

        {/* HOME TAB */}
        {activeTab === 'Home' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '1px solid #3f3f46', paddingRight: '16px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <select value={fontFamily} onChange={e => { setFontFamily(e.target.value); applyStyleToSelected('fontFamily', e.target.value); }} style={selectStyle}>
                  <option value="Calibri">Calibri</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </select>
                <select value={fontSize} onChange={e => { setFontSize(e.target.value); applyStyleToSelected('fontSize', `${e.target.value}px`); }} style={selectStyle}>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                  <option value="14">14</option>
                  <option value="16">16</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => { setIsBold(!isBold); applyStyleToSelected('fontWeight', !isBold ? 'bold' : 'normal'); }} style={toolBtn(isBold)}><b>B</b></button>
                <button onClick={() => { setIsItalic(!isItalic); applyStyleToSelected('fontStyle', !isItalic ? 'italic' : 'normal'); }} style={toolBtn(isItalic)}><i>I</i></button>
                <button onClick={() => { setIsUnderline(!isUnderline); applyStyleToSelected('textDecoration', !isUnderline ? 'underline' : 'none'); }} style={toolBtn(isUnderline)}><u>U</u></button>
                <input type="color" value={textColor} onChange={e => { setTextColor(e.target.value); applyStyleToSelected('color', e.target.value); }} style={{ width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '1px solid #3f3f46', paddingRight: '16px' }}>
              <span style={{ fontSize: '11px', color: '#71717a' }}>Alignment</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => { setTextAlign('left'); applyStyleToSelected('textAlign', 'left'); }} style={toolBtn(textAlign === 'left')}>⬅️ Left</button>
                <button onClick={() => { setTextAlign('center'); applyStyleToSelected('textAlign', 'center'); }} style={toolBtn(textAlign === 'center')}>↔️ Center</button>
                <button onClick={() => { setTextAlign('right'); applyStyleToSelected('textAlign', 'right'); }} style={toolBtn(textAlign === 'right')}>➡️ Right</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '1px solid #3f3f46', paddingRight: '16px' }}>
              <span style={{ fontSize: '11px', color: '#71717a' }}>Cells & Grid</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={addColumn} style={actionBtn}>+ Col</button>
                <button onClick={removeColumn} style={actionBtn}>- Col</button>
                <button onClick={addRow} style={actionBtn}>+ Row</button>
                <button onClick={removeRow} style={actionBtn}>- Row</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#71717a' }}>Currency Formatting</span>
              <select value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value)} style={{ ...selectStyle, width: '160px', borderColor: '#10b981', color: '#10b981', fontWeight: 'bold' }}>
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* FORMULAS TAB */}
        {activeTab === 'Formulas' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Quick Formulas:</span>
            <button onClick={() => setGridData(p => ({ ...p, [selectedCell]: `=SUM(C2:C4)` }))} style={actionBtn}>=SUM()</button>
            <button onClick={() => setGridData(p => ({ ...p, [selectedCell]: `=AVERAGE(C2:C4)` }))} style={actionBtn}>=AVERAGE()</button>
            <button onClick={() => setGridData(p => ({ ...p, [selectedCell]: `=COUNT(C2:C4)` }))} style={actionBtn}>=COUNT()</button>
            <button onClick={() => setGridData(p => ({ ...p, [selectedCell]: `=IF(C2>500,"High","Low")` }))} style={actionBtn}>=IF()</button>
            <button onClick={() => setGridData(p => ({ ...p, [selectedCell]: `=VLOOKUP("Desk",A2:C4,3)` }))} style={actionBtn}>=VLOOKUP()</button>
            <button onClick={() => setGridData(p => ({ ...p, [selectedCell]: `=SIN(30)` }))} style={actionBtn}>=SIN()</button>
            <button onClick={() => setGridData(p => ({ ...p, [selectedCell]: `=STDEV(C2:C4)` }))} style={actionBtn}>=STDEV()</button>
            <button onClick={() => setGridData(p => ({ ...p, [selectedCell]: `=TYPE(C2)` }))} style={actionBtn}>=TYPE()</button>
            <button onClick={() => setGridData(p => ({ ...p, [selectedCell]: `=HYPERLINK("https://google.com","Google")` }))} style={actionBtn}>=HYPERLINK()</button>
          </div>
        )}

        {activeTab === 'Data' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={exportCSV} style={{ ...actionBtn, backgroundColor: '#059669', color: 'white' }}>📥 Export Sheet as CSV</button>
          </div>
        )}

        {['Insert', 'Page Layout', 'Review', 'View'].includes(activeTab) && (
          <span style={{ fontSize: '12px', color: '#71717a' }}>{activeTab} tools active and ready.</span>
        )}

      </div>

      {/* Formula Bar */}
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#09090b', padding: '6px 12px', borderBottom: '1px solid #27272a', gap: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace', minWidth: '35px' }}>{selectedCell}</span>
        <span style={{ fontSize: '13px', color: '#71717a', fontWeight: 'bold' }}>fx</span>
        <input
          type="text"
          value={gridData[selectedCell] || ''}
          placeholder="Enter text, numbers, or formulas (=SUM, =IF, =VLOOKUP, =HYPERLINK)"
          onChange={e => setGridData({ ...gridData, [selectedCell]: e.target.value })}
          style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#e4e4e7', outline: 'none', fontSize: '13px', fontFamily: 'monospace' }}
        />
      </div>

      {/* Grid Display Table */}
      <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#27272a', color: '#a1a1aa' }}>
              <th style={{ width: '40px', padding: '6px', textAlign: 'center', border: '1px solid #3f3f46' }}>#</th>
              {columns.map(col => (
                <th key={col} style={{ padding: '6px 12px', textAlign: 'center', border: '1px solid #3f3f46', color: '#10b981' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, rIdx) => {
              const rowNum = rIdx + 1;
              return (
                <tr key={rowNum}>
                  <td style={{ backgroundColor: '#27272a', color: '#71717a', textAlign: 'center', padding: '6px', border: '1px solid #3f3f46', fontWeight: 'bold' }}>{rowNum}</td>
                  {columns.map(col => {
                    const cellKey = `${col}${rowNum}`;
                    const rawVal = gridData[cellKey] || '';
                    const rendered = renderFormattedCell(cellKey);
                    const isSelected = selectedCell === cellKey;
                    const customStyle = cellStyles[cellKey] || {};

                    return (
                      <td
                        key={cellKey}
                        onClick={() => setSelectedCell(cellKey)}
                        style={{
                          border: isSelected ? '2px solid #10b981' : '1px solid #27272a',
                          backgroundColor: isSelected ? '#064e3b22' : 'transparent',
                          padding: 0,
                          position: 'relative'
                        }}
                      >
                        {isSelected ? (
                          <input
                            type="text"
                            value={rawVal}
                            onChange={e => setGridData({ ...gridData, [cellKey]: e.target.value })}
                            autoFocus
                            style={{
                              width: '100%',
                              backgroundColor: 'transparent',
                              color: customStyle.color || '#e4e4e7',
                              fontWeight: customStyle.fontWeight || 'normal',
                              fontStyle: customStyle.fontStyle || 'normal',
                              textDecoration: customStyle.textDecoration || 'none',
                              fontFamily: customStyle.fontFamily || 'sans-serif',
                              fontSize: customStyle.fontSize || '13px',
                              textAlign: customStyle.textAlign || 'left',
                              border: 'none',
                              padding: '6px 10px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              padding: '6px 10px',
                              color: customStyle.color || (rawVal.startsWith('=') ? '#34d399' : '#e4e4e7'),
                              fontWeight: customStyle.fontWeight || (rawVal.startsWith('=') ? 'bold' : 'normal'),
                              fontStyle: customStyle.fontStyle || 'normal',
                              textDecoration: customStyle.textDecoration || 'none',
                              fontFamily: customStyle.fontFamily || 'sans-serif',
                              fontSize: customStyle.fontSize || '13px',
                              textAlign: customStyle.textAlign || 'left',
                              minHeight: '20px'
                            }}
                          >
                            {rendered}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

const selectStyle = {
  backgroundColor: '#09090b',
  color: '#e4e4e7',
  border: '1px solid #3f3f46',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  outline: 'none',
};

const toolBtn = (active: boolean) => ({
  backgroundColor: active ? '#10b981' : '#27272a',
  color: active ? '#000000' : '#e4e4e7',
  border: '1px solid #3f3f46',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
});

const actionBtn = {
  backgroundColor: '#27272a',
  color: '#e4e4e7',
  border: '1px solid #3f3f46',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
};
