"use client";
import { FormEvent,useState } from "react";

type Message={role:"user"|"assistant";content:string};

export default function ChatPage(){
  const [messages,setMessages]=useState<Message[]>([]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);

  async function sendMessage(e:FormEvent){
    e.preventDefault();
    const text=input.trim();
    if(!text||busy)return;
    setInput("");
    setMessages(m=>[...m,{role:"user",content:text},{role:"assistant",content:""}]);
    setBusy(true);
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})});
      if(!r.ok||!r.body){const d=await r.json().catch(()=>({}));throw new Error(d.error||"Request failed.");}
      const reader=r.body.getReader(),decoder=new TextDecoder();let answer="";
      while(true){
        const {value,done}=await reader.read();if(done)break;
        answer+=decoder.decode(value,{stream:true});
        setMessages(m=>{const n=[...m];n[n.length-1]={role:"assistant",content:answer};return n;});
      }
    }catch(error){
      const msg=error instanceof Error?error.message:"Something went wrong.";
      setMessages(m=>{const n=[...m];n[n.length-1]={role:"assistant",content:"Error: "+msg};return n;});
    }finally{setBusy(false);}
  }

  return <main className="chat-page">
    <header className="chat-header"><a href="/">NOVA<span>AI</span></a><span>AI Chat</span></header>
    <section className="messages" aria-live="polite">
      {messages.length===0&&<div className="empty"><div className="orb">✦</div><h1>How can I help?</h1><p>Send a message to start a real NovaAI conversation.</p></div>}
      {messages.map((m,i)=><article className={"message "+m.role} key={i}><div className="role">{m.role==="user"?"You":"NovaAI"}</div><div className="bubble">{m.content||(busy?"Thinking…":"")}</div></article>)}
    </section>
    <form className="composer" onSubmit={sendMessage}>
      <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Message NovaAI…" disabled={busy} autoComplete="off"/>
      <button type="submit" disabled={busy||!input.trim()}>{busy?"…":"Send"}</button>
    </form>
  </main>;
}
