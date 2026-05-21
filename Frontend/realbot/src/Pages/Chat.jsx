import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BASE_URL = "https://realbot-1-tylx.onrender.com";
const PROCESS_URLS_API = `${BASE_URL}/process-urls`;
const ASK_API = `${BASE_URL}/ask`;

// ─── URL Panel ────────────────────────────────────────────────────────────────
function UrlPanel({ urls, setUrls, onProcess, processState }) {
  const addUrl = () => setUrls([...urls, ""]);

  const updateUrl = (index, value) => {
    const updated = [...urls];
    updated[index] = value;
    setUrls(updated);
  };

  const removeUrl = (index) => setUrls(urls.filter((_, i) => i !== index));

  const activeUrls = urls.filter((u) => u.trim());
  const isIdle = processState === "idle";
  const isProcessing = processState === "processing";
  const isDone = processState === "done";
  const isError = processState === "error";

  return (
    <aside className="w-[340px] min-w-[280px] max-w-[380px] flex flex-col h-full border-r border-zinc-800 bg-[#0e0f11] px-5 py-7 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-amber-400 mb-1">
            Web Context
          </p>
          <h2
            className="text-base font-semibold text-zinc-100 leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Paste your URL
            <br />
            for web search
          </h2>
        </div>
        <button
          onClick={addUrl}
          title="Add URL"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-900 shadow-lg transition-all duration-150 hover:scale-110 active:scale-95 flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-amber-400/30 via-zinc-700 to-transparent" />

      {/* URL List */}
      <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-0.5">
        {urls.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 mt-8 opacity-50">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-zinc-600">
              <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
              <path d="M12 18h12M18 12v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-xs text-zinc-500 text-center">
              Click <span className="text-amber-400 font-semibold">+</span> to add URLs
            </p>
          </div>
        )}
        {urls.map((url, i) => (
          <div
            key={i}
            className="group flex items-center gap-2 bg-zinc-900 border border-zinc-700/60 rounded-xl px-3 py-2.5 transition-all duration-150 hover:border-amber-400/40 focus-within:border-amber-400/70"
          >
            <span className="text-zinc-500 flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M13.5 6.5a4.95 4.95 0 010 7l-1.5 1.5a4.95 4.95 0 01-7-7l.75-.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6.5 13.5a4.95 4.95 0 010-7l1.5-1.5a4.95 4.95 0 017 7l-.75.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => updateUrl(i, e.target.value)}
              className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none min-w-0"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
            <button
              onClick={() => removeUrl(i)}
              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 transition-all duration-100"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Process Button */}
      <button
        onClick={onProcess}
        disabled={activeUrls.length === 0 || isProcessing || isDone}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200
          ${isDone
            ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default"
            : isError
            ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30 cursor-pointer"
            : isProcessing
            ? "bg-amber-400/20 border border-amber-400/30 text-amber-300 cursor-wait"
            : activeUrls.length === 0
            ? "bg-zinc-800 border border-zinc-700 text-zinc-600 cursor-not-allowed"
            : "bg-amber-400 hover:bg-amber-300 text-zinc-900 shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          }`}
      >
        {isProcessing && (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
          </svg>
        )}
        {isDone && (
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {isError && (
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M10 6v5M10 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
        {isProcessing
          ? "Processing URLs…"
          : isDone
          ? "URLs Ready — Chat away!"
          : isError
          ? "Retry Processing"
          : `Process ${activeUrls.length > 0 ? activeUrls.length : ""} URL${activeUrls.length !== 1 ? "s" : ""}`}
      </button>

      {/* Active badge */}
      {activeUrls.length > 0 && !isDone && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] text-amber-300 font-medium">
            {activeUrls.length} URL{activeUrls.length > 1 ? "s" : ""} queued — click Process
          </span>
        </div>
      )}
    </aside>
  );
}

// ─── Source Chip ──────────────────────────────────────────────────────────────
function SourceChip({ source }) {
  let hostname = source;
  try { hostname = new URL(source).hostname.replace("www.", ""); } catch (_) {}
  return (
    <a
      href={source}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-700/60 border border-zinc-600/50 text-[10px] text-zinc-400 hover:text-amber-400 hover:border-amber-400/40 transition-all duration-150 mt-2"
    >
      <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
        <path d="M13.5 6.5a4.95 4.95 0 010 7l-1.5 1.5a4.95 4.95 0 01-7-7l.75-.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6.5 13.5a4.95 4.95 0 010-7l1.5-1.5a4.95 4.95 0 017 7l-.75.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {hostname}
    </a>
  );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
function ChatMessage({ msg }) {
  const isUser = msg.role === "user";

  // source can be a string or array
  const sources = msg.source
    ? Array.isArray(msg.source)
      ? msg.source
      : [msg.source]
    : [];

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow
          ${isUser ? "bg-amber-400 text-zinc-900" : "bg-zinc-700 text-zinc-200"}`}
      >
        {isUser ? (
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="6" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 6V4.5a3 3 0 016 0V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="11" r="1.2" fill="currentColor" />
          </svg>
        )}
      </div>

      {/* Bubble + sources */}
      <div className="flex flex-col max-w-[75%]">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser
              ? "bg-amber-400 text-zinc-900 rounded-br-md font-medium"
              : "bg-zinc-800 text-zinc-100 rounded-bl-md border border-zinc-700/50"
            }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {msg.content}
          {msg.loading && (
            <span className="inline-flex gap-1 ml-2 items-center">
              <span className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
            </span>
          )}
        </div>

        {/* Source chips */}
        {sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1 pl-1">
            <span className="text-[10px] text-zinc-600 self-center">Source:</span>
            {sources.map((s, i) => <SourceChip key={i} source={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function ChatbotUI() {
  const [urls, setUrls] = useState([""]);
  const [processState, setProcessState] = useState("idle"); // idle | processing | done | error
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! Add URLs on the left and click Process — then ask me anything about them.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset "done" state when URLs change so user can re-process
  const handleSetUrls = (newUrls) => {
    setUrls(newUrls);
    if (processState === "done" || processState === "error") setProcessState("idle");
  };

  // ── /process-urls ──────────────────────────────────────────────────────────
  const handleProcessUrls = async () => {
    const activeUrls = urls.filter((u) => u.trim());
    if (activeUrls.length === 0) return;

    setProcessState("processing");
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `⏳ Processing ${activeUrls.length} URL${activeUrls.length > 1 ? "s" : ""}… This may take a moment.`,
      },
    ]);

    try {
      await axios.post(PROCESS_URLS_API, { urls: activeUrls });
      setProcessState("done");
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: `✅ All ${activeUrls.length} URL${activeUrls.length > 1 ? "s" : ""} indexed successfully! Go ahead and ask me anything.`,
        },
      ]);
    } catch (err) {
      setProcessState("error");
      const errMsg = err.response?.data?.detail || err.message || "Failed to process URLs.";
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: `⚠️ Could not process URLs: ${errMsg}` },
      ]);
    }
  };

  // ── /ask ───────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (processState !== "done") {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: "⚠️ Please add your URLs and click Process first before asking questions." },
      ]);
      setInput("");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    // Optimistic loading bubble
    setMessages((prev) => [...prev, { role: "assistant", content: "", loading: true }]);

    try {
      const res = await axios.post(ASK_API, { query: text });

      // Support common response shapes: { answer, source } / { response, source } / { message }
      const reply =
        res.data?.answer ||
        res.data?.response ||
        res.data?.message ||
        "No response received.";

      const source = res.data?.Source || res.data?.source || res.data?.sources || null;

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: reply, source },
      ]);
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || "Something went wrong.";
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: `⚠️ ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #52525b; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-in { animation: fadeSlideUp 0.2s ease both; }
      `}</style>

      <div
        className="flex h-screen w-full bg-[#0a0b0d] text-white overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* LEFT */}
        <UrlPanel
          urls={urls}
          setUrls={handleSetUrls}
          onProcess={handleProcessUrls}
          processState={processState}
        />

        {/* RIGHT */}
        <main className="flex flex-col flex-1 h-full min-w-0">
          {/* Topbar */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0a0b0d]/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300
                  ${processState === "done"
                    ? "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]"
                    : processState === "processing"
                    ? "bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.5)] animate-pulse"
                    : "bg-zinc-600"
                  }`}
              />
              <h1
                className="text-base font-semibold text-zinc-100 tracking-tight"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Model Chat
              </h1>
            </div>
            <span className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400 tracking-widest uppercase">
              {processState === "done"
                ? "Ready"
                : processState === "processing"
                ? "Indexing…"
                : "Web-Augmented"}
            </span>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className="msg-in">
                <ChatMessage msg={msg} />
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-zinc-800 bg-[#0a0b0d]/80 backdrop-blur-sm flex-shrink-0">
            <div
              className={`flex items-end gap-3 bg-zinc-900 border rounded-2xl px-4 py-3 transition-all duration-200 shadow-lg
                ${processState !== "done"
                  ? "border-zinc-800 opacity-60"
                  : "border-zinc-700/60 focus-within:border-amber-400/50"
                }`}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  processState === "done"
                    ? "Ask anything about the indexed URLs…"
                    : "Process URLs first to start chatting…"
                }
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed min-h-[24px] max-h-[120px] disabled:opacity-50"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                title="Send (Enter)"
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150
                  bg-amber-400 hover:bg-amber-300 text-zinc-900 shadow
                  disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed
                  hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M3 10l14-7-5 7 5 7-14-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-2 text-center">
              Press{" "}
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500 font-mono text-[9px]">Enter</kbd>
              {" "}to send ·{" "}
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500 font-mono text-[9px]">Shift+Enter</kbd>
              {" "}for new line
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
