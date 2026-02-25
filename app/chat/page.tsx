'use client'
import Loader from "@/components/loader"
import React, { useEffect, useRef, useState } from "react"
import { useChat } from '@ai-sdk/react'

function RenderText({ text }: { text: string }) {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
    return (
        <>
            {parts.map((p, i) => {
                if (p.startsWith('**') && p.endsWith('**')) {
                    return <strong key={i} className="font-semibold text-zinc-200">{p.slice(2, -2)}</strong>
                }
                const linkMatch = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
                if (linkMatch) {
                    return (
                        <a
                            key={i}
                            href={linkMatch[2]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
                        >
                            {linkMatch[1]}
                        </a>
                    )
                }
                return <React.Fragment key={i}>{p}</React.Fragment>
            })}
        </>
    )
}

export default function ChatPage() {
    const [inputVal, setInputVal] = useState('')
    const [showScroll, setShowScroll] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { messages, sendMessage, status } = useChat()

    const isTyping = status === 'submitted' || status === 'streaming'

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
        if (atBottom) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }, [messages, isTyping])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        const onScroll = () => setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 200)
        el.addEventListener('scroll', onScroll)
        return () => el.removeEventListener('scroll', onScroll)
    }, [])

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputVal(e.target.value)
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px'
    }

    const submit = () => {
        const text = inputVal.trim()
        if (!text) return
        sendMessage({ text })
        setInputVal('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
    }

    return (
        <div className="flex flex-col h-[calc(100dvh-3.5rem)] max-w-3xl mx-auto bg-zinc-950 border-x border-zinc-900">

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto flex flex-col gap-5 px-5 py-7 scroll-smooth"
            >
                {messages.length === 0 && !isTyping && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-700 select-none pb-20">
                        <svg className="opacity-40" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <p className="text-xs uppercase tracking-widest">Start a conversation</p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div key={message.id} className={`flex items-end gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mb-0.5">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                                </svg>
                            </div>
                        )}

                        <div className={`
                            max-w-[75%] px-4 py-2.5 text-sm leading-relaxed tracking-[0.01em] rounded-2xl break-words whitespace-pre-wrap
                            ${message.role === 'user'
                                ? 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tr-sm'
                                : 'bg-zinc-900/60 border border-zinc-800/60 text-zinc-300 rounded-tl-sm'
                            }
                        `}>
                            {message.parts.map((part, i) => {
                                if (part.type === 'text') return <RenderText key={i} text={part.text} />
                                if (part.type.startsWith('tool-')) {
                                    const tp = part as any
                                    return (
                                        <div key={tp.toolCallId} className="flex items-center gap-1.5 text-xs italic text-zinc-600 mb-1">
                                            {tp.state === 'call' || tp.state === 'input-streaming'
                                                ? <><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /><span>Running tool…</span></>
                                                : <span className="text-emerald-700">✓ Done</span>
                                            }
                                        </div>
                                    )
                                }
                                return null
                            })}

                            {index === messages.length - 1 && message.role === 'assistant' && isTyping && (
                                <div className="mt-1"><Loader /></div>
                            )}
                        </div>
                    </div>
                ))}

                {messages.length === 0 && isTyping && (
                    <div className="flex items-end gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                            </svg>
                        </div>
                        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl rounded-tl-sm px-4 py-3">
                            <Loader />
                        </div>
                    </div>
                )}
            </div>

            {showScroll && (
                <button
                    type='button'
                    title='Scroll to bottom'
                    onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
                    className="fixed bottom-24 right-8 w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 flex items-center justify-center shadow-xl transition-colors z-20"
                >
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}

            <div className="shrink-0 border-t border-zinc-900 bg-zinc-950/95 backdrop-blur px-5 pt-3.5 pb-5">
                <div className="flex items-end gap-2.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-zinc-700 focus-within:ring-2 focus-within:ring-zinc-800 transition-all">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={inputVal}
                        onChange={handleInput}
                        onKeyDown={onKeyDown}
                        placeholder="Ask anything…"
                        className="flex-1 bg-transparent resize-none outline-none text-sm text-zinc-100 placeholder:text-zinc-600 leading-relaxed min-h-6 max-h-44 overflow-y-auto"
                    />
                    <button
                        type='button'
                        title='Send message'
                        onClick={submit}
                        disabled={!inputVal.trim() || isTyping}
                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed bg-zinc-100 text-zinc-900 hover:bg-white active:scale-95"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
                <p className="text-center text-xs text-zinc-700 mt-2 tracking-wide">Enter to send · Shift+Enter for new line</p>
            </div>
        </div>
    )
}