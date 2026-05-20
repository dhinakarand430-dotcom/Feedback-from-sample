"use client";

import { useState, useEffect } from "react";
import { Lock, Search, Filter, ArrowUpDown, Download, LogOut, Star, Calendar, Mail, User, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [fetchError, setFetchError] = useState("");

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Check sessionStorage for saved passcode on load
  useEffect(() => {
    const savedPass = sessionStorage.getItem("feedback_admin_passcode");
    if (savedPass) {
      fetchFeedbacks(savedPass);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    if (!passcode.trim()) {
      setAuthError("Please enter a passcode.");
      return;
    }

    setLoading(true);
    const success = await fetchFeedbacks(passcode);
    setLoading(false);

    if (success) {
      sessionStorage.setItem("feedback_admin_passcode", passcode);
    } else {
      setAuthError("Incorrect passcode. Access denied.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("feedback_admin_passcode");
    setIsAuthenticated(false);
    setFeedbacks([]);
    setPasscode("");
  };

  const fetchFeedbacks = async (code) => {
    setFetchError("");
    try {
      const res = await fetch("/api/feedbacks", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${code}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          return false;
        }
        throw new Error("Failed to load feedbacks.");
      }

      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setFetchError(err.message || "An error occurred while fetching data.");
      return false;
    }
  };

  const triggerRefresh = () => {
    const savedPass = sessionStorage.getItem("feedback_admin_passcode");
    if (savedPass) {
      fetchFeedbacks(savedPass);
    }
  };

  // Filter and Sort feedbacks
  const filteredFeedbacks = feedbacks
    .filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating =
        ratingFilter === "all" || f.rating.toString() === ratingFilter;
        
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "rating-high") {
        return b.rating - a.rating;
      }
      if (sortBy === "rating-low") {
        return a.rating - b.rating;
      }
      return 0;
    });

  // Client side CSV Export
  const handleExportCSV = () => {
    if (filteredFeedbacks.length === 0) return;

    const headers = ["Feedback ID", "Submission Date", "Name", "Email", "Rating (Out of 5)", "Feedback Message"];
    
    const rows = filteredFeedbacks.map((f) => [
      f.id,
      new Date(f.createdAt).toISOString(),
      `"${f.name.replace(/"/g, '""')}"`,
      `"${f.email.replace(/"/g, '""')}"`,
      f.rating,
      `"${f.feedback.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `feedback_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRatingColor = (r) => {
    if (r >= 4) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
    if (r === 3) return "text-amber-400 border-amber-500/20 bg-amber-500/10";
    return "text-rose-400 border-rose-500/20 bg-rose-500/10";
  };

  // Auth/Login Wall View
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-float-slow pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl animate-float-medium pointer-events-none" />

        <div className="w-full max-w-md z-10">
          <div className="flex flex-col items-center mb-6 text-center animate-fade-in">
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-sm text-slate-400">
              Please enter your passcode to view feedback submissions.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="glass-panel w-full p-8 rounded-2xl shadow-2xl border border-white/5 space-y-5 animate-scale-up"
          >
            {authError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm animate-fade-in">
                <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="passcode" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Admin Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="passcode"
                  type="password"
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 glass-input"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? "Verifying..." : "Access Dashboard"}
            </button>

            <div className="text-center pt-2">
              <a href="/" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
                ← Return to Feedback Form
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Main View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        
        {/* Top Navbar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Feedback Flow</h1>
            <p className="text-xs text-indigo-400 font-medium">Admin Management Portal</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={triggerRefresh}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/5 bg-slate-900/40 text-xs font-semibold text-slate-300 hover:bg-slate-900/80 transition-all cursor-pointer"
              title="Refresh submissions"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-4.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard statistics bar & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left panel: Statistics & Filters */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Statistics Widget */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submissions Overview</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">{feedbacks.length}</span>
                <span className="text-xs text-slate-400">total submissions</span>
              </div>
              <div className="pt-2 border-t border-slate-900 flex justify-between text-xs text-slate-400">
                <span>Average Rating:</span>
                <span className="font-bold text-amber-400 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {feedbacks.length > 0 
                    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
                    : "0.0"
                  }
                </span>
              </div>
            </div>

            {/* Filter controls panel */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filters & Controls</h2>
              
              {/* Search Control */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Search Name/Email</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-slate-200 glass-input"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Rating Scale</label>
                <div className="relative">
                  <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs text-slate-200 glass-input appearance-none"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars Only</option>
                    <option value="4">4 Stars Only</option>
                    <option value="3">3 Stars Only</option>
                    <option value="2">2 Stars Only</option>
                    <option value="1">1 Star Only</option>
                  </select>
                </div>
              </div>

              {/* Sorting Filter */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Sort By</label>
                <div className="relative">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs text-slate-200 glass-input appearance-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rating-high">Rating: High to Low</option>
                    <option value="rating-low">Rating: Low to High</option>
                  </select>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                disabled={filteredFeedbacks.length === 0}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer mt-2"
              >
                <Download className="w-4 h-4" />
                <span>Export ({filteredFeedbacks.length}) to CSV</span>
              </button>
            </div>
          </div>

          {/* Right panel: Feedback Cards List */}
          <div className="lg:col-span-3 space-y-4">
            
            {fetchError && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm">
                {fetchError}
              </div>
            )}

            {filteredFeedbacks.length === 0 ? (
              <div className="glass-panel w-full py-16 px-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <Search className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Feedbacks Found</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  There are no submission entries matching your search filter parameters. Try adjusting your settings.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFeedbacks.map((f, i) => (
                  <div
                    key={f.id}
                    className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 animate-scale-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div>
                      {/* Card Header (Initials + Name + Rating Badge) */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-300 text-sm tracking-wider">
                            {getInitials(f.name)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-slate-200 truncate">{f.name}</h4>
                            <a
                              href={`mailto:${f.email}`}
                              className="text-xs text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1 mt-0.5 truncate"
                            >
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{f.email}</span>
                            </a>
                          </div>
                        </div>
                        
                        {/* Rating Badge */}
                        <div className={`px-2 py-0.5 rounded-md border text-xs font-bold flex items-center gap-1 shrink-0 ${getRatingColor(f.rating)}`}>
                          <span>{f.rating}</span>
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      </div>

                      {/* Card Content (Feedback Message) */}
                      <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
                        {f.feedback}
                      </p>
                    </div>

                    {/* Card Footer (Submission time) */}
                    <div className="mt-4 pt-3.5 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(f.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}</span>
                      </span>
                      <span>{new Date(f.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
