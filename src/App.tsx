'use client'

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { MarketProvider } from './context/MarketContext';
import { WalletProvider } from './context/WalletContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Markets from './pages/Markets';
import Events from './pages/Events';
import { NotificationProvider, TransactionPopupProvider } from "@blockscout/app-sdk";

// --- Error Boundary Component (for graceful error handling) ---
class ErrorBoundary extends React.Component<any, { hasError: boolean; error: Error | null }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render shows the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error in component:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-950 p-8 text-center">
                    <h1 className="text-4xl font-bold text-red-700 dark:text-red-400 mb-4">
                        Oops! Something went wrong.
                    </h1>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                        We're sorry, an unexpected error occurred. Please try refreshing the page.
                    </p>
                    {this.state.error && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm text-left text-gray-600 dark:text-gray-400 max-w-lg overflow-auto">
                            <pre><code>{this.state.error.message}</code></pre>
                        </div>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

function App() {
    const [activePage, setActivePage] = useState<'home' | 'markets' | 'events'>('home');
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial loading for contexts or data fetching
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 5000); // Set to 5000ms for a 5-second transition

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 text-gray-700 dark:text-gray-300">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 dark:border-blue-400 mb-4"></div>
                <p className="text-xl font-semibold">Loading SportPulse...</p>
                <p className="text-md mt-2">Preparing your betting experience.</p>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <TransactionPopupProvider>
                <NotificationProvider>
                    <ThemeProvider>
                        <WalletProvider>
                            <MarketProvider>
                                <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
                                    {/* Make sure your Header component accepts these props if you plan to use them for navigation */}
                                    <Header activePage={activePage} setActivePage={setActivePage} />

                                    <main className="flex-grow">
                                        {activePage === 'home' && <Home setActivePage={setActivePage} />}
                                        {activePage === 'markets' && <Markets />}
                                        {activePage === 'events' && <Events />}
                                    </main>

                                    <Footer />
                                </div>
                            </MarketProvider>
                        </WalletProvider>
                    </ThemeProvider>
                </NotificationProvider>
            </TransactionPopupProvider>
        </ErrorBoundary>
    );
}

export default App;