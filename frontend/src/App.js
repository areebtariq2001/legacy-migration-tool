import { useState } from 'react';
function App() {
return (<div><h1>Legacy Code Migration Tool</h1></div>);
}
export default App;
import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('analyze');
  const [language, setLanguage] = useState('python');
  const API = 'https://legacy-migration-tool-1.onrender.com';

  const handleSubmit = async () => {
    if (!file) return alert('Please select a file first!');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    let endpoint = '/analyze';
    if (language === 'python') {
      endpoint = mode === 'analyze' ? '/analyze' : '/migrate';
    }
    if (language === 'java') {
      endpoint = mode === 'analyze' ? '/analyze-java' : '/migrate-java';
    }
    if (language === 'php') {
      endpoint = mode === 'analyze' ? '/analyze-php' : '/migrate-php';
    }
    const res = await fetch(API + endpoint, { method: 'POST', body: formData });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!file) return alert('Please select a file first!');
    const formData = new FormData();
    formData.append('file', file);
    let endpoint = '/download';
    if (language === 'java') endpoint = '/migrate-java';
    if (language === 'php') endpoint = '/migrate-php';
    const res = await fetch(API + endpoint, { method: 'POST', body: formData });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
  };

  const btn = (active, color) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: active ? color : '#334155',
    color: 'white',
    cursor: 'pointer',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: '40px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#38bdf8', textAlign: 'center' }}>
        Legacy Code Migration Tool
      </h1>
      <p style={{ textAlign: 'center', color: '#94a3b8' }}>
        Analyze and migrate your legacy code
      </p>
      <div style={{ maxWidth: '600px', margin: '40px auto', background: '#1e293b', padding: '30px', borderRadius: '12px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={() => setLanguage('python')} style={btn(language === 'python', '#7c3aed')}>
            Python
          </button>
          <button onClick={() => setLanguage('java')} style={btn(language === 'java', '#7c3aed')}>
            Java
          </button>
          <button onClick={() => setLanguage('php')} style={btn(language === 'php', '#7c3aed')}>
            PHP
          </button>
        </div>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={() => setMode('analyze')} style={btn(mode === 'analyze', '#38bdf8')}>
            Analyze
          </button>
          <button onClick={() => setMode('migrate')} style={btn(mode === 'migrate', '#38bdf8')}>
            Migrate
          </button>
        </div>
        <input
          type="file"
          accept={language === 'java' ? '.java' : language === 'php' ? '.php' : '.py'}
          onChange={(e) => setFile(e.target.files[0])}
          style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#334155', border: 'none', borderRadius: '8px', color: 'white' }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#38bdf8', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : mode === 'analyze' ? 'Analyze Now' : 'Migrate Now'}
        </button>
        {mode === 'migrate' && (
          <button
            onClick={handleDownload}
            style={{ width: '100%', padding: '12px', background: '#22c55e', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
          >
            Download Migrated Code
          </button>
        )}
      </div>
      {result && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1e293b', padding: '30px', borderRadius: '12px' }}>
          <h3 style={{ color: '#38bdf8' }}>Results: {result.filename}</h3>
          {result.functions && (
            <p>Functions: {result.functions.length > 0 ? result.functions.join(', ') : 'None'}</p>
          )}
          {result.methods && (
            <p>Methods: {result.methods.length > 0 ? result.methods.join(', ') : 'None'}</p>
          )}
          {result.classes && (
            <p>Classes: {result.classes.length > 0 ? result.classes.join(', '
              