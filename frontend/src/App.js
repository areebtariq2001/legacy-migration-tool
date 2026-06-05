import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('analyze');

  const handleSubmit = async () => {
    if (!file) return alert('Please select a file first!');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('https://legacy-migration-tool.onrender.com/' + mode, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!file) return alert('Please select a file first!');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('https://legacy-migration-tool.onrender.com/download', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return alert('Download failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.py', '_migrated.py');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'white',padding:'40px',fontFamily:'Arial'}}>
      <h1 style={{color:'#38bdf8',textAlign:'center'}}>Legacy Code Migration Tool</h1>
      <p style={{textAlign:'center',color:'#94a3b8'}}>Analyze and migrate your legacy Python code</p>
      <div style={{maxWidth:'600px',margin:'40px auto',background:'#1e293b',padding:'30px',borderRadius:'12px'}}>
        <div style={{marginBottom:'20px',display:'flex',gap:'10px'}}>
          <button onClick={()=>setMode('analyze')} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',background:mode==='analyze'?'#38bdf8':'#334155',color:'white',cursor:'pointer'}}>Analyze</button>
          <button onClick={()=>setMode('migrate')} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',background:mode==='migrate'?'#38bdf8':'#334155',color:'white',cursor:'pointer'}}>Migrate</button>
        </div>
        <input type="file" accept=".py" onChange={e=>setFile(e.target.files[0])} style={{width:'100%',padding:'10px',marginBottom:'20px',background:'#334155',border:'none',borderRadius:'8px',color:'white'}} />
        <button onClick={handleSubmit} disabled={loading} style={{width:'100%',padding:'12px',background:'#38bdf8',border:'none',borderRadius:'8px',color:'#0f172a',fontWeight:'bold',fontSize:'16px',cursor:'pointer'}}>
          {loading ? 'Processing...' : mode==='analyze' ? 'Analyze Now' : 'Migrate Now'}
        </button>
        {mode === 'migrate' && (
          <button onClick={handleDownload}
            style={{width:'100%',padding:'12px',background:'#22c55e',border:'none',borderRadius:'8px',color:'white',fontWeight:'bold',fontSize:'16px',cursor:'pointer',marginTop:'10px'}}>
            Download Migrated Code
          </button>
        )}
      </div>
      {result && (
        <div style={{maxWidth:'600px',margin:'0 auto',background:'#1e293b',padding:'30px',borderRadius:'12px'}}>
          <h3 style={{color:'#38bdf8'}}>Results: {result.filename}</h3>
          {result.functions && <p>Functions: {result.functions.length > 0 ? result.functions.join(', ') : 'None'}</p>}
          {result.classes && <p>Classes: {result.classes.length > 0 ? result.classes.join(', ') : 'None'}</p>}
          {result.imports && <p>Imports: {result.imports.length > 0 ? result.imports.join(', ') : 'None'}</p>}
          {result.issues && <p>Issues: {result.issues.length > 0 ? result.issues.join(', ') : 'No issues found!'}</p>}
          {result.changes && <p>Changes: {result.changes.length > 0 ? result.changes.join(', ') : 'No changes needed!'}</p>}
          {result.migrated_code && (
            <div>
              <h4 style={{color:'#38bdf8'}}>Migrated Code:</h4>
              <pre style={{background:'#0f172a',padding:'15px',borderRadius:'8px',overflow:'auto',fontSize:'13px'}}>{result.migrated_code}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
