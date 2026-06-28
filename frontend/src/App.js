import{useState,useEffect}from"react";
import ReactDiffViewer from"react-diff-viewer-continued";
import JSZip from"jszip";
import jsPDF from"jspdf";

const API="https://legacy-migration-tool-1.onrender.com";

function StatsPage({onBack}){
const[stats,setStats]=useState(null);
const[loading,setLoading]=useState(true);
useEffect(()=>{
fetch(API+"/stats").then(r=>r.json()).then(d=>{setStats(d);setLoading(false);}).catch(()=>setLoading(false));
},[]);
return(
<div style={{minHeight:"100vh",background:"#0a0e1a",color:"white",fontFamily:"Arial",padding:"40px 20px"}}>
<div style={{maxWidth:"800px",margin:"0 auto"}}>
<button onClick={onBack} style={{padding:"8px 16px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)",color:"white",cursor:"pointer",marginBottom:"24px"}}>
Back to Home
</button>
<h1 style={{color:"#38bdf8",marginBottom:"8px"}}>Usage Dashboard</h1>
<p style={{color:"#94a3b8",marginBottom:"32px"}}>Real-time statistics across all users.</p>
{loading&&<p style={{color:"#94a3b8"}}>Loading stats...</p>}
{stats&&(
<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginBottom:"32px"}}>
<div style={{background:"rgba(56,189,248,0.1)",border:"1px solid #38bdf8",borderRadius:"12px",padding:"24px",textAlign:"center"}}>
<div style={{fontSize:"36px",fontWeight:"700",color:"#38bdf8"}}>{stats.total_files}</div>
<div style={{fontSize:"13px",color:"#94a3b8"}}>Total Files Processed</div>
</div>
<div style={{background:"rgba(34,197,94,0.1)",border:"1px solid #22c55e",borderRadius:"12px",padding:"24px",textAlign:"center"}}>
<div style={{fontSize:"36px",fontWeight:"700",color:"#22c55e"}}>{stats.total_migrations}</div>
<div style={{fontSize:"13px",color:"#94a3b8"}}>Total Migrations</div>
</div>
<div style={{background:"rgba(245,158,11,0.1)",border:"1px solid #f59e0b",borderRadius:"12px",padding:"24px",textAlign:"center"}}>
<div style={{fontSize:"36px",fontWeight:"700",color:"#f59e0b"}}>{stats.total_analyses}</div>
<div style={{fontSize:"13px",color:"#94a3b8"}}>Total Analyses</div>
</div>
</div>
<h2 style={{color:"#38bdf8",fontSize:"20px",marginBottom:"12px"}}>Recent Activity (Audit Log)</h2>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"16px"}}>
{stats.logs&&stats.logs.length>0?stats.logs.map((log,idx)=>(
<div key={idx} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:idx<stats.logs.length-1?"1px solid rgba(255,255,255,0.1)":"none"}}>
<span style={{color:"#38bdf8",fontSize:"13px"}}>{log.action}</span>
<span style={{color:"white",fontSize:"13px"}}>{log.filename}</span>
<span style={{color:"#64748b",fontSize:"12px"}}>{log.time}</span>
</div>
)):<p style={{color:"#94a3b8"}}>No activity yet.</p>}
</div>
</div>
)}
<div style={{color:"#64748b",fontSize:"13px",marginTop:"40px",textAlign:"center"}}>2026 StarBuild - Usage Dashboard</div>
</div>
</div>
);
}

function ApiDocs({onBack}){
const codeStyle={background:"#0a0e1a",color:"#e2e8f0",padding:"16px",borderRadius:"8px",overflow:"auto",fontSize:"13px",fontFamily:"monospace",whiteSpace:"pre-wrap",border:"1px solid rgba(255,255,255,0.1)"};
return(
<div style={{minHeight:"100vh",background:"#0a0e1a",color:"white",fontFamily:"Arial",padding:"40px 20px"}}>
<div style={{maxWidth:"800px",margin:"0 auto"}}>
<button onClick={onBack} style={{padding:"8px 16px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)",color:"white",cursor:"pointer",marginBottom:"24px"}}>
Back to Home
</button>
<h1 style={{color:"#38bdf8",marginBottom:"8px"}}>StarBuild API Documentation</h1>
<p style={{color:"#94a3b8",marginBottom:"32px"}}>Integrate StarBuild into your CI/CD pipeline or applications.</p>
<h2 style={{color:"#38bdf8",fontSize:"20px",marginBottom:"12px"}}>Base URL</h2>
<div style={codeStyle}>https://legacy-migration-tool-1.onrender.com</div>
<h2 style={{color:"#38bdf8",fontSize:"20px",margin:"24px 0 12px"}}>Interactive Docs (Swagger)</h2>
<p style={{color:"#94a3b8",fontSize:"14px",marginBottom:"8px"}}>Full interactive OpenAPI documentation is available at:</p>
<div style={codeStyle}>https://legacy-migration-tool-1.onrender.com/docs</div>
<h2 style={{color:"#38bdf8",fontSize:"20px",margin:"24px 0 12px"}}>Endpoints</h2>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#22c55e",fontWeight:"bold"}}>POST /analyze, /migrate</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>Python analysis and rule-based migration with explanations and dependency checks</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#a78bfa",fontWeight:"bold"}}>POST /ai-migrate</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>AI migration. Python and Java include full guardrails (validation, confidence, verification). PHP and COBOL are experimental.</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#22c55e",fontWeight:"bold"}}>POST /call-graph</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>Maps functions, internal call relationships, and external library dependencies within a file</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#f87171",fontWeight:"bold"}}>POST /risk-assessment</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>Flags external dependencies (databases, APIs, network) that may break during migration, with risk levels</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#a78bfa",fontWeight:"bold"}}>POST /tech-debt</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>Technical debt score: counts legacy patterns and estimates remediation effort (code-based estimate)</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#22c55e",fontWeight:"bold"}}>POST /qa-check</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>AI-as-QA: compares original and migrated code for logical differences</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"24px"}}>
<p style={{color:"#22c55e",fontWeight:"bold"}}>GET /audit-log, /audit-log-json</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>Audit trail of all migrations (text and structured JSON formats)</p>
</div>
<h2 style={{color:"#38bdf8",fontSize:"20px",margin:"24px 0 12px"}}>Example: cURL</h2>
<div style={codeStyle}>{`curl -X POST \\
  https://legacy-migration-tool-1.onrender.com/migrate \\
  -F "file=@myscript.py"`}</div>
<div style={{color:"#64748b",fontSize:"13px",marginTop:"40px",textAlign:"center"}}>2026 StarBuild - API Documentation</div>
</div>
</div>
);
}

function LandingPage({onLaunch,onApiDocs,onStats}){
const beforeCode=`# Python 2 (legacy)
print "Processing..."
for i in xrange(10):
    data = raw_input()
    if d.has_key(i):
        print d[i]`;
const afterCode=`# Python 3 (modern)
print("Processing...")
for i in range(10):
    data = input()
    if i in d:
        print(d[i])`;
const matrixRows=[
["Manual Migration","High risk of human error","Slow & expensive","No"],
["Generic AI Tools","High hallucination risk","No verification","No"],
["StarBuild","Predictable & AST-verified","Confidence scored","Yes"]
];
return(
<div style={{minHeight:"100vh",background:"#0a0e1a",color:"#e2e8f0",fontFamily:"system-ui, Arial, sans-serif"}}>
<style>{`
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.sb-fade{animation:fadeUp 0.6s ease both}
.sb-btn-primary{transition:all 0.2s ease}
.sb-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(56,189,248,0.4)}
.sb-btn-ghost{transition:all 0.2s ease}
.sb-btn-ghost:hover{background:rgba(56,189,248,0.1);border-color:#38bdf8}
.sb-feature{transition:all 0.2s ease}
.sb-feature:hover{transform:translateY(-4px);border-color:rgba(56,189,248,0.4);background:rgba(56,189,248,0.04)}
.sb-lang:hover{transform:scale(1.05)}
`}</style>
<div style={{maxWidth:"1100px",margin:"0 auto",padding:"24px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{display:"flex",alignItems:"center",gap:"10px"}}>
<div style={{width:"32px",height:"32px",borderRadius:"8px",background:"linear-gradient(135deg,#38bdf8,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",color:"#0a0e1a",fontSize:"18px"}}>S</div>
<span style={{fontWeight:"700",fontSize:"18px",color:"white"}}>StarBuild</span>
</div>
<div style={{display:"flex",gap:"8px"}}>
<button className="sb-btn-ghost" onClick={onApiDocs} style={{padding:"8px 16px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"#cbd5e1",cursor:"pointer",fontSize:"14px"}}>API Docs</button>
<button className="sb-btn-ghost" onClick={onStats} style={{padding:"8px 16px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"#cbd5e1",cursor:"pointer",fontSize:"14px"}}>Dashboard</button>
</div>
</div>
<div style={{maxWidth:"1100px",margin:"0 auto",padding:"60px 24px 40px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"48px",alignItems:"center"}}>
<div className="sb-fade">
<div style={{display:"inline-block",background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.3)",color:"#38bdf8",padding:"6px 14px",borderRadius:"20px",fontSize:"13px",marginBottom:"24px",fontFamily:"monospace"}}>
rule-based + AI with guardrails
</div>
<h1 style={{fontSize:"44px",lineHeight:"1.1",color:"white",marginBottom:"20px",fontWeight:"800"}}>
Modernize legacy code,<br/><span style={{color:"#38bdf8"}}>predictably.</span>
</h1>
<p style={{fontSize:"18px",color:"#94a3b8",marginBottom:"32px",lineHeight:"1.6"}}>
StarBuild makes legacy migration predictable through transparent confidence scoring and AST-based verification. Python, Java, PHP, and COBOL.
</p>
<div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
<button className="sb-btn-primary" onClick={onLaunch} style={{background:"#38bdf8",color:"#0a0e1a",padding:"14px 32px",borderRadius:"10px",fontSize:"16px",fontWeight:"700",border:"none",cursor:"pointer"}}>
Launch Tool Free
</button>
<button className="sb-btn-ghost" onClick={onApiDocs} style={{background:"transparent",color:"#38bdf8",padding:"14px 32px",borderRadius:"10px",fontSize:"16px",fontWeight:"700",border:"1px solid rgba(56,189,248,0.4)",cursor:"pointer"}}>
View API
</button>
</div>
</div>
<div className="sb-fade" style={{background:"#0d1424",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
<div style={{display:"flex",alignItems:"center",gap:"8px",padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)"}}>
<div style={{width:"12px",height:"12px",borderRadius:"50%",background:"#ef4444"}}></div>
<div style={{width:"12px",height:"12px",borderRadius:"50%",background:"#f59e0b"}}></div>
<div style={{width:"12px",height:"12px",borderRadius:"50%",background:"#22c55e"}}></div>
<span style={{color:"#64748b",fontSize:"12px",marginLeft:"8px",fontFamily:"monospace"}}>migration.py</span>
</div>
<div style={{padding:"16px",fontFamily:"monospace",fontSize:"12.5px",lineHeight:"1.7"}}>
<pre style={{margin:0,color:"#f87171",whiteSpace:"pre-wrap"}}>{beforeCode}</pre>
<div style={{textAlign:"center",color:"#38bdf8",margin:"12px 0",fontSize:"18px"}}>↓</div>
<pre style={{margin:0,color:"#4ade80",whiteSpace:"pre-wrap"}}>{afterCode}</pre>
</div>
</div>
</div>
<div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 24px 30px"}}>
<div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:"12px",padding:"16px 20px",display:"flex",alignItems:"center",gap:"12px"}}>
<span style={{fontSize:"20px"}}>🔒</span>
<span style={{color:"#86efac",fontSize:"14px"}}>Your code is never stored on our servers. Migrations are processed in-memory and discarded immediately after the session.</span>
</div>
</div>
<div style={{maxWidth:"1100px",margin:"0 auto",padding:"20px 24px 40px"}}>
<div style={{textAlign:"center",marginBottom:"24px"}}>
<div style={{display:"inline-block",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:"12px",padding:"12px 24px"}}>
<span style={{color:"#22c55e",fontWeight:"700",fontSize:"15px"}}>Stress-tested on 50+ real-world legacy scripts &mdash; 97% high-confidence migrations</span>
</div>
</div>
<p style={{textAlign:"center",color:"#64748b",fontSize:"13px",marginBottom:"20px",textTransform:"uppercase",letterSpacing:"1px"}}>Supported Languages</p>
<div style={{display:"flex",gap:"16px",justifyContent:"center",flexWrap:"wrap"}}>
{[["Python","#3b82f6"],["Java","#f59e0b"],["PHP","#8b5cf6"],["COBOL","#10b981"]].map(([lang,color])=>(
<span key={lang} className="sb-lang" style={{padding:"10px 24px",borderRadius:"10px",fontWeight:"700",fontSize:"15px",background:color+"1a",color:color,border:"1px solid "+color+"55",transition:"transform 0.2s ease",cursor:"default"}}>
{lang}
</span>
))}
</div>
</div>
<div style={{maxWidth:"1100px",margin:"0 auto",padding:"20px 24px 60px"}}>
<h2 style={{textAlign:"center",color:"white",fontSize:"24px",marginBottom:"24px",fontWeight:"700"}}>Why StarBuild?</h2>
<div style={{overflowX:"auto"}}>
<table style={{width:"100%",borderCollapse:"collapse",minWidth:"600px"}}>
<thead>
<tr style={{borderBottom:"2px solid rgba(56,189,248,0.3)"}}>
<th style={{textAlign:"left",padding:"12px",color:"#64748b",fontSize:"13px"}}>Approach</th>
<th style={{textAlign:"left",padding:"12px",color:"#64748b",fontSize:"13px"}}>Reliability</th>
<th style={{textAlign:"left",padding:"12px",color:"#64748b",fontSize:"13px"}}>Verification</th>
<th style={{textAlign:"left",padding:"12px",color:"#64748b",fontSize:"13px"}}>Audit-ready</th>
</tr>
</thead>
<tbody>
{matrixRows.map((row,ri)=>{
const isStar=row[0]==="StarBuild";
return(
<tr key={ri} style={{borderBottom:"1px solid rgba(255,255,255,0.08)",background:isStar?"rgba(56,189,248,0.08)":"transparent"}}>
<td style={{padding:"14px 12px",fontWeight:isStar?"700":"400",color:isStar?"#38bdf8":"#cbd5e1",fontSize:"14px"}}>{row[0]}</td>
<td style={{padding:"14px 12px",color:isStar?"#86efac":"#94a3b8",fontSize:"13px"}}>{row[1]}</td>
<td style={{padding:"14px 12px",color:isStar?"#86efac":"#94a3b8",fontSize:"13px"}}>{row[2]}</td>
<td style={{padding:"14px 12px",color:isStar?"#86efac":"#94a3b8",fontSize:"13px",fontWeight:isStar?"700":"400"}}>{row[3]}</td>
</tr>
);
})}
</tbody>
</table>
</div>
</div>
<div style={{maxWidth:"1100px",margin:"0 auto",padding:"20px 24px 80px"}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"20px"}}>
{[
["Deterministic Migration","Rule-based conversions that produce the exact same output every run."],
["AI + Confidence Score","For Python and Java, AI migration includes validation, name checks, and a confidence score."],
["Call-Graph Analysis","Maps which functions call which, and what external libraries each depends on."],
["Risk + Tech-Debt Reports","Flags risky dependencies and estimates remediation effort before you migrate."],
["Batch Summary","Process many files at once and see which are safe and which need review."],
["Audit Dashboard","Every action logged with a timestamp."]
].map(([title,desc])=>(
<div key={title} className="sb-feature" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"24px"}}>
<div style={{color:"#38bdf8",fontSize:"16px",fontWeight:"700",marginBottom:"10px"}}>{title}</div>
<div style={{color:"#94a3b8",fontSize:"14px",lineHeight:"1.6"}}>{desc}</div>
</div>
))}
</div>
</div>
<div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 24px 80px"}}>
<div style={{background:"linear-gradient(135deg,rgba(56,189,248,0.1),rgba(14,165,233,0.05))",border:"1px solid rgba(56,189,248,0.2)",borderRadius:"16px",padding:"48px",textAlign:"center"}}>
<h2 style={{color:"white",fontSize:"28px",marginBottom:"12px",fontWeight:"700"}}>Ready to modernize your code?</h2>
<p style={{color:"#94a3b8",fontSize:"16px",marginBottom:"28px"}}>Free to use. No sign-up. No credit card.</p>
<button className="sb-btn-primary" onClick={onLaunch} style={{background:"#38bdf8",color:"#0a0e1a",padding:"14px 40px",borderRadius:"10px",fontSize:"16px",fontWeight:"700",border:"none",cursor:"pointer"}}>
Launch Tool Free
</button>
</div>
</div>
<div style={{borderTop:"1px solid rgba(255,255,255,0.08)",padding:"24px",textAlign:"center",color:"#64748b",fontSize:"13px"}}>
2026 StarBuild \u2014 Built with AI assistance
</div>
</div>
);
}

function App(){
const[view,setView]=useState("landing");
const[files,setFiles]=useState([]);
const[results,setResults]=useState([]);
const[loading,setLoading]=useState(false);
const[mode,setMode]=useState("analyze");
const[language,setLanguage]=useState("python");
const[progress,setProgress]=useState(0);
const[copied,setCopied]=useState({});
const[darkMode,setDarkMode]=useState(true);
const[showWhy,setShowWhy]=useState({});
const[threshold,setThreshold]=useState(85);

const bg=darkMode?"#0a0e1a":"#f1f5f9";
const card=darkMode?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)";
const border=darkMode?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)";
const text=darkMode?"white":"#0f172a";
const subtext=darkMode?"#94a3b8":"#64748b";
const codebg=darkMode?"#0a0e1a":"#e2e8f0";

if(view==="landing")return <LandingPage onLaunch={()=>setView("tool")} onApiDocs={()=>setView("apidocs")} onStats={()=>setView("stats")}/>;
if(view==="apidocs")return <ApiDocs onBack={()=>setView("landing")}/>;
if(view==="stats")return <StatsPage onBack={()=>setView("landing")}/>;

const handleSubmit=async()=>{
if(files.length===0)return alert("Please select files first!");
setLoading(true);
setResults([]);
setProgress(0);
setCopied({});
setShowWhy({});
const allResults=[];
for(let i=0;i<files.length;i++){
let originalCode="";
try{originalCode=await files[i].text();}catch(e){originalCode="";}
const formData=new FormData();
formData.append("file",files[i]);
let endpoint="/analyze";
if(mode==="ai"){endpoint="/ai-suggest";}
else if(mode==="aimigrate"){endpoint="/ai-migrate";}
else if(mode==="explain"){endpoint="/explain";}
else if(mode==="tests"){endpoint="/generate-tests";}
else if(mode==="callgraph"){endpoint="/call-graph";}
else if(mode==="risk"){endpoint="/risk-assessment";}
else if(mode==="debt"){endpoint="/tech-debt";}
else if(language==="python"){endpoint=mode==="analyze"?"/analyze":"/migrate";}
else if(language==="java"){endpoint=mode==="analyze"?"/analyze-java":"/migrate-java";}
else if(language==="php"){endpoint=mode==="analyze"?"/analyze-php":"/migrate-php";}
else if(language==="cobol"){endpoint=mode==="analyze"?"/analyze-cobol":"/migrate-cobol";}
try{
const res=await fetch(API+endpoint,{method:"POST",body:formData});
if(!res.ok){throw new Error("Server error "+res.status);}
const data=await res.json();
data.filename=files[i].name;
data.original_code=originalCode;
allResults.push(data);
}catch(e){
allResults.push({filename:files[i].name,error:"Could not process this file. The server may be waking up (wait 30 seconds and try again), or the file type may be unsupported."});
}
setProgress(Math.round(((i+1)/files.length)*100));
setResults([...allResults]);
}
setLoading(false);
};

const handleDownload=(result)=>{
if(!result.migrated_code)return;
const blob=new Blob([result.migrated_code],{type:"text/plain"});
const url=window.URL.createObjectURL(blob);
const a=document.createElement("a");
a.href=url;
a.download=result.filename+"_migrated";
a.click();
};

const handleDownloadAllZip=async()=>{
const zip=new JSZip();
const folder=zip.folder("migrated_files");
let added=0;
results.forEach(result=>{
if(result.migrated_code){
folder.file(result.filename+"_migrated",result.migrated_code);
added++;
}
});
if(added===0)return alert("No migrated files to download!");
const blob=await zip.generateAsync({type:"blob"});
const url=window.URL.createObjectURL(blob);
const a=document.createElement("a");
a.href=url;
a.download="migrated_files.zip";
a.click();
};

const handleDownloadReport=()=>{
if(results.length===0)return alert("No results to generate report!");
const doc=new jsPDF();
const pageW=210;
const date=new Date().toLocaleString();
doc.setFillColor(14,165,233);
doc.rect(0,0,pageW,30,"F");
doc.setTextColor(255,255,255);
doc.setFontSize(20);
doc.text("StarBuild Migration Report",pageW/2,14,{align:"center"});
doc.setFontSize(9);
doc.text("Audit-ready summary  |  Generated: "+date,pageW/2,23,{align:"center"});
const scoredR=results.filter(r=>r.confidence_score!==undefined);
const high=scoredR.filter(r=>r.confidence_score>=90).length;
const med=scoredR.filter(r=>r.confidence_score>=60&&r.confidence_score<90).length;
const low=scoredR.filter(r=>r.confidence_score<60).length;
const avg=scoredR.length>0?Math.round(scoredR.reduce((a,r)=>a+r.confidence_score,0)/scoredR.length):0;
let y=42;
doc.setTextColor(15,23,42);
doc.setFontSize(13);
doc.text("Summary",14,y);
y+=8;
doc.setDrawColor(203,213,225);
doc.setFillColor(241,245,249);
doc.roundedRect(14,y-5,182,37,2,2,"FD");
doc.setFontSize(10);
doc.setTextColor(51,65,85);
doc.text("Total files processed: "+results.length,20,y+2);
doc.text("Files with confidence score: "+scoredR.length,20,y+9);
doc.text("Average confidence: "+avg+"%",20,y+16);
doc.text("Acceptance threshold: "+threshold+"%",20,y+23);
doc.setTextColor(22,163,74);
doc.text("High: "+high,120,y+2);
doc.setTextColor(217,119,6);
doc.text("Need review: "+med,120,y+9);
doc.setTextColor(220,38,38);
doc.text("Low: "+low,120,y+16);
y+=43;
doc.setTextColor(15,23,42);
doc.setFontSize(13);
doc.text("Per-file details",14,y);
y+=8;
results.forEach((result,idx)=>{
if(y>262){doc.addPage();y=20;}
doc.setFontSize(11);
doc.setTextColor(14,165,233);
doc.text((idx+1)+". "+result.filename,14,y);
y+=6;
doc.setFontSize(9);
if(result.confidence_score!==undefined){
let col=[22,163,74];
if(result.confidence_score<90&&result.confidence_score>=60)col=[217,119,6];
if(result.confidence_score<60)col=[220,38,38];
doc.setTextColor(col[0],col[1],col[2]);
const decision=result.confidence_score>=threshold?"ACCEPTED":"MANUAL REVIEW";
doc.text("Status: "+result.confidence_score+"%  ("+(result.confidence_level||"")+")  ->  "+decision,18,y);
y+=5;
}
if(result.overall_risk!==undefined){
doc.setTextColor(180,83,9);
doc.text("Risk: "+result.overall_risk+"  (High:"+result.high_count+" Medium:"+result.medium_count+" Low:"+result.low_count+")",18,y);
y+=5;
}
if(result.debt_score!==undefined){
doc.setTextColor(124,58,237);
doc.text("Tech Debt: "+result.debt_score+"/100 ("+result.debt_level+")  ~"+result.estimated_hours+"h, "+result.total_issues+" issues",18,y);
y+=5;
}
doc.setTextColor(71,85,105);
if(result.validation_message){
const vl=doc.splitTextToSize("Validation: "+result.validation_message,175);
doc.text(vl,18,y);y+=vl.length*4.5;
}
if(result.var_message){
const vm=doc.splitTextToSize("Names: "+result.var_message,175);
doc.text(vm,18,y);y+=vm.length*4.5;
}
if(result.changes&&result.changes.length>0){
const ch=doc.splitTextToSize("Changes: "+result.changes.join(", "),175);
doc.text(ch,18,y);y+=ch.length*4.5;
}
if(result.issues&&result.issues.length>0){
const iss=doc.splitTextToSize("Issues: "+result.issues.join(", "),175);
doc.text(iss,18,y);y+=iss.length*4.5;
}
if(result.error){
doc.setTextColor(220,38,38);
const er=doc.splitTextToSize("Error: "+result.error,175);
doc.text(er,18,y);y+=er.length*4.5;
}
y+=4;
doc.setDrawColor(226,232,240);
doc.line(14,y,196,y);
y+=6;
});
const pageCount=doc.internal.getNumberOfPages();
for(let p=1;p<=pageCount;p++){
doc.setPage(p);
doc.setFontSize(8);
doc.setTextColor(148,163,184);
doc.text("StarBuild - Predictable, AST-verified, audit-ready legacy migration.  Page "+p+" of "+pageCount,pageW/2,290,{align:"center"});
}
doc.save("StarBuild_Migration_Summary_"+new Date().toISOString().slice(0,10)+".pdf");
};

const handleCopy=(idx,code)=>{
navigator.clipboard.writeText(code);
setCopied({...copied,[idx]:true});
setTimeout(()=>setCopied(prev=>({...prev,[idx]:false})),2000);
};

const totalIssues=results.reduce((acc,r)=>acc+(r.issues?r.issues.length:0),0);
const totalChanges=results.reduce((acc,r)=>acc+(r.changes?r.changes.length:0),0);
const migratedCount=results.filter(r=>r.migrated_code).length;

const scored=results.filter(r=>r.confidence_score!==undefined);
const highCount=scored.filter(r=>r.confidence_score>=90).length;
const medCount=scored.filter(r=>r.confidence_score>=60&&r.confidence_score<90).length;
const lowCount=scored.filter(r=>r.confidence_score<60).length;
const avgScore=scored.length>0?Math.round(scored.reduce((a,r)=>a+r.confidence_score,0)/scored.length):0;
const acceptedCount=scored.filter(r=>r.confidence_score>=threshold).length;
const reviewCount=scored.filter(r=>r.confidence_score<threshold).length;

const langs=["python","java","php","cobol"];
const lc={python:"#3b82f6",java:"#f59e0b",php:"#8b5cf6",cobol:"#10b981"};
const modes=[["analyze","Analyze","#38bdf8"],["migrate","Migrate","#22c55e"],["aimigrate","AI Migrate","#a78bfa"],["callgraph","Call Graph","#ec4899"],["risk","Risk Check","#f87171"],["debt","Tech Debt","#7c3aed"],["ai","AI Suggest","#f59e0b"],["explain","Explain","#38bdf8"],["tests","Gen Tests","#ec4899"]];

const confColor=(score)=>score>=90?"#4ade80":score>=60?"#f59e0b":"#f87171";
const riskColor=(lvl)=>lvl==="High"?"#f87171":lvl==="Medium"?"#f59e0b":"#4ade80";
const debtColor=(score)=>score>=60?"#f87171":score>=30?"#f59e0b":"#4ade80";

return(
<div style={{minHeight:"100vh",background:bg,color:text,fontFamily:"Arial",transition:"all 0.3s"}}>
<div style={{textAlign:"center",padding:"40px 20px",position:"relative"}}>
<button onClick={()=>setDarkMode(!darkMode)} style={{position:"absolute",right:"20px",top:"20px",padding:"8px 16px",borderRadius:"20px",border:"1px solid "+border,background:card,color:text,cursor:"pointer"}}>
{darkMode?"Light Mode":"Dark Mode"}
</button>
<button onClick={()=>setView("landing")} style={{position:"absolute",left:"20px",top:"20px",padding:"8px 16px",borderRadius:"20px",border:"1px solid "+border,background:card,color:text,cursor:"pointer"}}>
Home
</button>
<h1 style={{color:"#38bdf8"}}>StarBuild</h1>
<p style={{color:subtext}}>Transform your legacy code to modern standards</p>
</div>
<div style={{maxWidth:"800px",margin:"0 auto",padding:"0 20px 40px"}}>
<div style={{background:card,border:"1px solid "+border,borderRadius:"12px",padding:"24px",marginBottom:"16px"}}>
<div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"16px"}}>
{langs.map(lang=>(
<button key={lang} onClick={()=>setLanguage(lang)} style={{padding:"8px 16px",borderRadius:"20px",border:language===lang?"2px solid "+lc[lang]:"1px solid "+border,background:language===lang?lc[lang]+"22":"transparent",color:language===lang?lc[lang]:subtext,cursor:"pointer"}}>
{lang.toUpperCase()}
</button>
))}
</div>
<div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
{modes.map(([m,label,color])=>(
<button key={m} onClick={()=>setMode(m)} style={{flex:"1 1 22%",padding:"10px",borderRadius:"8px",border:mode===m?"2px solid "+color:"1px solid "+border,background:mode===m?color+"22":"transparent",color:mode===m?color:subtext,cursor:"pointer",fontSize:"13px"}}>
{label}
</button>
))}
</div>
{mode==="callgraph"&&(
<div style={{background:"rgba(236,72,153,0.1)",border:"1px solid rgba(236,72,153,0.3)",borderRadius:"8px",padding:"12px",marginBottom:"16px"}}>
<p style={{color:"#ec4899",fontSize:"13px",margin:0}}>Call Graph maps the structure of a Python file: which functions are defined, which functions call which, and what external libraries each function depends on. (Python files only.)</p>
</div>
)}
{mode==="risk"&&(
<div style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:"8px",padding:"12px",marginBottom:"16px"}}>
<p style={{color:"#f87171",fontSize:"13px",margin:0}}>Risk Check scans for external dependencies (databases, APIs, network libraries) that commonly break during migration, and assigns each a risk level with a recommendation. (Python files only.)</p>
</div>
)}
{mode==="debt"&&(
<div style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:"8px",padding:"12px",marginBottom:"16px"}}>
<p style={{color:"#a78bfa",fontSize:"13px",margin:0}}>Tech Debt counts legacy patterns in your code and estimates the manual remediation effort (in developer-hours). It turns code quality into a planning number. This is a code-based estimate, not a guarantee. (Python files only.)</p>
</div>
)}
{mode==="aimigrate"&&language==="python"&&(
<div style={{background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:"8px",padding:"12px",marginBottom:"16px"}}>
<p style={{color:"#a78bfa",fontSize:"13px",margin:0}}>AI Migrate modernizes your entire file. For Python, it runs syntax validation, a variable-integrity check, assigns a confidence score, explains each change, and flags dependency updates. Always review results before use.</p>
</div>
)}
{mode==="aimigrate"&&language==="java"&&(
<div style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:"8px",padding:"12px",marginBottom:"16px"}}>
<p style={{color:"#22c55e",fontSize:"13px",margin:0}}>AI Migrate for Java now includes guardrails: syntax validation (via AST parsing), name-integrity checks, a confidence score, and a smart fallback to rule-based migration when the AI is unreliable. Always review results before use.</p>
</div>
)}
{mode==="aimigrate"&&(language==="php"||language==="cobol")&&(
<div style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.4)",borderRadius:"8px",padding:"12px",marginBottom:"16px"}}>
<p style={{color:"#f87171",fontSize:"13px",margin:0}}>Note: AI Migrate for {language.toUpperCase()} is experimental and has no automated guardrails yet. For reliable results, use the rule-based <b>Migrate</b> mode instead.</p>
</div>
)}
<div style={{border:"2px dashed "+border,borderRadius:"8px",padding:"20px",textAlign:"center",marginBottom:"16px"}}>
<input type="file" multiple accept=".py,.java,.php,.cbl" onChange={e=>setFiles(Array.from(e.target.files))} id="fileInput" style={{display:"none"}}/>
<label htmlFor="fileInput" style={{cursor:"pointer",color:"#38bdf8"}}>
Click to select files (multiple allowed)
</label>
{files.length>0&&<p style={{color:subtext,marginTop:"8px"}}>{files.length} file(s) selected: {files.map(f=>f.name).join(", ")}</p>}
</div>
{files.length===0&&!loading&&results.length===0&&(
<div style={{background:"rgba(56,189,248,0.05)",border:"1px dashed rgba(56,189,248,0.3)",borderRadius:"8px",padding:"16px",marginBottom:"16px"}}>
<p style={{color:"#38bdf8",fontSize:"13px",fontWeight:"700",margin:"0 0 8px 0"}}>How to get started:</p>
<p style={{color:subtext,fontSize:"12.5px",margin:"4px 0"}}>1. Choose your language (Python, Java, PHP, or COBOL) above.</p>
<p style={{color:subtext,fontSize:"12.5px",margin:"4px 0"}}>2. Pick a mode &mdash; "Migrate" for reliable rule-based, or "AI Migrate" for AI with guardrails.</p>
<p style={{color:subtext,fontSize:"12.5px",margin:"4px 0"}}>3. Select one or more files and run. You'll get a confidence score and a side-by-side diff.</p>
</div>
)}
{loading&&(
<div style={{marginBottom:"16px"}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
<span style={{color:subtext,fontSize:"13px"}}>Processing files...</span>
<span style={{color:"#38bdf8",fontSize:"13px"}}>{progress}%</span>
</div>
<div style={{background:darkMode?"#334155":"#cbd5e1",borderRadius:"8px",height:"8px"}}>
<div style={{background:"#38bdf8",borderRadius:"8px",height:"8px",width:progress+"%",transition:"width 0.3s ease"}}></div>
</div>
</div>
)}
<button onClick={handleSubmit} disabled={loading} style={{width:"100%",padding:"12px",borderRadius:"8px",border:"none",background:loading?"#334155":"#38bdf8",color:loading?"#94a3b8":"#0a0e1a",fontWeight:"700",cursor:"pointer"}}>
{loading?`Processing ${results.length}/${files.length} files...`:mode==="analyze"?"Analyze Files":mode==="migrate"?"Migrate Files":mode==="aimigrate"?"AI Migrate (Full)":mode==="callgraph"?"Analyze Call Graph":mode==="risk"?"Run Risk Assessment":mode==="debt"?"Calculate Tech Debt":mode==="ai"?"Get AI Suggestions":mode==="explain"?"Explain Code":"Generate Tests"}
</button>
</div>
{results.length>0&&(
<div>
{scored.length>0&&(
<div style={{background:"linear-gradient(135deg,rgba(167,139,250,0.12),rgba(56,189,248,0.06))",border:"1px solid rgba(167,139,250,0.3)",borderRadius:"12px",padding:"20px",marginBottom:"16px"}}>
<h3 style={{color:"#a78bfa",margin:"0 0 12px 0",fontSize:"16px"}}>Batch Migration Summary</h3>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"12px"}}>
<div style={{textAlign:"center"}}><div style={{fontSize:"22px",fontWeight:"700",color:text}}>{scored.length}</div><div style={{fontSize:"11px",color:subtext}}>Files Migrated</div></div>
<div style={{textAlign:"center"}}><div style={{fontSize:"22px",fontWeight:"700",color:"#4ade80"}}>{highCount}</div><div style={{fontSize:"11px",color:subtext}}>High Confidence</div></div>
<div style={{textAlign:"center"}}><div style={{fontSize:"22px",fontWeight:"700",color:"#f59e0b"}}>{medCount}</div><div style={{fontSize:"11px",color:subtext}}>Need Review</div></div>
<div style={{textAlign:"center"}}><div style={{fontSize:"22px",fontWeight:"700",color:"#f87171"}}>{lowCount}</div><div style={{fontSize:"11px",color:subtext}}>Low Confidence</div></div>
</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:"12px"}}>
<span style={{color:subtext,fontSize:"13px"}}>Average confidence</span>
<span style={{color:confColor(avgScore),fontSize:"18px",fontWeight:"700"}}>{avgScore}%</span>
</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"8px"}}>
<span style={{color:subtext,fontSize:"13px"}}>At {threshold}% threshold</span>
<span style={{fontSize:"13px",fontWeight:"700"}}><span style={{color:"#4ade80"}}>{acceptedCount} accepted</span><span style={{color:subtext}}> / </span><span style={{color:"#f59e0b"}}>{reviewCount} review</span></span>
</div>
{reviewCount>0&&(
<p style={{color:subtext,fontSize:"12px",margin:"10px 0 0 0"}}>Flagged for manual review: {scored.filter(r=>r.confidence_score<threshold).map(r=>r.filename).join(", ")}</p>
)}
</div>
)}
<div style={{display:"flex",gap:"12px",marginBottom:"16px"}}>
{migratedCount>0&&(
<button onClick={handleDownloadAllZip} style={{flex:1,padding:"12px",borderRadius:"8px",border:"1px solid #f59e0b",background:"rgba(245,158,11,0.1)",color:"#f59e0b",fontWeight:"700",cursor:"pointer"}}>
Download All as ZIP ({migratedCount} files)
</button>
)}
<button onClick={handleDownloadReport} style={{flex:1,padding:"12px",borderRadius:"8px",border:"1px solid #a78bfa",background:"rgba(167,139,250,0.1)",color:"#a78bfa",fontWeight:"700",cursor:"pointer"}}>
Download Summary PDF
</button>
</div>
<h3 style={{color:"#38bdf8"}}>Results ({results.length} files)</h3>
{results.map((result,idx)=>(
<div key={idx} style={{background:card,border:"1px solid "+border,borderRadius:"12px",padding:"20px",marginBottom:"12px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
<h4 style={{color:"#38bdf8",margin:0}}>{result.filename}</h4>
{result.confidence_score!==undefined&&(
<span style={{padding:"3px 10px",borderRadius:"12px",fontSize:"11px",fontWeight:"700",background:result.confidence_score>=threshold?"rgba(74,222,128,0.15)":"rgba(245,158,11,0.15)",color:result.confidence_score>=threshold?"#4ade80":"#f59e0b",border:"1px solid "+(result.confidence_score>=threshold?"#4ade80":"#f59e0b")}}>
{result.confidence_score>=threshold?"ACCEPTED":"MANUAL REVIEW"}
</span>
)}
</div>
{result.error&&<p style={{color:"#f87171",fontSize:"13px"}}>{result.error}</p>}
{result.call_graph_error&&<div style={{background:"rgba(248,113,113,0.1)",border:"1px solid #f87171",borderRadius:"10px",padding:"12px"}}><p style={{color:"#f87171",fontSize:"13px",margin:0}}>{result.call_graph_error}</p></div>}
{result.debt_score!==undefined&&(
<div style={{marginTop:"4px"}}>
<div style={{background:debtColor(result.debt_score)+"1a",border:"1px solid "+debtColor(result.debt_score),borderRadius:"10px",padding:"14px",marginBottom:"12px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontWeight:"700",fontSize:"15px",color:debtColor(result.debt_score)}}>Technical Debt Score: {result.debt_score}/100</span>
<span style={{fontSize:"13px",fontWeight:"600",color:debtColor(result.debt_score)}}>{result.debt_level}</span>
</div>
<div style={{background:darkMode?"#334155":"#cbd5e1",borderRadius:"6px",height:"8px",marginTop:"8px"}}>
<div style={{background:debtColor(result.debt_score),borderRadius:"6px",height:"8px",width:result.debt_score+"%"}}></div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px",marginTop:"12px"}}>
<div style={{textAlign:"center",background:codebg,borderRadius:"8px",padding:"10px"}}>
<div style={{fontSize:"20px",fontWeight:"700",color:text}}>{result.total_issues}</div>
<div style={{fontSize:"11px",color:subtext}}>Legacy Issues</div>
</div>
<div style={{textAlign:"center",background:codebg,borderRadius:"8px",padding:"10px"}}>
<div style={{fontSize:"20px",fontWeight:"700",color:"#a78bfa"}}>~{result.estimated_hours}h</div>
<div style={{fontSize:"11px",color:subtext}}>Est. Remediation Effort</div>
</div>
</div>
</div>
{result.items&&result.items.length>0&&(
<div style={{marginBottom:"8px"}}>
<p style={{color:"#a78bfa",fontSize:"13px",fontWeight:"700",margin:"0 0 6px 0"}}>Debt Breakdown:</p>
<div style={{background:codebg,borderRadius:"8px",padding:"12px"}}>
{result.items.map((it,ii)=>(
<div key={ii} style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px",marginBottom:"4px",color:text}}>
<span style={{fontFamily:"monospace"}}>{it.issue} <span style={{color:subtext}}>x{it.occurrences}</span></span>
<span style={{color:subtext}}>~{it.estimated_minutes} min</span>
</div>
))}
</div>
</div>
)}
{result.summary&&<p style={{color:text,fontSize:"13px",margin:"8px 0 4px 0"}}>{result.summary}</p>}
{result.disclaimer&&<p style={{color:subtext,fontSize:"11px",fontStyle:"italic",marginTop:"4px"}}>{result.disclaimer}</p>}
</div>
)}
{result.overall_risk!==undefined&&(
<div style={{marginTop:"4px"}}>
<div style={{background:(result.high_count>0?"rgba(248,113,113,0.12)":result.medium_count>0?"rgba(245,158,11,0.12)":"rgba(74,222,128,0.12)"),border:"1px solid "+(result.high_count>0?"#f87171":result.medium_count>0?"#f59e0b":"#4ade80"),borderRadius:"10px",padding:"14px",marginBottom:"12px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontWeight:"700",fontSize:"15px",color:(result.high_count>0?"#f87171":result.medium_count>0?"#f59e0b":"#4ade80")}}>Risk Assessment: {result.overall_risk}</span>
<span style={{fontSize:"12px",color:subtext}}>{result.total_findings} dependency findings</span>
</div>
<div style={{display:"flex",gap:"16px",marginTop:"8px"}}>
<span style={{fontSize:"12px",color:"#f87171"}}>High: {result.high_count}</span>
<span style={{fontSize:"12px",color:"#f59e0b"}}>Medium: {result.medium_count}</span>
<span style={{fontSize:"12px",color:"#4ade80"}}>Low: {result.low_count}</span>
</div>
</div>
{result.findings&&result.findings.length>0?(
<div>
{result.findings.map((f,fi)=>(
<div key={fi} style={{background:codebg,border:"1px solid "+riskColor(f.risk_level)+"55",borderRadius:"10px",padding:"12px",marginBottom:"8px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
<span style={{fontWeight:"700",fontSize:"14px",color:text,fontFamily:"monospace"}}>{f.dependency}</span>
<div style={{display:"flex",gap:"6px",alignItems:"center"}}>
<span style={{fontSize:"10px",color:subtext,background:darkMode?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",padding:"2px 8px",borderRadius:"10px"}}>{f.category}</span>
<span style={{fontSize:"10px",fontWeight:"700",color:riskColor(f.risk_level),background:riskColor(f.risk_level)+"22",padding:"2px 8px",borderRadius:"10px"}}>{f.risk_level}</span>
</div>
</div>
<p style={{color:subtext,fontSize:"12.5px",margin:"4px 0",lineHeight:"1.4"}}>{f.description}</p>
<p style={{color:"#38bdf8",fontSize:"12px",margin:"4px 0 0 0",lineHeight:"1.4"}}>→ {f.recommendation}</p>
</div>
))}
</div>
):(
<p style={{color:"#4ade80",fontSize:"13px"}}>No known risky external dependencies detected.</p>
)}
{result.disclaimer&&!result.debt_score&&<p style={{color:subtext,fontSize:"11px",fontStyle:"italic",marginTop:"8px"}}>{result.disclaimer}</p>}
</div>
)}
{result.total_functions!==undefined&&(
<div style={{marginTop:"4px"}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px",marginBottom:"14px"}}>
<div style={{background:"rgba(236,72,153,0.1)",border:"1px solid rgba(236,72,153,0.3)",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
<div style={{fontSize:"22px",fontWeight:"700",color:"#ec4899"}}>{result.total_functions}</div>
<div style={{fontSize:"11px",color:subtext}}>Functions Defined</div>
</div>
<div style={{background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.3)",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
<div style={{fontSize:"22px",fontWeight:"700",color:"#38bdf8"}}>{result.imports?result.imports.length:0}</div>
<div style={{fontSize:"11px",color:subtext}}>External Libraries</div>
</div>
</div>
{result.entry_points&&result.entry_points.length>0&&(
<div style={{marginBottom:"12px"}}>
<p style={{color:"#4ade80",fontSize:"13px",fontWeight:"700",margin:"0 0 4px 0"}}>Entry Points (not called by others):</p>
<p style={{color:subtext,fontSize:"12.5px",margin:0}}>{result.entry_points.join(", ")}</p>
</div>
)}
{result.calls_map&&Object.keys(result.calls_map).length>0&&(
<div style={{marginBottom:"12px"}}>
<p style={{color:"#ec4899",fontSize:"13px",fontWeight:"700",margin:"0 0 6px 0"}}>Function Call Map:</p>
<div style={{background:codebg,borderRadius:"8px",padding:"12px"}}>
{Object.entries(result.calls_map).map(([fn,calls],ci)=>(
<div key={ci} style={{fontSize:"12.5px",fontFamily:"monospace",marginBottom:"4px",color:text}}>
<span style={{color:"#38bdf8"}}>{fn}()</span>
{calls.length>0?<span style={{color:subtext}}> → calls: {calls.map(c=>c+"()").join(", ")}</span>:<span style={{color:"#64748b"}}> → (no internal calls)</span>}
</div>
))}
</div>
</div>
)}
{result.lib_usage&&Object.keys(result.lib_usage).length>0&&(
<div style={{marginBottom:"4px"}}>
<p style={{color:"#38bdf8",fontSize:"13px",fontWeight:"700",margin:"0 0 6px 0"}}>Library Dependencies (which function uses what):</p>
<div style={{background:codebg,borderRadius:"8px",padding:"12px"}}>
{Object.entries(result.lib_usage).map(([lib,fns],li)=>(
<div key={li} style={{fontSize:"12.5px",fontFamily:"monospace",marginBottom:"4px",color:text}}>
<span style={{color:"#f59e0b"}}>{lib}</span><span style={{color:subtext}}> ← used in: {fns.map(f=>f+"()").join(", ")}</span>
</div>
))}
</div>
</div>
)}
</div>
)}
{result.confidence_score!==undefined&&(
<div style={{background:confColor(result.confidence_score)+"1a",border:"1px solid "+confColor(result.confidence_score),borderRadius:"10px",padding:"14px",marginBottom:"12px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{color:confColor(result.confidence_score),fontWeight:"700",fontSize:"15px"}}>Migration Confidence: {result.confidence_score}%</span>
<span style={{color:confColor(result.confidence_score),fontSize:"13px",fontWeight:"600"}}>{result.confidence_level}</span>
</div>
<div style={{background:darkMode?"#334155":"#cbd5e1",borderRadius:"6px",height:"8px",marginTop:"8px"}}>
<div style={{background:confColor(result.confidence_score),borderRadius:"6px",height:"8px",width:result.confidence_score+"%"}}></div>
</div>
<p style={{color:subtext,fontSize:"12px",margin:"8px 0 0 0"}}>Checks: {result.confidence_reason}</p>
</div>
)}
{result.ai_powered&&<p style={{color:"#a78bfa",fontSize:"12px"}}>AI-powered migration — please review carefully before use.</p>}
{result.experimental_message&&<div style={{background:"rgba(248,113,113,0.1)",border:"1px solid #f87171",borderRadius:"10px",padding:"12px",marginBottom:"10px"}}><p style={{color:"#f87171",fontSize:"12px",fontWeight:"bold",margin:0}}>⚠ {result.experimental_message}</p></div>}
{result.validation_message&&<p style={{color:result.valid?"#4ade80":"#f87171",fontSize:"12px",fontWeight:"bold"}}>{result.valid?"✓ ":"⚠ "}{result.validation_message}</p>}
{result.verify_message&&<p style={{color:result.verified?"#4ade80":"#f87171",fontSize:"12px",fontWeight:"bold"}}>{result.verified?"✓ ":"⚠ "}{result.verify_message}</p>}
{result.var_message&&<p style={{color:result.vars_ok?"#4ade80":"#f87171",fontSize:"12px",fontWeight:"bold"}}>{result.vars_ok?"✓ ":"⚠ "}{result.var_message}</p>}
{result.note_java&&<p style={{color:subtext,fontSize:"11px",fontStyle:"italic",marginTop:"4px"}}>{result.note_java}</p>}
{result.dependencies&&result.dependencies.length>0&&(
<div style={{marginTop:"10px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:"10px",padding:"12px"}}>
<p style={{color:"#f59e0b",fontSize:"13px",fontWeight:"700",margin:"0 0 6px 0"}}>Dependency Updates Required:</p>
{result.dependencies.map((dep,di)=>(<p key={di} style={{color:subtext,fontSize:"12px",margin:"3px 0"}}>• {dep}</p>))}
</div>
)}
{result.why_explanations&&result.why_explanations.length>0&&(
<div style={{marginTop:"10px",marginBottom:"4px"}}>
<button onClick={()=>setShowWhy(prev=>({...prev,[idx]:!prev[idx]}))} style={{padding:"6px 14px",borderRadius:"8px",border:"1px solid #38bdf8",background:"transparent",color:"#38bdf8",cursor:"pointer",fontSize:"13px",fontWeight:"600"}}>
{showWhy[idx]?"Hide Why":"Why these changes?"}
</button>
{showWhy[idx]&&(
<div style={{marginTop:"10px",background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:"10px",padding:"14px"}}>
{result.why_explanations.map((w,wi)=>(
<div key={wi} style={{marginBottom:wi<result.why_explanations.length-1?"12px":0,paddingBottom:wi<result.why_explanations.length-1?"12px":0,borderBottom:wi<result.why_explanations.length-1?"1px solid rgba(255,255,255,0.08)":"none"}}>
<div style={{color:"#38bdf8",fontSize:"13px",fontWeight:"700",marginBottom:"4px"}}>{w.change}</div>
<div style={{color:subtext,fontSize:"12.5px",lineHeight:"1.5"}}>{w.why}</div>
</div>
))}
</div>
)}
</div>
)}
{result.functions&&result.functions.length>0&&<p style={{fontSize:"13px",color:text}}>Functions: {result.functions.join(", ")}</p>}
{result.classes&&result.classes.length>0&&<p style={{fontSize:"13px",color:text}}>Classes: {result.classes.join(", ")}</p>}
{result.imports&&result.imports.length>0&&result.total_functions===undefined&&result.overall_risk===undefined&&<p style={{fontSize:"13px",color:text}}>Imports: {result.imports.join(", ")}</p>}
{result.issues&&<p style={{color:result.issues.length>0?"#f87171":"#4ade80",fontSize:"13px"}}>Issues: {result.issues.length>0?result.issues.join(", "):"No issues!"}</p>}
{result.changes&&<p style={{color:"#4ade80",fontSize:"13px"}}>Changes: {result.changes.length>0?result.changes.join(", "):"No changes needed!"}</p>}
{result.suggestions&&(
<div style={{marginTop:"8px"}}>
<p style={{color:"#f59e0b",fontSize:"13px",fontWeight:"bold"}}>AI Suggestions:</p>
<pre style={{background:codebg,color:text,padding:"12px",borderRadius:"8px",overflow:"auto",fontSize:"11px",maxHeight:"250px",whiteSpace:"pre-wrap"}}>{result.suggestions}</pre>
</div>
)}
{result.explanation&&(
<div style={{marginTop:"8px"}}>
<p style={{color:"#38bdf8",fontSize:"13px",fontWeight:"bold"}}>Code Explanation:</p>
<pre style={{background:codebg,color:text,padding:"12px",borderRadius:"8px",overflow:"auto",fontSize:"11px",maxHeight:"300px",whiteSpace:"pre-wrap"}}>{result.explanation}</pre>
</div>
)}
{result.tests&&(
<div style={{marginTop:"8px"}}>
<p style={{color:"#ec4899",fontSize:"13px",fontWeight:"bold"}}>Generated Tests:</p>
<pre style={{background:codebg,color:text,padding:"12px",borderRadius:"8px",overflow:"auto",fontSize:"11px",maxHeight:"300px",whiteSpace:"pre-wrap"}}>{result.tests}</pre>
</div>
)}
{result.migrated_code&&(
<div style={{marginTop:"12px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
<span style={{color:"#38bdf8",fontSize:"13px",fontWeight:"bold"}}>Diff View (line-by-line):</span>
<div style={{display:"flex",gap:"8px"}}>
<button onClick={()=>handleCopy(idx,result.migrated_code)} style={{padding:"4px 12px",borderRadius:"6px",border:"1px solid #38bdf8",background:copied[idx]?"#38bdf8":"transparent",color:copied[idx]?"#0a0e1a":"#38bdf8",cursor:"pointer",fontSize:"12px"}}>
{copied[idx]?"Copied!":"Copy"}
</button>
<button onClick={()=>handleDownload(result)} style={{padding:"4px 12px",borderRadius:"6px",border:"1px solid #22c55e",background:"transparent",color:"#22c55e",cursor:"pointer",fontSize:"12px"}}>
Download
</button>
</div>
</div>
<ReactDiffViewer
oldValue={result.original_code||""}
newValue={result.migrated_code||""}
splitView={true}
useDarkTheme={darkMode}
hideLineNumbers={false}
leftTitle="Original"
rightTitle="Migrated"
/>
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