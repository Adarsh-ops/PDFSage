'use client'

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4 md:px-0">

        <Link
          href="/chat"
          className="flex items-center gap-2.5 group"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors tracking-tight">
            PDFSage
          </span>
          <span className="hidden sm:inline text-xs text-zinc-600 font-normal">RAG chatbot</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/chat"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === '/chat'
                ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat
          </Link>

          <Link
            href="/upload"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === '/upload'
                ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Upload
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
                Log in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-white transition-colors">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-1 ring-zinc-800",
                  userButtonPopoverCard: "bg-zinc-950 border border-zinc-800 shadow-xl",
                  userButtonPopoverActionButton: "hover:bg-zinc-900 text-zinc-200",
                  userButtonPopoverActionButtonText: "text-zinc-200",
                  userButtonPopoverFooter: "hidden"
                }
              }}
            />
          </SignedIn>
        </div>

      </div>
    </header>
  )
}