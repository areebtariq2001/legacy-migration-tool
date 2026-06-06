import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('analyze');

  const API = 'https://legacy-migration-tool-1.onrender.com';

  const handleSubmit = async () => {
    if (!file) return alert('Please select a file first!');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(API + '/' + mode, {
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
    const res = await fetch(API + '/download', {
      method: 'POST',
      body: formData,
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.py', '_migrated.py');
    a.click();
  };

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'white',padding:'40px',fontFamily:'Arial'}}>
      <h1 style={{color:'#38bdf8',textAlign:'center'}
      