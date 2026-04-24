import { useState } from 'react'
import api from '../../utils/api'
import { AdminNav } from './Dashboard'
import { Spinner } from '../../components/UI'
import { useToast } from '../../context/ToastContext'

const TABLES = ['users','products','orders','orderItems','coupons','reviews','wishlistItems','cartItems','customRequests']

export default function AdminDatabase() {
  const { showToast } = useToast()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [exportResult, setExportResult] = useState(null)
  const [selectedTables, setSelectedTables] = useState(TABLES)

  const toggleTable = (t) =>
    setSelectedTables(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const handleExport = async () => {
    setExporting(true)
    setExportResult(null)
    try {
      const r = await api.post('/admin/db/export', { tables: selectedTables })
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `adore-db-export-${new Date().toISOString().slice(0,10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportResult({ success: true, tables: Object.keys(r.data.data||{}), ts: new Date().toLocaleString('en-IN') })
      showToast('Database exported successfully')
    } catch (e) {
      showToast(e?.response?.data?.error || 'Export failed')
      setExportResult({ success: false })
    }
    setExporting(false)
  }

  const handleImport = async () => {
    if (!importFile) return showToast('Please select a JSON export file')
    setImporting(true)
    setImportResult(null)
    try {
      const text = await importFile.text()
      const payload = JSON.parse(text)
      const r = await api.post('/admin/db/import', payload)
      setImportResult({ success: true, summary: r.data.summary || {} })
      showToast('Database imported successfully')
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Import failed'
      showToast(msg)
      setImportResult({ success: false, error: msg })
    }
    setImporting(false)
  }

  const card = { background: '#fff', border: '1.5px solid var(--ink-10)', borderRadius: 4, padding: 28, marginBottom: 24 }
  const label = { fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8, display: 'block' }
  const chip = (active) => ({
    padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
    cursor: 'pointer', border: `1.5px solid ${active ? '#880E4F' : 'var(--ink-10)'}`,
    background: active ? '#FCE4EC' : '#fafaf8', color: active ? '#880E4F' : 'var(--ink-40)',
    fontFamily: "'Jost',sans-serif", transition: 'all .15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/database" />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 5% 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>Admin Tools</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Database Import / Export</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-40)', marginTop: 6 }}>Export your data as JSON for backup, or restore from a previous export file.</p>
        </div>

        {/* EXPORT */}
        <div style={card}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--ink)' }}>
            Export Database
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-40)', marginBottom: 20 }}>Select which tables to include in the export. A JSON file will be downloaded to your device.</p>

          <span style={label}>Select Tables</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            <button
              onClick={() => setSelectedTables(selectedTables.length === TABLES.length ? [] : [...TABLES])}
              style={{ ...chip(selectedTables.length === TABLES.length), fontStyle: 'italic' }}
            >
              {selectedTables.length === TABLES.length ? '✓ All Selected' : 'Select All'}
            </button>
            {TABLES.map(t => (
              <button key={t} onClick={() => toggleTable(t)} style={chip(selectedTables.includes(t))}>
                {selectedTables.includes(t) ? '✓ ' : ''}{t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              className="btn-gold"
              onClick={handleExport}
              disabled={exporting || selectedTables.length === 0}
              style={{ opacity: exporting || selectedTables.length === 0 ? .6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {exporting ? <><Spinner size={14} /> Exporting…</> : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export JSON</>
              )}
            </button>
            {exportResult?.success && (
              <div style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>
                ✓ Exported {exportResult.tables.length} tables · {exportResult.ts}
              </div>
            )}
            {exportResult?.success === false && (
              <div style={{ fontSize: 12, color: '#c0392b', fontWeight: 600 }}>✗ Export failed</div>
            )}
          </div>
        </div>

        {/* IMPORT */}
        <div style={card}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--ink)' }}>
            Import Database
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-40)', marginBottom: 4 }}>
            Upload a previously exported JSON file to restore data.
          </p>
          <div style={{ fontSize: 12, color: '#e65100', background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: 3, padding: '8px 12px', marginBottom: 20, fontWeight: 600 }}>
            ⚠ Warning: Import will upsert records and may overwrite existing data. Make an export backup first.
          </div>

          <span style={label}>Select Export File (.json)</span>
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              border: '1.5px dashed var(--ink-20)', borderRadius: 3, cursor: 'pointer',
              fontSize: 13, color: 'var(--ink-60)', fontFamily: "'Jost',sans-serif", fontWeight: 600,
              background: importFile ? '#f0fff4' : '#fafaf8', transition: 'all .2s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {importFile ? importFile.name : 'Choose JSON file…'}
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={e => { setImportFile(e.target.files[0]||null); setImportResult(null) }} />
            </label>
            {importFile && (
              <button onClick={() => { setImportFile(null); setImportResult(null) }}
                style={{ marginLeft: 10, background: 'none', border: 'none', color: 'var(--ink-40)', cursor: 'pointer', fontSize: 13 }}>✕ Remove</button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              className="btn-gold"
              onClick={handleImport}
              disabled={importing || !importFile}
              style={{ opacity: importing || !importFile ? .6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {importing ? <><Spinner size={14} /> Importing…</> : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Import JSON</>
              )}
            </button>
            {importResult?.success && (
              <div style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>
                ✓ Import complete
              </div>
            )}
            {importResult?.success === false && (
              <div style={{ fontSize: 12, color: '#c0392b', fontWeight: 600 }}>✗ {importResult.error}</div>
            )}
          </div>

          {importResult?.success && importResult.summary && Object.keys(importResult.summary).length > 0 && (
            <div style={{ marginTop: 20, background: '#f0fff4', border: '1px solid #a5d6a7', borderRadius: 3, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#2e7d32', marginBottom: 8 }}>Import Summary</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(importResult.summary).map(([table, count]) => (
                  <span key={table} style={{ fontSize: 11, background: '#e8f5e9', color: '#2e7d32', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
                    {table}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
