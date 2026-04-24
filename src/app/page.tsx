"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("jumpsuit-context");
    if (saved) setContext(saved);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveContext = () => {
    localStorage.setItem("jumpsuit-context", context);
    setShowAdmin(false);
  };

  return (
    <div className="flex flex-col h-screen bg-jumpsuit-cream text-jumpsuit-teal">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-jumpsuit-teal/10">
        <div className="flex items-center gap-3">
          <Image
            src="/badge.png"
            alt="Jumpsuit"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h1 className="font-cooper text-xl tracking-tight text-jumpsuit-orange">
              Jumpsuit AI
            </h1>
            <p className="text-[11px] text-jumpsuit-teal/40 uppercase tracking-widest">
              Our best work still comes from humans
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="text-xs text-jumpsuit-teal/30 hover:text-jumpsuit-teal/60 transition-colors"
        >
          {showAdmin ? "Close" : "Admin"}
        </button>
      </header>

      {/* Admin Panel */}
      {showAdmin && (
        <div className="border-b border-jumpsuit-teal/10 bg-white/40 p-6">
          <label className="block text-sm font-medium text-jumpsuit-teal/60 mb-2">
            RFP Context (paste Jumpsuit&apos;s knowledge base here)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full h-48 bg-white border border-jumpsuit-teal/10 rounded-lg p-4 text-sm text-jumpsuit-teal placeholder-jumpsuit-teal/20 resize-none focus:outline-none focus:border-jumpsuit-blue/50"
            placeholder="Paste the RFP questions, Jumpsuit capabilities, case studies, team info, etc."
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={saveContext}
              className="px-4 py-2 bg-jumpsuit-orange text-white text-sm font-bold rounded-lg hover:bg-jumpsuit-red transition-colors"
            >
              Save Context
            </button>
            <button
              onClick={() => {
                setContext("");
                localStorage.removeItem("jumpsuit-context");
              }}
              className="px-4 py-2 border border-jumpsuit-teal/10 text-jumpsuit-teal/60 text-sm rounded-lg hover:border-jumpsuit-teal/30 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
            <Image
              src="/badge.png"
              alt="Jumpsuit"
              width={80}
              height={80}
              className="mb-6"
            />
            <h2 className="font-cooper text-3xl text-jumpsuit-orange mb-3">
              Powered by the Independent Network
            </h2>
            <p className="text-jumpsuit-teal/60 leading-relaxed">
              We made this in 5 minutes to make it easy to learn about us and
              how we work. We&apos;ve always said, what we do is <em>way less
              interesting</em> than how we do it.
            </p>
            <div className="flex flex-wrap gap-2 mt-8 justify-center">
              {[
                "How does your independent model work?",
                "Tell me about your network",
                "What makes Jumpsuit different?",
                "Wait, you've done what?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-4 py-2 text-sm border border-jumpsuit-teal/15 rounded-full text-jumpsuit-teal/60 hover:border-jumpsuit-blue hover:text-jumpsuit-blue transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 flex-shrink-0 mt-1">
                  <Image
                    src="/badge.png"
                    alt="Jumpsuit"
                    width={28}
                    height={28}
                    className="rounded-full w-7 h-7 object-contain"
                  />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-jumpsuit-blue text-white"
                    : "bg-white text-jumpsuit-teal shadow-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-neutral max-w-none [&_a]:inline-block [&_a]:px-4 [&_a]:py-2 [&_a]:bg-jumpsuit-orange [&_a]:text-white [&_a]:no-underline [&_a]:rounded-lg [&_a]:font-bold [&_a]:text-sm [&_a]:hover:bg-jumpsuit-red [&_a]:transition-colors [&_a]:mt-2 [&_strong]:text-jumpsuit-teal [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-2 [&_p:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 flex-shrink-0 mt-1">
                <Image
                  src="/badge.png"
                  alt="Jumpsuit"
                  width={28}
                  height={28}
                  className="rounded-full w-7 h-7 object-contain"
                />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-jumpsuit-orange rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-jumpsuit-sage rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-jumpsuit-blue rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-jumpsuit-teal/10 px-6 py-4 bg-white/30">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Jumpsuit anything..."
            className="flex-1 bg-white border border-jumpsuit-teal/10 rounded-xl px-4 py-3 text-sm text-jumpsuit-teal placeholder-jumpsuit-teal/30 focus:outline-none focus:border-jumpsuit-blue transition-colors shadow-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-jumpsuit-orange text-white font-bold text-sm rounded-xl hover:bg-jumpsuit-red disabled:opacity-30 transition-colors shadow-sm"
          >
            Send
          </button>
        </form>
        <p className="text-center text-[10px] text-jumpsuit-teal/30 mt-2 uppercase tracking-wider">
          Powered by Jumpsuit Agency
        </p>
      </div>
    </div>
  );
}
