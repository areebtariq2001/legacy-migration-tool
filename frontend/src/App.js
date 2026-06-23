import{useState}from"react";
import ReactDiffViewer from"react-diff-viewer-continued";
import JSZip from"jszip";
import jsPDF from"jspdf";

function ApiDocs({onBack}){
const codeStyle={background:"#1e293b",color:"#e2e8f0",padding:"16px",borderRadius:"8px",overflow:"auto",fontSize:"13px",fontFamily:"monospace",whiteSpace:"pre-wrap"};
return(
<div style={{minHeight:"100vh",background:"#0f172a",color:"white",fontFamily:"Arial",padding:"40px 20px"}}>
<div style={{maxWidth:"800px",margin:"0 auto"}}>
<button onClick={onBack} style={{padding:"8px 16px",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)",color:"white",cursor:"pointer",marginBottom:"24px"}}>
Back to Home
</button>
<h1 style={{color:"#38bdf8",marginBottom:"8px"}}>StarBuild API Documentation</h1>
<p style={{color:"#94a3b8",marginBottom:"32px"}}>Integrate StarBuild into your CI/CD pipeline or applications.</p>

<h2 style={{color:"#38bdf8",fontSize:"20px",marginBottom:"12px"}}>Base URL</h2>
<div style={codeStyle}>https://legacy-migration-tool-1.onrender.com</div>

<h2 style={{color:"#38bdf8",fontSize:"20px",margin:"24px 0 12px"}}>Endpoints</h2>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#22c55e",fontWeight:"bold"}}>POST /analyze</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>Analyze Python code for legacy issues</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#22c55e",fontWeight:"bold"}}>POST /migrate</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>Migrate Python 2 code to Python 3</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#22c55e",fontWeight:"bold"}}>POST /analyze-java, /migrate-java</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>Java code analysis and migration</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#22c55e",fontWeight:"bold"}}>POST /analyze-php, /migrate-php</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>PHP code analysis and migration</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"12px"}}>
<p style={{color:"#22c55e",fontWeight:"bold"}}>POST /analyze-cobol, /migrate-cobol</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>COBOL code analysis and migration</p>
</div>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"16px",marginBottom:"24px"}}>
<p style={{color:"#f59e0b",fontWeight:"bold"}}>POST /ai-suggest</p>
<p style={{color:"#94a3b8",fontSize:"13px",margin:"4px 0"}}>Get AI-powered code improvement suggestions</p>
</div>

<h2 style={{color:"#38bdf8",fontSize:"20px",margin:"24px 0 12px"}}>Example: cURL</h2>
<div style={codeStyle}>{`curl -X POST \\
  https://legacy-migration-tool-1.onrender.com/migrate \\
  -F "file=@myscript.py"`}</div>

<h2 style={{color:"#38bdf8",fontSize:"20px",margin:"24px 0 12px"}}>Example: Python</h2>
<div style={codeStyle}>{`import requests

url = "https://legacy-migration-tool-1.onrender.com/migrate"
files = {"file": open("myscript.py", "rb")}
response = requests.post(url, files=files)
print(response.json())`}</div>

<h2 style={{color:"#38bdf8",fontSize:"20px",margin:"24px 0 12px"}}>Example: JavaScript</h2>
<div style={codeStyle}>{`const formData = new FormData();
formData.append("file", fileInput.files[0]);

fetch("https://legacy-migration-tool-1.onrender.com/migrate", {
  method: "POST",
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));`}</div>

<h2 style={{color:"#38bdf8",fontSize:"20px",margin:"24px 0 12px"}}>Response Format</h2>
<div style={codeStyle}>{`{
  "migrated_code": "...",
  "changes": ["xrange -> range", "raw_input -> input"],
  "filename": "myscript.py"
}`}</div>

<div style={{color:"#64748b",fontSize:"13px",marginTop:"40px",textAlign:"center"}}>2026 StarBuild - API Documentation</div>
</div>
</div>
);
}

function LandingPage({onLaunch,onApiDocs}){
return(
<div style={{minHeight:"100vh",background:"linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",color:"white",fontFamily:"Arial",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"40px 20px"}}>
<div style={{background:"rgba(56,189,248,0.1)",border:"1px solid #38bdf8",color:"#38bdf8",padding:"6px 16px",borderRadius:"20px",fontSize:"13px",marginBottom:"24px"}}>
AI-Powered Code Migration
</div>
<h1 style={{fontSize:"56px",color:"#38bdf8",marginBottom:"16px"}}>StarBuild</h1>
<p style={{fontSize:"20px",color:"#94a3b8",marginBottom:"40px",maxWidth:"600px"}}>
Transform your legacy code to modern standards instantly. Supports Python, Java, PHP, and COBOL.
</p>
<div style={{display:"flex",gap:"12px",marginBottom:"60px",flexWrap:"wrap",justifyContent:"center"}}>
<button onClick={onLaunch} style={{background:"#38bdf8",color:"#0f172a",padding:"16px 40px",borderRadius:"8px",fontSize:"18px",fontWeight:"700",border:"none",cursor:"pointer"}}>
Launch Tool Free
</button>
<button onClick={onApiDocs} style={{background:"transparent",color:"#38bdf8",padding:"16px 40px",borderRadius:"8px",fontSize:"18px",fontWeight:"700",border:"1px solid #38bdf8",cursor:"pointer"}}>
API Docs
</button>
</div>
<div style={{display:"flex",gap:"12px",justifyContent:"center",marginBottom:"60px",flexWrap:"wrap"}}>
{[["Python","#3b82f6"],["Java","#f59e0b"],["PHP","#8b5cf6"],["COBOL","#10b981"]].map(([lang,color])=>(
<span key={lang} style={{padding:"8px 20px",borderRadius:"20px",fontWeight:"700",fontSize:"14px",background:color+"33",color:color,border:"1px solid "+color}}>
{lang}
</span>
))}
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"24px",maxWidth:"900px",marginBottom:"60px"}}>
{[
["Instant Migration","Upload files and get migrated code in seconds"],
["Diff Viewer","See exactly what changed side by side"],
["Batch Processing","Migrate multiple files at once"],
["AI Suggestions","Get intelligent improvement suggestions"],
["PDF Reports","Download professional migration reports"],
["100% Free","No credit card required"]
].map(([title,desc])=>(
<div key={title} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"24px"}}>
<div style={{color:"#38bdf8",fontSize:"16px",fontWeight:"700",marginBottom:"8px"}}>{title}</div>
<div style={{color:"#94a3b8",fontSize:"13px"}}>{desc}</div>
</div>
))}
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"24px",maxWidth:"600px",marginBottom:"40px"}}>
{[["4+","Languages"],["Unlimited","Files"],["$0","Cost"]].map(([num,label])=>(
<div key={label} style={{textAlign:"center"}}>
<div style={{fontSize:"36px",fontWeight:"700",color:"#38bdf8"}}>{num}</div>
<div style={{fontSize:"13px",color:"#94a3b8"}}>{label}</div>
</div>
))}
</div>
<div style={{color:"#64748b",fontSize:"13px"}}>2026 StarBuild - Built with AI</div>
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
const API="https://legacy-migration-tool-1.onrender.com";

const bg=darkMode?"#0f172a":"#f1f5f9";
const card=darkMode?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)";
const border=darkMode?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)";
const text=darkMode?"white":"#0f172a";
const subtext=darkMode?"#94a3b8":"#64748b";
const codebg=darkMode?"#0f172a":"#e2e8f0";

if(view==="landing")return <LandingPage onLaunch={()=>setView("tool")} onApiDocs={()=>setView("apidocs")}/>;
if(view==="apidocs")return <ApiDocs onBack={()=>setView("landing")}/>;

const handleSubmit=async()=>{
if(files.length===0)return alert("Please select files first!");
setLoading(true);
setResults([]);
setProgress(0);
setCopied({});
const allResults=[];
for(let i=0;i<files.length;i++){
const originalCode=await files[i].text();
const formData=new FormData();
formData.append("file",files[i]);
let endpoint="/analyze";
if(mode==="ai"){endpoint="/ai-suggest";}
else if(language==="python"){endpoint=mode==="analyze"?"/analyze":"/migrate";}
else if(language==="java"){endpoint=mode==="analyze"?"/analyze-java":"/migrate-java";}
else if(language==="php"){endpoint=mode==="analyze"?"/analyze-php":"/migrate-php";}
else if(language==="cobol"){endpoint=mode==="analyze"?"/analyze-cobol":"/migrate-cobol";}
try{
const res=await fetch(API+endpoint,{method:"POST",body:formData});
const data=await res.json();
data.filename=files[i].name;
data.original_code=originalCode;
allResults.push(data);
}catch(e){
allResults.push({filename:files[i].name,error:"Failed to process"});
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
const date=new Date().toLocaleDateString();
doc.setFontSize(20);
doc.setTextColor(56,189,248);
doc.text("StarBuild Migration Report",105,20,{align:"center"});
doc.setFontSize(10);
doc.setTextColor(100,116,139);
doc.text("Generated: "+date,105,28,{align:"center"});
doc.setFontSize(12);
doc.setTextColor(0,0,0);
doc.text("Summary",14,40);
doc.setFontSize(10);
doc.text("Total Files: "+results.length,14,48);
const totalIssues=results.reduce((acc,r)=>acc+(r.issues?r.issues.length:0),0);
const totalChanges=results.reduce((acc,r)=>acc+(r.changes?r.changes.length:0),0);
doc.text("Total Issues Found: "+totalIssues,14,54);
doc.text("Total Changes Made: "+totalChanges,14,60);
let y=74;
results.forEach((result,idx)=>{
if(y>270){doc.addPage();y=20;}
doc.setFontSize(12);
doc.setTextColor(56,189,248);
doc.text((idx+1)+". "+result.filename,14,y);
y+=8;
doc.setFontSize(9);
doc.setTextColor(0,0,0);
if(result.issues&&result.issues.length>0){
doc.text("Issues:",14,y);y+=5;
result.issues.forEach(issue=>{
if(y>270){doc.addPage();y=20;}
const lines=doc.splitTextToSize("  - "+issue,180);
doc.text(lines,14,y);
y+=lines.length*5;
});
}
if(result.changes&&result.changes.length>0){
doc.text("Changes:",14,y);y+=5;
result.changes.forEach(change=>{
if(y>270){doc.addPage();y=20;}
doc.text("  - "+change,14,y);y+=5;
});
}
if(result.suggestions){
doc.text("AI Suggestions:",14,y);y+=5;
const lines=doc.splitTextToSize(result.suggestions,180);
lines.slice(0,10).forEach(line=>{
if(y>270){doc.addPage();y=20;}
doc.text(line,14,y);y+=5;
});
}
y+=8;
});
doc.save("starbuild_report_"+date.replace(/\//g,"-")+".pdf");
};

const handleCopy=(idx,code)=>{
navigator.clipboard.writeText(code);
setCopied({...copied,[idx]:true});
setTimeout(()=>setCopied(prev=>({...prev,[idx]:false})),2000);
};

const totalIssues=results.reduce((acc,r)=>acc+(r.issues?r.issues.length:0),0);
const totalChanges=results.reduce((acc,r)=>acc+(r.changes?r.changes.length:0),0);
const migratedCount=results.filter(r=>r.migrated_code).length;
const langs=["python","java","php","cobol"];
const lc={python:"#3b82f6",java:"#f59e0b",php:"#8b5cf6",cobol:"#10b981"};

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
<div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
{[["analyze","Analyze","#38bdf8"],["migrate","Migrate","#22c55e"],["ai","AI Suggest","#f59e0b"]].map(([m,label,color])=>(
<button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",borderRadius:"8px",border:mode===m?"2px solid "+color:"1px solid "+border,background:mode===m?color+"22":"transparent",color:mode===m?color:subtext,cursor:"pointer"}}>
{label}
</button>
))}
</div>
<div style={{border:"2px dashed "+border,borderRadius:"8px",padding:"20px",textAlign:"center",marginBottom:"16px"}}>
<input type="file" multiple accept=".py,.java,.php,.cbl" onChange={e=>setFiles(Array.from(e.target.files))} id="fileInput" style={{display:"none"}}/>
<label htmlFor="fileInput" style={{cursor:"pointer",color:"#38bdf8"}}>
Click to select files (multiple allowed)
</label>
{files.length>0&&<p style={{color:subtext,marginTop:"8px"}}>{files.length} file(s) selected: {files.map(f=>f.name).join(", ")}</p>}
</div>
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
<button onClick={handleSubmit} disabled={loading} style={{width:"100%",padding:"12px",borderRadius:"8px",border:"none",background:loading?"#334155":"#38bdf8",color:loading?"#94a3b8":"#0f172a",fontWeight:"700",cursor:"pointer"}}>
{loading?`Processing ${results.length}/${files.length} files...`:mode==="analyze"?"Analyze Files":mode==="migrate"?"Migrate Files":"Get AI Suggestions"}
</button>
</div>
{results.length>0&&(
<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"16px"}}>
<div style={{background:"rgba(56,189,248,0.1)",border:"1px solid #38bdf8",borderRadius:"12px",padding:"16px",textAlign:"center"}}>
<div style={{fontSize:"24px",fontWeight:"700",color:"#38bdf8"}}>{results.length}</div>
<div style={{fontSize:"12px",color:subtext}}>Files Processed</div>
</div>
<div style={{background:"rgba(248,113,113,0.1)",border:"1px solid #f87171",borderRadius:"12px",padding:"16px",textAlign:"center"}}>
<div style={{fontSize:"24px",fontWeight:"700",color:"#f87171"}}>{totalIssues}</div>
<div style={{fontSize:"12px",color:subtext}}>Issues Found</div>
</div>
<div style={{background:"rgba(74,222,128,0.1)",border:"1px solid #4ade80",borderRadius:"12px",padding:"16px",textAlign:"center"}}>
<div style={{fontSize:"24px",fontWeight:"700",color:"#4ade80"}}>{totalChanges}</div>
<div style={{fontSize:"12px",color:subtext}}>Changes Made</div>
</div>
<div style={{background:"rgba(245,158,11,0.1)",border:"1px solid #f59e0b",borderRadius:"12px",padding:"16px",textAlign:"center"}}>
<div style={{fontSize:"24px",fontWeight:"700",color:"#f59e0b"}}>{migratedCount}</div>
<div style={{fontSize:"12px",color:subtext}}>Files Migrated</div>
</div>
</div>
<div style={{display:"flex",gap:"12px",marginBottom:"16px"}}>
{migratedCount>0&&(
<button onClick={handleDownloadAllZip} style={{flex:1,padding:"12px",borderRadius:"8px",border:"1px solid #f59e0b",background:"rgba(245,158,11,0.1)",color:"#f59e0b",fontWeight:"700",cursor:"pointer"}}>
Download All as ZIP ({migratedCount} files)
</button>
)}
<button onClick={handleDownloadReport} style={{flex:1,padding:"12px",borderRadius:"8px",border:"1px solid #a78bfa",background:"rgba(167,139,250,0.1)",color:"#a78bfa",fontWeight:"700",cursor:"pointer"}}>
Download PDF Report
</button>
</div>
<h3 style={{color:"#38bdf8"}}>Results ({results.length} files)</h3>
{results.map((result,idx)=>(
<div key={idx} style={{background:card,border:"1px solid "+border,borderRadius:"12px",padding:"20px",marginBottom:"12px"}}>
<h4 style={{color:"#38bdf8",margin:"0 0 8px 0"}}>{result.filename}</h4>
{result.error&&<p style={{color:"#f87171"}}>{result.error}</p>}
{result.functions&&result.functions.length>0&&<p style={{fontSize:"13px",color:text}}>Functions: {result.functions.join(", ")}</p>}
{result.classes&&result.classes.length>0&&<p style={{fontSize:"13px",color:text}}>Classes: {result.classes.join(", ")}</p>}
{result.imports&&result.imports.length>0&&<p style={{fontSize:"13px",color:text}}>Imports: {result.imports.join(", ")}</p>}
{result.issues&&<p style={{color:result.issues.length>0?"#f87171":"#4ade80",fontSize:"13px"}}>Issues: {result.issues.length>0?result.issues.join(", "):"No issues!"}</p>}
{result.changes&&<p style={{color:"#4ade80",fontSize:"13px"}}>Changes: {result.changes.length>0?result.changes.join(", "):"No changes needed!"}</p>}
{result.suggestions&&(
<div style={{marginTop:"8px"}}>
<p style={{color:"#f59e0b",fontSize:"13px",fontWeight:"bold"}}>AI Suggestions:</p>
<pre style={{background:codebg,color:text,padding:"12px",borderRadius:"8px",overflow:"auto",fontSize:"11px",maxHeight:"200px",whiteSpace:"pre-wrap"}}>{result.suggestions}</pre>
</div>
)}
{result.migrated_code&&(
<div style={{marginTop:"12px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
<span style={{color:"#38bdf8",fontSize:"13px",fontWeight:"bold"}}>Diff View:</span>
<div style={{display:"flex",gap:"8px"}}>
<button onClick={()=>handleCopy(idx,result.migrated_code)} style={{padding:"4px 12px",borderRadius:"6px",border:"1px solid #38bdf8",background:copied[idx]?"#38bdf8":"transparent",color:copied[idx]?"#0f172a":"#38bdf8",cursor:"pointer",fontSize:"12px"}}>
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