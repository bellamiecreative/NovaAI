const features = [
  ["AI Chat", "Talk with NovaAI and keep conversations organized."],
  ["Memory", "Keep useful context available across conversations."],
  ["Create", "Generate images and creative outputs from one workspace."],
  ["Voice", "Talk naturally when the voice layer is connected."]
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="brand">NOVA<span>AI</span></div>
        <div className="badge">FOUNDATION ONLINE</div>
        <h1>Your ideas.<br /><strong>Powered by AI.</strong></h1>
        <p className="lead">
          NovaAI is being built as a fast, mobile-first AI workspace for chat,
          creation, memory, and voice.
        </p>
        <a className="cta" href="/chat">Open NovaAI Chat <span>→</span></a>
      </section>

      <section id="features" className="grid">
        {features.map(([title, description]) => (
          <article className="glass" key={title}>
            <div className="icon">{title.slice(0, 1)}</div>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <footer>NovaAI · v0.3.0 · Phase 3</footer>
    </main>
  );
}