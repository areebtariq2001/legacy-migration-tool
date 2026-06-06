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
    if (language === 'python') endpoint = mode === 'analyze' ? '/analyze' : '/migrate';
    if (language === 'java') endpoint = mode === 'analyze' ? '/analyze-java' : '/migrate-java';
    if (language === 'php') endpoint = mode === 'analyze' ? '/analyze-php' : '/migrate-php';
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

  const btnStyle = (active, color) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: active ? color : '#334155',
    color: 'white',
    cursor: 'pointer'
  });

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'white',padding:'40px',fontFamily:'Arial'}}>
      <h1 style={{color:'#38bdf8',textAlign:'cen
      