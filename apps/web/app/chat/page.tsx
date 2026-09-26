"use client";

import { FormEvent, useEffect, useState } from "react";

type ChatSummary = { id: string; title: string };
type Message = { id: string; role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function createChat() {
    const response = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New chat" }),
    });
    if (!response.ok) throw new Error("Unable to create chat.");
    const data = await response.json();
    const created = data.chat as ChatSummary;
    setChats((current) => [created, ...current]);
    setChatId(created.id);
    setMessages([]);
    return created.id;
  }

  async function loadChat(id: string) {
    const response = await fetch(`/api/chats/${id}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load chat.");
    const data = await response.json();
    setChatId(id);
    setMessages(data.chat.messages ?? []);
  }

  async function loadChats() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/chats", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load chats.");
      const data = await response.json();
      const list = (data.chats ?? []) as ChatSummary[];
      setChats(list);
      if (list.length > 0) await loadChat(list[0].id);
      else await createChat();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load chats.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadChats();
  }, []);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending || loading) return;

    setError("");
    setInput("");
    setSending(true);

    try {
      let activeChatId = chatId;
      if (!activeChatId) activeChatId = await createChat();

      const userMessage: Message = {
        id: `local-user-${Date.now()}`,
        role: "user",
        content: message,
      };
      const assistantId = `local-assistant-${Date.now()}`;
      setMessages((current) => [
        ...current,
        userMessage,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const response = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to send message.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantId
              ? { ...item, content: item.content + chunk }
              : item,
          ),
        );
      }

      const refreshed = await fetch(`/api/chats/${activeChatId}`, { cache: "no-store" });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setMessages(data.chat.messages ?? []);
        setChats((current) =>
          current.map((chat) =>
            chat.id === activeChatId ? { ...chat, title: data.chat.title } : chat,
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message.");
      setMessages((current) => current.filter((item) => !item.id.startsWith("local-assistant-")));
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="chat-page">
      <header className="chat-header">
        <a href="/">Nova<span>AI</span></a>
        <span>{sending ? "Thinking…" : "AI Chat"}</span>
      </header>

      <section className="chat-layout">
        <aside className="chat-list" aria-label="Chat history">
          <button className="new-chat" onClick={() => void createChat()} disabled={sending}>
            + New chat
          </button>
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={`chat-item ${chat.id === chatId ? "active" : ""}`}
              onClick={() => void loadChat(chat.id)}
              disabled={sending}
            >
              {chat.title}
            </button>
          ))}
        </aside>

        <section className="chat-main">
          <div className="messages">
            {loading ? (
              <div className="empty"><div className="orb">✦</div><p>Loading your chats…</p></div>
            ) : messages.length === 0 ? (
              <div className="empty"><div className="orb">✦</div><h1>How can I help?</h1><p>Start a conversation with NovaAI.</p></div>
            ) : (
              messages.map((item) => (
                <article className={`message ${item.role}`} key={item.id}>
                  <div className="role">{item.role === "user" ? "You" : "NovaAI"}</div>
                  <div className="bubble">{item.content || (sending ? "…" : "")}</div>
                </article>
              ))
            )}
            {error && <div className="chat-error">{error}</div>}
          </div>

          <form className="composer" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Message NovaAI…"
              disabled={sending || loading}
              aria-label="Message NovaAI"
            />
            <button type="submit" disabled={sending || loading || !input.trim()}>
              {sending ? "…" : "Send"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
