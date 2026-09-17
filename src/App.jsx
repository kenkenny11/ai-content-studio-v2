import React, { useEffect, useMemo, useState } from "react";
import { Copy, FileText, FolderOpen, Gauge, Image, Lightbulb, Menu, RefreshCw, Save, Settings, Sparkles, Trash2, X } from "lucide-react";

const STORAGE_KEY = "ai-content-studio:saved";

const emptyResult = { hook: "", post: "", cta: "", imagePrompt: "", reelScript: "", carousel: [] };

function App() {
  const [topic, setTopic] = useState("AI Tools, Tech Hacks & Digital Productivity");
  const [audience, setAudience] = useState("US Audience");
  const [contentType, setContentType] = useState("post");
  const [tone, setTone] = useState("Practical & Human");
  const [goal, setGoal] = useState("Growth & Engagement");
  const [result, setResult] = useState(emptyResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedItems, setSavedItems] = useState([]);
  const [activeNav, setActiveNav] = useState("Generate");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    try { setSavedItems(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { setSavedItems([]); }
  }, []);

  const stats = useMemo(() => ({ saved: savedItems.length }), [savedItems]);

  async function generateContent() {
    setLoading(true); setError(""); setCopied("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience, contentType, tone, goal })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Generation failed. Check your OpenRouter API key in Vercel.");
      setResult({ ...emptyResult, ...data });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally { setLoading(false); }
  }

  async function copyText(label, value) {
    if (!value) return;
    try { await navigator.clipboard.writeText(Array.isArray(value) ? value.map((x, i) => `${i + 1}. ${x}`).join("\n") : value); setCopied(label); setTimeout(() => setCopied(""), 1500); } catch { setError("Copy failed. Long-press the text to copy it manually."); }
  }

  function saveCurrent() {
    if (!result.post && !result.reelScript && !result.carousel?.length) return;
    const item = { id: Date.now(), createdAt: new Date().toISOString(), topic, contentType, result };
    const next = [item, ...savedItems].slice(0, 30);
    setSavedItems(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function removeSaved(id) {
    const next = savedItems.filter(item => item.id !== id);
    setSavedItems(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Sparkles size={20} /></div><div><strong>AI Content Studio</strong><span>Facebook content workspace</span></div></div>
        <button className="icon-btn" aria-label="Settings"><Settings size={19} /></button>
      </header>

      <main className="content">
        {activeNav === "Generate" && <>
          <section className="hero-card">
            <div><span className="eyebrow"><Sparkles size={14}/> AI CREATOR</span><h1>Create useful content in seconds.</h1><p>Build Facebook posts, reels and carousels for a US audience.</p></div>
            <div className="hero-stat"><span>{stats.saved}</span><small>saved</small></div>
          </section>

          <section className="panel form-panel">
            <div className="section-title"><div><h2>Content setup</h2><p>Tell the studio what you want to publish.</p></div></div>
            <label>Topic or niche<textarea value={topic} onChange={e => setTopic(e.target.value)} rows={2} placeholder="e.g. 5 AI tools that save time" /></label>
            <div className="grid-2">
              <label>Audience<select value={audience} onChange={e => setAudience(e.target.value)}><option>US Audience</option><option>Small Business Owners</option><option>Creators & Freelancers</option><option>Tech Enthusiasts</option></select></label>
              <label>Content type<select value={contentType} onChange={e => setContentType(e.target.value)}><option value="post">Facebook Post</option><option value="reel">Reel</option><option value="carousel">Carousel</option></select></label>
              <label>Goal<select value={goal} onChange={e => setGoal(e.target.value)}><option>Growth & Engagement</option><option>Education</option><option>Lead Generation</option><option>Affiliate Content</option></select></label>
              <label>Tone<select value={tone} onChange={e => setTone(e.target.value)}><option>Practical & Human</option><option>Friendly & Casual</option><option>Professional</option><option>Curious & Punchy</option></select></label>
            </div>
            <button className="primary-btn" onClick={generateContent} disabled={loading || !topic.trim()}>{loading ? <><RefreshCw className="spin" size={19}/> Generating...</> : <><Sparkles size={19}/> Generate Content</>}</button>
            {error && <div className="error-box">{error}</div>}
          </section>

          <section className="panel result-panel">
            <div className="section-title"><div><span className="eyebrow">PREVIEW</span><h2>Generated content</h2></div><div className="actions"><button className="soft-btn" onClick={saveCurrent} disabled={!result.post && !result.reelScript}><Save size={17}/> Save</button><button className="soft-btn" onClick={generateContent} disabled={loading}><RefreshCw size={17}/> Regenerate</button></div></div>
            {!result.post && !result.reelScript && !result.carousel?.length ? <div className="empty-state"><div className="empty-icon"><Lightbulb size={25}/></div><h3>Your content will appear here</h3><p>Choose your format and tap Generate Content.</p></div> : <div className="result-grid">
              <ResultCard title="Hook" value={result.hook} onCopy={() => copyText("hook", result.hook)} copied={copied === "hook"}/>
              <ResultCard title="Facebook post" value={result.post} onCopy={() => copyText("post", result.post)} copied={copied === "post"} large />
              <ResultCard title="CTA" value={result.cta} onCopy={() => copyText("cta", result.cta)} copied={copied === "cta"}/>
              <ResultCard title="Image prompt" value={result.imagePrompt} onCopy={() => copyText("image", result.imagePrompt)} copied={copied === "image"}/>
              <ResultCard title="Reel script" value={result.reelScript} onCopy={() => copyText("reel", result.reelScript)} copied={copied === "reel"} large />
              {!!result.carousel?.length && <ResultCard title="Carousel" value={result.carousel} onCopy={() => copyText("carousel", result.carousel)} copied={copied === "carousel"} large />}
            </div>}
          </section>
        </>}

        {activeNav === "Library" && <Library items={savedItems} removeSaved={removeSaved} loadItem={(item) => { setResult(item.result); setTopic(item.topic); setContentType(item.contentType); setActiveNav("Generate"); }} />}
        {activeNav === "Ideas" && <Ideas onUse={(idea) => { setTopic(idea); setActiveNav("Generate"); }} />}
        {activeNav === "Settings" && <section className="panel"><div className="section-title"><div><span className="eyebrow">SETTINGS</span><h2>Studio settings</h2><p>Your API key stays on the server in Vercel.</p></div></div><div className="setting-row"><span>AI provider</span><strong>OpenRouter</strong></div><div className="setting-row"><span>Default model</span><strong>openrouter/free</strong></div><div className="setting-row"><span>Saved items</span><strong>{stats.saved}</strong></div></section>}
      </main>

      <nav className="bottom-nav">
        <NavButton icon={Sparkles} label="Generate" active={activeNav === "Generate"} onClick={() => setActiveNav("Generate")} />
        <NavButton icon={Lightbulb} label="Ideas" active={activeNav === "Ideas"} onClick={() => setActiveNav("Ideas")} />
        <NavButton icon={FolderOpen} label="Library" active={activeNav === "Library"} onClick={() => setActiveNav("Library")} badge={stats.saved || ""} />
        <NavButton icon={Settings} label="Settings" active={activeNav === "Settings"} onClick={() => setActiveNav("Settings")} />
      </nav>
    </div>
  );
}

function ResultCard({ title, value, onCopy, copied, large }) {
  return <article className={`result-card ${large ? "large" : ""}`}><div className="result-head"><h3>{title}</h3><button className="copy-btn" onClick={onCopy} aria-label={`Copy ${title}`}><Copy size={15}/>{copied ? "Copied" : "Copy"}</button></div><div className="result-text">{Array.isArray(value) ? value.map((slide, i) => <div className="slide" key={i}><b>{i + 1}</b><span>{slide}</span></div>) : value}</div></article>;
}
function NavButton({ icon: Icon, label, active, onClick, badge }) { return <button className={`nav-btn ${active ? "active" : ""}`} onClick={onClick}><span className="nav-icon"><Icon size={20}/>{badge ? <em>{badge}</em> : null}</span><small>{label}</small></button>; }
function Library({ items, removeSaved, loadItem }) { return <section className="panel"><div className="section-title"><div><span className="eyebrow">LIBRARY</span><h2>Saved content</h2><p>Your last 30 saved generations.</p></div></div>{!items.length ? <div className="empty-state"><div className="empty-icon"><FolderOpen size={25}/></div><h3>Nothing saved yet</h3><p>Generate something and tap Save.</p></div> : <div className="library-list">{items.map(item => <div className="library-item" key={item.id}><div><span>{item.contentType}</span><h3>{item.result?.hook || item.topic}</h3><small>{new Date(item.createdAt).toLocaleString()}</small></div><div className="library-actions"><button onClick={() => loadItem(item)}>Open</button><button onClick={() => removeSaved(item.id)} aria-label="Delete"><Trash2 size={16}/></button></div></div>)}</div>}</section>; }
function Ideas({ onUse }) { const ideas = ["5 free AI tools that save creators hours every week", "A simple phone workflow for turning one idea into five posts", "AI productivity mistakes that waste more time than they save", "3 browser tools every small business owner should know", "How to use AI without making your Facebook posts sound robotic", "A beginner-friendly AI toolkit for everyday work"]; return <section className="panel"><div className="section-title"><div><span className="eyebrow">IDEAS</span><h2>Content starters</h2><p>Tap an idea to use it as your next topic.</p></div></div><div className="idea-list">{ideas.map((idea, i) => <button className="idea-card" key={i} onClick={() => onUse(idea)}><span><Lightbulb size={18}/></span><div><strong>{idea}</strong><small>Use this topic</small></div></button>)}</div></section>; }

export default App;
