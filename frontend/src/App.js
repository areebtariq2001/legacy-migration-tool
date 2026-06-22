import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

function App() {
  const [files, setFiles] = useState([]); // Multiple files ke liye
  const [result, setResult] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleAction = async (endpoint) => {
    if (files.length === 0) return alert("Please select files first!");
    setLoading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("files", files[i]);

    try {
      const response = await fetch(`https://legacy-migration-tool-1.onrender.com/${endpoint}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.migrated_code);
    alert("Code Copied!");
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#0d1117", color: "#c9d1d9", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Legacy Migration Tool</h1>
      
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <input type="file" multiple onChange={handleFileChange} />
        <button onClick={() => handleAction("migrate")}>Migrate Files</button>
        <button onClick={() => handleAction("ai-suggest")}>AI Suggest</button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Processing...</p>}

      {result.migrated_code && (
        <div style={{ marginTop: "30px", border: "1px solid #30363d", padding: "20px" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3>Comparison</h3>
            <button onClick={copyToClipboard}>Copy Code</button>
          </div>
          <ReactDiffViewer oldValue={result.original_code} newValue={result.migrated_code} splitView={true} />
        </div>
      )}

      {result.suggestions && (
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#161b22" }}>
          <h3>💡 AI Suggestions</h3>
          <p>{result.suggestions}</p>
        </div>
      )}
    </div>
  );
}
export default App;