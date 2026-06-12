import{useState}from"react";
function App(){
const[file,setFile]=useState(null);
const[result,setResult]=useState(null);
const[loading,setLoading]=useState(false);
const[mode,setMode]=useState("analyze");
const[language,setLanguage]=useState("python");
const[copied,setCopied]=useState(false);
const API="https://legacy-migration-tool-1.onrender.com";
const handleSubmit=async()=>{
if(!file)return alert("Please select a file first!");
setLoading(true);
const formData=new FormData();
formData.append("file",file);
let endpoint="/analyze";
if(language==="python")endpoint=mode==="analyze"?"/analyze":"/migrate";
if(language==="java")endpoint=mode==="analyze"?"/analyze-java":"/migrate-java";
if(language==="php")endpoint=mode==="analyze"?"/analyze-php":"/migrate-php";
if(language==="cobol")endpoint=mode==="analyze"?"/analyze-cobol":"/migrate-cobol";
if(mode==="ai")endpoint="/ai-suggest";
const res=await fetch(API+endpoint,{method:"POST",body:formData});
const data=await res.json();
setResult(data);
setLoading(false);
};
const handleDownload=async()=>{
if(!file)return alert("Please select a file first!");
const formData=new FormData();
formData.append("file",file);
let endpoint="/download";
if(language==="java")endpoint="/migrate-java";
if(language==="php")endpoint="/migrate-php";
if(language==="cobol")endpoint="/migrate-cobol";
const res=await fetch(API+endpoint,{method:"POST",body:formData});
const blob=await res.blob();
const url=window.URL.createObjectURL(blob);
const a=document.createElement("a");
a.href=url;
a.download=file.name;
a.click();
};
const handleCopy=()=>{
if(result&&result.migrated_code){
navigator.clipboard.writeText(result.migrated_code);
setCopied(true);
setTimeout(()=>setCopied(false),2000);
}
};
const langs=["python","java","php","cobol"];
const lc={python:"#3b82f6",java:"#f59e0b",php:"#8b5cf6",cobol:"#10b981"};
return(
<div style={{minHeight:"100vh",background:"#0f172a",color:"white",fontFamily:"Arial"}}>
<div style={{textAlign:"center",padding:"40px 20px"}}>
<h1 style={{color:"#38bdf8"}}>Legacy Code Migration Tool</h1>
<p style={{color:"#94a3b8"}}>Transform your legacy code to modern standards</p>
</div>
<div style={{maxWidth:"600px",margin:"0 auto",padding:"0 20px 40px"}}>
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"24px",marginBottom:"16px"}}>
<div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"16px"}}>
{langs.map(lang=>(
<button key={lang} onClick={()=>setLanguage(lang)} style={{padding:"8px 16px",borderRadius:"20px",border:language===lang?"2px solid "+lc[lang]:"1px solid rgba(255,255,255,0.2)",background:language===lang?lc[lang]+"22":"transparent",color:language===lang?lc[lang]:"#94a3b8",cursor:"pointer"}}>
{lang.toUpperCase()}
</button>
))}
</div>
<div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
{[["analyze","Analyze","#38bdf8"],["migrate","Migrate","#22c55e"],["ai","AI Suggest","#f59e0b"]].map(([m,label,color])=>(
<button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",borderRadius:"8px",border:mode===m?"2px solid "+color:"1px solid rgba(255,255,255,0.1)",background:mode===m?color+"22":"transparent",color:mode===m?color:"#94a3b8",cursor:"pointer"}}>
{label}
</button>
))}
</div>
<input type="file" accept=".py,.java,.php,.cbl" onChange={e=>setFile(e.target.files[0])} style={{width:"100%",padding:"10px",marginBottom:"16px",background:"#334155",border:"none",borderRadius:"8px",color:"white"}}/>
{file&&<p style={{color:"#38bdf8",fontSize:"13px"}}>Selected: {file.name}</p>}
<button onClick={handleSubmit} disabled={loading} style={{width:"100%",padding:"12px",borderRadius:"8px",border:"none",background:loading?"#334155":"#38bdf8",color:loading?"#94a3b8":"#0f172a",fontWeight:"700",cursor:"pointer"}}>
{loading?"Processing...":mode==="analyze"?"Analyze Now":mode==="ai"?"Get AI Suggestions":"Migrate Now"}
</button>
{mode==="migrate"&&(
<button onClick={handleDownload} style={{width:"100%",padding:"12px",borderRadius:"8px",border:"1px solid #22c55e",background:"transparent",color:"#22c55e",fontWeight:"700",cursor:"pointer",marginTop:"8px"}}>
Download Migrated Code
</button>
)}
</div>
{result&&(
<div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"24px"}}>
<h3 style={{color:"#38bdf8"}}>Results: {result.filename}</h3>
{result.functions&&result.functions.length>0&&<p>Functions: {result.functions.join(", ")}</p>}
{result.classes&&result.classes.length>0&&<p>Classes: {result.classes.join(", ")}</p>}
{result.imports&&result.imports.length>0&&<p>Imports: {result.imports.join(", ")}</p>}
{result.issues&&<p style={{color:result.issues.length>0?"#f87171":"#4ade80"}}>Issues: {result.issues.length>0?result.issues.join(", "):"No issues!"}</p>}
{result.changes&&<p style={{color:"#4ade80"}}>Changes: {result.changes.length>0?result.changes.join(", "):"No changes needed!"}</p>}
{result.migrated_code&&(
<div>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
<h4 style={{color:"#38bdf8",margin:"0"}}>Migrated Code:</h4>
<button onClick={handleCopy} style={{padding:"4px 12px",borderRadius:"6px",border:"1px solid #38bdf8",background:copied?"#38bdf8":"transparent",color:copied?"#0f172a":"#38bdf8",cursor:"pointer"}}>
{copied?"Copied!":"Copy"}
</button>
</div>
<pre style={{background:"#0f172a",padding:"12px",borderRadius:"8px",overflow:"auto",fontSize:"12px"}}>{result.migrated_code}</pre>
</div>
)}
</div>
)}
</div>
</div>
);
}
export default App;
