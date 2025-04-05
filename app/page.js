'use client';

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with theme toggle */}
      <header className="p-4 flex justify-end">
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* App title and logo */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Task Manager</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Organize your work and life, simply and efficiently.
            </p>
          </div>

          {/* App features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-black/5 dark:bg-white/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Track Tasks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create, organize, and manage all your tasks in one place.</p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-black/5 dark:bg-white/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Set Due Dates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Never miss a deadline with clear due dates and reminders.</p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-black/5 dark:bg-white/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your progress and stay motivated with visual status updates.</p>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              href="/login" 
              className="px-6 py-3 rounded-md bg-foreground text-background font-medium transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-3 rounded-md border border-current font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
            >
              Register
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Task Manager. All rights reserved.</p>
      </footer>
    </div>
  );
}
