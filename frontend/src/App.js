import { useState } from "react";

function App() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("analyze");
  const [language, setLanguage] = useState("python");
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const API = "https://legacy-migration-tool-1.onrender.com";

  const bg = darkMode ? "#0f172a" : "#f1f5f9";
  const card = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const border = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const text = darkMode ? "white" : "#0f172a";
  const subtext = darkMode ? "#94a3b8" : "#64748b";
  const codebg = darkMode ? "#0f172a" : "#e2e8f0";

  const handleSubmit = async () => {
    if (files.length === 0) return alert("Please select files first!");
    setLoading(true);
    setResults([]);
    setProgress(0);
    setCopied({});
    const allResults = [];
    
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      
      let endpoint = "/analyze";
      
      // Fixed AI Endpoint with dynamic language query parameter
      if (mode === "ai") {
        endpoint = `/ai-suggest?language=${language}`;
      } else if (language === "python") {
        endpoint = mode === "analyze" ? "/analyze" : "/migrate";
      } else if (language === "java") {
        endpoint = mode === "analyze" ? "/analyze-java" : "/migrate-java";
      } else if (language === "php") {
        endpoint = mode === "analyze" ? "/analyze-php" : "/migrate-php";
      } else if (language === "cobol") {
        endpoint = mode === "analyze" ? "/analyze-cobol" : "/migrate-cobol";
      }

      try {
        const res = await fetch(API + endpoint, { method: "POST", body: formData });
        const data = await res.json();
        data.filename = files[i].name;
        allResults.push(data);
      } catch (e) {
        allResults.push({ filename: files[i].name, error: "Failed to process" });
      }
      
      setProgress(Math.round(((i + 1) / files.length) * 100));
      setResults([...allResults]);
    }
    setLoading(false);
  };

  const handleDownload = (result) => {
    if (!result.migrated_code) return;
    const blob = new Blob([result.migrated_code], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename + "_migrated.py";
    a.click();
  };

  const handleCopy = (idx, code) => {
    navigator.clipboard.writeText(code);
    setCopied({ ...copied, [idx]: true });
    setTimeout(() => setCopied(prev => ({ ...prev, [idx]: false })), 2000);
  };

  const totalIssues = results.reduce((acc, r) => acc + (r.issues ? r.issues.length : 0), 0);
  const totalChanges = results.reduce((acc, r) => acc + (r.changes ? r.changes.length : 0), 0);

  const langs = ["python", "java", "php", "cobol"];
  const lc = { python: "#3b82f6", java: "#f59e0b", php: "#8b5cf6", cobol: "#10b981" };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "Arial", transition: "all 0.3s" }}>
      <div style={{ textAlign: "center", padding: "40px 20px", position: "relative" }}>
        <button onClick={() => setDarkMode(!darkMode)} style={{ position: "absolute", right: "20px", top: "20px", padding: "8px 16px", borderRadius: "20px", border: "1px solid " + border, background: card, color: text, cursor: "pointer" }}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <h1 style={{ color: "#38bdf8" }}>StarBuild</h1>
        <p style={{ color: subtext }}>Transform your legacy code to modern standards</p>
      </div>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 20px 40px" }}>
        <div style={{ background: card, border: "1px solid " + border, borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {langs.map(lang => (
              <button key={lang} onClick={() => setLanguage(lang)} style={{ padding: "8px 16px", borderRadius: "20px", border: language === lang ? "2px solid " + lc[lang] : "1px solid " + border, background: language === lang ? lc[lang] + "22" : "transparent", color: language === lang ? lc[lang] : subtext, cursor: "pointer" }}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {[["analyze", "Analyze", "#38bdf8"], ["migrate", "Migrate", "#22c55e"], ["ai", "AI Suggest", "#f59e0b"]].map(([m, label, color]) => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: mode === m ? "2px solid " + color : "1px solid " + border, background: mode === m ? color + "22" : "transparent", color: mode === m ? color : subtext, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ border: "2px dashed " + border, borderRadius: "8px", padding: "20px", textAlign: "center", marginBottom: "16px" }}>
            <input type="file" multiple accept=".py,.java,.php,.cbl" onChange={e => setFiles(Array.from(e.target.files))} id="fileInput" style={{ display: "none" }} />
            <label htmlFor="fileInput" style={{ cursor: "pointer", color: "#38bdf8" }}>
              Click to select files (multiple allowed)
            </label>
            {files.length > 0 && <p style={{ color: subtext, marginTop: "8px" }}>{files.length} file(s) selected: {files.map(f => f.name).join(", ")}</p>}
          </div>
          {loading && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyEncoding: "space-between", marginBottom: "4px" }}>
                <span style={{ color: subtext, fontSize: "13px" }}>Processing files...</span>
                <span style={{ color: "#38bdf8", fontSize: "13px" }}>{progress}%</span>
              </div>
              <div style={{ background: darkMode ? "#334155" : "#cbd5e1", borderRadius: "8px", height: "8px" }}>
                <div style={{ background: "#38bdf8", borderRadius: "8px", height: "8px", width: progress + "%", transition: "width 0.3s ease" }}></div>
              </div>
            </div>
          )}
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: loading ? "#334155" : "#38bdf8", color: loading ? "#94a3b8" : "#0f172a", fontWeight: "700", cursor: "pointer" }}>
            {loading ? `Processing ${results.length}/${files.length} files...` : mode === "analyze" ? "Analyze Files" : mode === "migrate" ? "Migrate Files" : "Get AI Suggestions"}
          </button>
        </div>

        {results.length > 0 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
              <div style={{ background: "rgba(56,189,248,0.1)", border: "1px solid #38bdf8", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#38bdf8" }}>{results.length}</div>
                <div style={{ fontSize: "12px", color: subtext }}>Files Processed</div>
              </div>
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid #f87171", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#f87171" }}>{totalIssues}</div>
                <div style={{ fontSize: "12px", color: subtext }}>Issues Found</div>
              </div>
              <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid #4ade80", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#4ade80" }}>{totalChanges}</div>
                <div style={{ fontSize: "12px", color: subtext }}>Changes Made</div>
              </div>
            </div>

            <h3 style={{ color: "#38bdf8" }}>Results ({results.length} files)</h3>
            {results.map((result, idx) => (
              <div key={idx} style={{ background: card, border: "1px solid " + border, borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
                <h4 style={{ color: "#38bdf8", margin: "0 0 8px 0" }}>{result.filename}</h4>
                {result.error && <p style={{ color: "#f87171" }}>{result.error}</p>}
                {result.functions && result.functions.length > 0 && <p style={{ fontSize: "13px", color: text }}>Functions: {result.functions.join(", ")}</p>}
                {result.classes && result.classes.length > 0 && <p style={{ fontSize: "13px", color: text }}>Classes: {result.classes.join(", ")}</p>}
                {result.imports && result.imports.length > 0 && <p style={{ fontSize: "13px", color: text }}>Imports: {result.imports.join(", ")}</p>}
                {result.issues && <p style={{ color: result.issues.length > 0 ? "#f87171" : "#4ade80", fontSize: "13px" }}>Issues: {result.issues.length > 0 ? result.issues.join(", ") : "No issues!"}</p>}
                {result.changes && <p style={{ color: "#4ade80", fontSize: "13px" }}>Changes: {result.changes.length > 0 ? result.changes.join(", ") : "No changes needed!"}</p>}
                {result.suggestions && (
                  <div style={{ marginTop: "8px" }}>
                    <p style={{ color: "#f59e0b", fontSize: "13px", fontWeight: "bold" }}>AI Suggestions:</p>
                    <pre style={{ background: codebg, color: text, padding: "12px", borderRadius: "8px", overflow: "auto", fontSize: "11px", maxHeight: "200px", whiteSpace: "pre-wrap" }}>{result.suggestions}</pre>
                  </div>
                )}
                {result.migrated_code && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ color: "#38bdf8", fontSize: "13px" }}>Migrated Code:</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleCopy(idx, result.migrated_code)} style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid #38bdf8", background: copied[idx] ? "#38bdf8" : "transparent", color: copied[idx] ? "#0f172a" : "#38bdf8", cursor: "pointer", fontSize: "12px" }}>
                          {copied[idx] ? "Copied!" : "Copy"}
                        </button>
                        <button onClick={() => handleDownload(result)} style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid #22c55e", background: "transparent", color: "#22c55e", cursor: "pointer", fontSize: "12px" }}>
                          Download
                        </button>
                      </div>
                    </div>
                    <pre style={{ background: codebg, color: text, padding: "12px", borderRadius: "8px", overflow: "auto", fontSize: "11px", maxHeight: "200px" }}>{result.migrated_code}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;