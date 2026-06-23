import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

function App() {
  const [files, setFiles] = useState(null);
  const [result, setResult] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Apne Railway ka URL yahan confirm kar lein
  const API_BASE_URL = "https://legacy-migration-tool-production.up.railway.app";

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleAction = async (endpoint) => {
    if (!files || files.length === 0) return alert("Please select files first!");
    setLoading(true);
    
    const formData = new FormData();
    // Saari select ki gayi files ko loop kar ke FormData mein daal rahe hain
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Server error: " + response.status);
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result.migrated_code) {
      navigator.clipboard.writeText(result.migrated_code);
      alert("Code Copied to Clipboard!");
    }
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#0d1117", color: "#c9d1d9", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Legacy Migration Tool</h1>
      
      <div style={{ textAlign: "center", marginBottom: "30px", padding: "20px", border: "1px solid #30363d", borderRadius: "10px" }}>
        {/* multiple attribute yahan zaroori hai */}
        <input type="file" multiple onChange={handleFileChange} style={{ marginRight: "10px" }} />
        <button onClick={() => handleAction("migrate")} disabled={loading} style={{ marginRight: "10px" }}>Migrate Files</button>
        <button onClick={() => handleAction("ai-suggest")} disabled={loading}>AI Suggest</button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Processing multiple files...</p>}

      {/* Migration Result Section */}
      {result.migrated_code && (
        <div style={{ marginTop: "30px", border: "1px solid #30363d", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#161b22", padding: "12px", borderBottom: "1px solid #30363d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Side-by-Side Comparison</strong>
            <button onClick={copyToClipboard} style={{ padding: "4px 10px", cursor: "pointer" }}>Copy Code</button>
          </div>
          <ReactDiffViewer 
            oldValue={result.original_code} 
            newValue={result.migrated_code} 
            splitView={true} 
            styles={{ variables: { diffViewerBackground: "#0d1117", addedBackground: "#1e3a1e", removedBackground: "#4a1c1c" } }} 
          />
        </div>
      )}

      {/* AI Suggestion Section */}
      {result.suggestions && (
        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#161b22", borderRadius: "8px", border: "1px solid #30363d" }}>
          <h3 style={{ color: "#58a6ff" }}>💡 AI Suggestions</h3>
          <pre style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{result.suggestions}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
