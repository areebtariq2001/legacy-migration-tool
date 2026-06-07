import { useState } from "react";
function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("analyze");
  const [language, setLanguage] = useState("python");
  const [page, setPage] = useState("home");
  const API = "https://legacy-migration-tool-1.onrender.com";
  const handleSubmit = async () => {
    if (!file) return alert("Please select a file first!");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    let endpoint = "/analyze";
    if (language === "python") endpoint = mode === "analyze" ? "/analyze" : "/migrate";
    if (language === "java") endpoint = mode === "analyze" ? "/analyze-java" : "/migrate-java";
    if (language === "php") endpoint = mode === "analyze" ? "/analyze-php" : "/migrate-php";
    if (language === "cobol") endpoint = mode === "analyze" ? "/analyze-cobol" : "/migrate-cobol";
    if (mode === "ai") endpoint = "/ai-suggest";
    const res = await fetch(API + endpoint, { method: "POST", body: formData });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };
  const handleDownload = async () => {
    if (!file) return alert("Please select a file first!");
    const formData = new FormData();
    formData.append("file", file);
    let endpoint = "/download";
    if (language === "java") endpoint = "/migrate-java";
    if (language === "php") endpoint = "/migrate-php";
    if (language === "cobol") endpoint = "/migrate-cobol";
    const res = await fetch(API + endpoint, { method: "POST", body: formData });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
  };
  const langs = ["python","java","php","cobol"];
  const langColors = { python:"#3b82f6", java:"#f59e0b", php:"#8b5cf6", cobol:"#10b981" };
  const langIcons = { python:"🐍", java:"☕", php:"🐘", cobol:"🖥️" };
  const navStyle = { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 40px", borderBottom:"1px solid rgba(255,255,255,0.1)" };
  const navBtnStyle = (active) => ({ padding:"8px 20px", borderRadius:"20px", border:"none", background: active ? "#38bdf8" : "transparent", color: active ? "#0f172a" : "#94a3b8", cursor:"pointer", fontSize:"14px", fontWeight:"500" });
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", color:"white", fontFamily:"'Segoe UI',Arial,sans-serif" }}>
      <nav style={navStyle}>
        <div style={{ fontSize:"20px", fontWeight:"700", background:"linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          LegacyMigrate
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={() => setPage("home")} style={navBtnStyle(page==="home")}>Tool</button>
          <button onClick={() => setPage("pricing")} style={navBtnStyle(page==="pricing")}>Pricing</button>
        </div>
      </nav>
      {page === "home" && (
        <div>
          <div style={{ textAlign:"center", padding:"60px 20px 40px" }}>
            <div style={{ fontSize:"48px", marginBottom:"10px" }}>🚀</div>
            <h1 style={{ fontSize:"36px", fontWeight:"700", background:"linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:"0 0 10px" }}>
              Legacy Code Migration Tool
            </h1>
            <p style={{ color:"#94a3b8", fontSize:"16px", margin:"0" }}>
              Transform your legacy code to modern standards using AI
            </p>
          </div>
          <div style={{ maxWidth:"700px", margin:"0 auto", padding:"0 20px 60px" }}>
            <div style={{ background:"rgba(255,255,255,0.05)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"30px", marginBottom:"20px" }}>
              <p style={{ color:"#94a3b8", fontSize:"13px", marginBottom:"12px", textTransform:"uppercase", letterSpacing:"1px" }}>Select Language</p>
              <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"24px" }}>
                {langs.map(lang => (
                  <button key={lang} onClick={() => setLanguage(lang)} style={{ padding:"10px 20px", borderRadius:"30px", border: language===lang ? "2px solid "+langColors[lang] : "1px solid rgba(255,255,255,0.15)", background: language===lang ? langColors[lang]+"22" : "transparent", color: language===lang ? langColors[lang] : "#94a3b8", cursor:"pointer", fontSize:"14px", fontWeight:"500" }}>
                    {langIcons[lang]} {lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <p style={{ color:"#94a3b8", fontSize:"13px", marginBottom:"12px", textTransform:"uppercase", letterSpacing:"1px" }}>Select Mode</p>
              <div style={{ display:"flex", gap:"10px", marginBottom:"24px" }}>
                {[["analyze","🔍","Analyze","#38bdf8"],["migrate","⚡","Migrate","#22c55e"],["ai","🤖","AI Suggest","#f59e0b"]].map(([m,icon,label,color]) => (
                  <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"12px", borderRadius:"10px", border: mode===m ? "2px solid "+color : "1px solid rgba(255,255,255,0.1)", background: mode===m ? color+"22" : "transparent", color: mode===m ? color : "#94a3b8", cursor:"pointer", fontSize:"14px", fontWeight:"500" }}>
                    {icon} {label}
                  </button>
                ))}
              </div>
              <div style={{ border:"2px dashed rgba(255,255,255,0.15)", borderRadius:"12px", padding:"30px", textAlign:"center", marginBottom:"20px", background:"rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize:"32px", marginBottom:"8px" }}>📁</div>
                <p style={{ color:"#94a3b8", marginBottom:"12px", fontSize:"14px" }}>Upload your code file</p>
                <input type="file" accept={language==="java"?".java":language==="php"?".php":language==="cobol"?".cbl,.cob":".py"} onChange={(e) => setFile(e.target.files[0])} style={{ display:"block", margin:"0 auto", color:"#94a3b8" }} />
                {file && <p style={{ color:"#38bdf8", marginTop:"10px", fontSize:"13px" }}>Selected: {file.name}</p>}
              </div>
              <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:"14px", borderRadius:"10px", border:"none", background: loading ? "#334155" : mode==="ai" ? "linear-gradient(90deg,#f59e0b,#ef4444)" : mode==="migrate" ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#38bdf8,#818cf8)", color: loading ? "#94a3b8" : "#0f172a", fontWeight:"700", fontSize:"16px", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Processing..." : mode==="analyze" ? "Analyze Now" : mode==="ai" ? "Get AI Suggestions" : "Migrate Now"}
              </button>
              {mode==="migrate" && (
                <button onClick={handleDownload} style={{ width:"100%", padding:"14px", borderRadius:"10px", border:"1px solid #22c55e", background:"transparent", color:"#22c55e", fontWeight:"700", fontSize:"16px", cursor:"pointer", marginTop:"10px" }}>
                  Download Migrated Code
                </button>
              )}
            </div>
            {result && (
              <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"30px" }}>
                <h3 style={{ color:"#38bdf8", marginBottom:"20px" }}>Results: {result.filename}</h3>
                {result.suggestions && <div style={{ background:"rgba(245,158,11,0.1)", border:"1px solid #f59e0b44", borderRadius:"10px", padding:"15px", marginBottom:"15px" }}><p style={{ color:"#fbbf24", margin:"0", fontSize:"14px", lineHeight:"1.6" }}>{result.suggestions}</p></div>}
                {result.functions && result.functions.length > 0 && <div style={{ marginBottom:"12px" }}><span style={{ color:"#94a3b8", fontSize:"13px" }}>Functions: </span><span style={{ color:"white" }}>{result.functions.join(", ")}</span></div>}
                {result.methods && result.methods.length > 0 && <div style={{ marginBottom:"12px" }}><span style={{ color:"#94a3b8", fontSize:"13px" }}>Methods: </span><span style={{ color:"white" }}>{result.methods.join(", ")}</span></div>}
                {result.classes && result.classes.length > 0 && <div style={{ marginBottom:"12px" }}><span style={{ color:"#94a3b8", fontSize:"13px" }}>Classes: </span><span style={{ color:"white" }}>{result.classes.join(", ")}</span></div>}
                {result.imports && result.imports.length > 0 && <div style={{ marginBottom:"12px" }}><span style={{ color:"#94a3b8", fontSize:"13px" }}>Imports: </span><span style={{ color:"white" }}>{result.imports.join(", ")}</span></div>}
                {result.issues && <div style={{ marginBottom:"12px" }}><span style={{ color:"#94a3b8", fontSize:"13px" }}>Issues: </span><span style={{ color: result.issues.length > 0 ? "#f87171" : "#4ade80" }}>{result.issues.length > 0 ? result.issues.join(", ") : "No issues found!"}</span></div>}
                {result.changes && <div style={{ marginBottom:"12px" }}><span style={{ color:"#94a3b8", fontSize:"13px" }}>Changes: </span><span style={{ color:"#4ade80" }}>{result.changes.length > 0 ? result.changes.join(", ") : "No changes needed!"}</span></div>}
                {result.migrated_code && (
                  <div>
                    <h4 style={{ color:"#38bdf8", marginBottom:"10px" }}>Migrated Code:</h4>
                    <pre style={{ background:"#0f172a", padding:"15px", borderRadius:"10px", overflow:"auto", fontSize:"13px", border:"1px solid rgba(255,255,255,0.1)" }}>{result.migrated_code}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {page === "pricing" && (
        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"60px 20px" }}>
          <h2 style={{ textAlign:"center", fontSize:"32px", fontWeight:"700", marginBottom:"10px" }}>Simple Pricing</h2>
          <p style={{ textAlign:"center", color:"#94a3b8", marginBottom:"50px" }}>Choose the plan that works for you</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px" }}>
            {[
              { name:"Free", price:"$0", period:"forever", color:"#64748b", features:["5 files per day","Python only","Basic analysis","Community support"], btn:"Get Started" },
              { name:"Pro", price:"$49", period:"per month", color:"#38bdf8", features:["Unlimited files","All languages","AI suggestions","Priority support","Download migrated code"], btn:"Start Free Trial", popular:true },
              { name:"Enterprise", price:"$199", period:"per month", color:"#818cf8", features:["Everything in Pro","Team collaboration","API access","Custom integrations","Dedicated support"], btn:"Contact Us" }
            ].map((plan) => (
              <div key={plan.name} style={{ background: plan.popular ? "rgba(56,189,248,0.1)" : "rgba(255,255,255,0.05)", border: plan.popular ? "2px solid #38bdf8" : "1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"30px", textAlign:"center", position:"relative" }}>
                {plan.popular && <div style={{ position:"absolute", top:"-12px", left:"50%", transform:"translateX(-50%)", background:"#38bdf8", color:"#0f172a", padding:"4px 16px", borderRadius:"20px", fontSize:"12px", fontWeight:"700" }}>MOST POPULAR</div>}
                <h3 style={{ color:plan.color, fontSize:"20px", marginBottom:"10px" }}>{plan.name}</h3>
                <div style={{ fontSize:"36px", fontWeight:"700", marginBottom:"5px" }}>{plan.price}</div>
                <div style={{ color:"#94a3b8", fontSize:"13px", marginBottom:"24px" }}>{plan.period}</div>
                <ul style={{ listStyle:"none", padding:"0", marginBottom:"24px", textAlign:"left" }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ padding:"6px 0", color:"#cbd5e1", fontSize:"14px" }}>
                      <span style={{ color:"#4ade80", marginRight:"8px" }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button style={{ width:"100%", padding:"12px", borderRadius:"10px", border: plan.popular ? "none" : "1px solid rgba(255,255,255,0.2)", background: plan.popular ? "#38bdf8" : "transparent", color: plan.popular ? "#0f172a" : "white", fontWeight:"600", cursor:"pointer", fontSize:"14px" }}>
                  {plan.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
