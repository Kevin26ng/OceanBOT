import "./global.css";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Data from "./pages/Data";
import Publish from "./pages/Publish";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

function Header() {
  const nav = [
    { to: "/", label: "Home" },
    { to: "/data", label: "Data" },
    { to: "/publish", label: "Publish" },
    { to: "/about", label: "About" },
    { to: "/dashboard", label: "Dashboard" },
  ];
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-white/50 bg-white/70 border-b border-white/30">
      <div className="container flex h-16 items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-primary"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12c4-6 14-6 18 0" />
              <path d="M3 12c4 6 14 6 18 0" />
              <path d="M3 12h18" />
            </svg>
          </span>
          OceanBot
        </a>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-foreground",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <a
          href="#contact"
          className="hidden md:inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Request Demo
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-white/70">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-lg text-primary">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12c4-6 14-6 18 0" />
                <path d="M3 12c4 6 14 6 18 0" />
                <path d="M3 12h18" />
              </svg>
            </span>
            OceanBot
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            AI-driven unified data platform for oceanographic, fisheries, and
            molecular biodiversity insights.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a className="hover:text-foreground" href="/data">
                Data Hub
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="/publish">
                Publish
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="/dashboard">
                Dashboard
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="/about">
                About
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Email: hello@oceaniq.ai</li>
            <li>Location: Global / Remote</li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} OceanBot. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function App() {
  React.useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
      document.documentElement.style.setProperty("--page-dark", String(ratio));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background page-bg">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/data" element={<Data />} />
                <Route path="/publish" element={<Publish />} />
                <Route path="/about" element={<About />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
