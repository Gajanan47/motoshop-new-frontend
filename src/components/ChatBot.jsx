import { useRef, useState } from 'react'
import { sendQueryToGemini } from '../api/gemini'

const ChatBot = () => {
  const [text, setText] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: "Hi, I'm MotoShop AI. Tell me your budget, vehicle type, or usage and I'll help you choose.",
    },
  ])
  const nextId = useRef(2)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedText = text.trim()
    if (!trimmedText || loading) return

    const userMessage = {
      id: nextId.current++,
      role: "user",
      text: trimmedText,
    }

    setMessages((prev) => [...prev, userMessage])
    setText("")
    setLoading(true)

    try {
      const res = await sendQueryToGemini(trimmedText)
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "bot",
          text: res || "I couldn't get an answer right now. Please try again in a moment.",
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "bot",
          text: err.response?.data?.message || err.message || "I couldn't connect to the chatbot server right now.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-60">
      {isOpen && (
        <section className="mb-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
          <div className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-lg font-bold">
                AI
              </div>
              <div>
                <h2 className="text-sm font-semibold leading-tight">MotoShop AI</h2>
                <p className="text-xs text-slate-300">Vehicle buying assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              x
            </button>
          </div>

          <div className="h-80 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-md bg-orange-500 text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
            <label htmlFor="chatbot-message" className="sr-only">
              Ask MotoShop AI
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="chatbot-message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                rows="1"
                placeholder="Ask about bikes, cars, budget..."
                className="max-h-24 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!text.trim() || loading}
                className="h-11 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white shadow-xl shadow-orange-300/60 transition hover:-translate-y-0.5 hover:bg-orange-600"
        aria-label={isOpen ? "Hide chatbot" : "Open chatbot"}
      >
        {isOpen ? "x" : "AI"}
      </button>
    </div>
  )
}

export default ChatBot
