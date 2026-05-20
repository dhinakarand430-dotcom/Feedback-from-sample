"use client";

import { useState } from "react";
import { User, Mail, Star, MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function FeedbackForm() {
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [websiteHoney, setWebsiteHoney] = useState(""); // Honeypot field

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [clientErrors, setClientErrors] = useState({});

  // Helper for star label
  const getRatingLabel = (value) => {
    switch (value) {
      case 1: return "Poor 😞";
      case 2: return "Fair 😐";
      case 3: return "Good 🙂";
      case 4: return "Very Good 😃";
      case 5: return "Excellent! 🤩";
      default: return "Select your rating";
    }
  };

  // Client side validation
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Name is required";
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (rating === 0) errors.rating = "Please select a rating of 1 to 5 stars";
    if (!feedback.trim()) errors.feedback = "Feedback message cannot be empty";
    
    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setClientErrors({});

    // Validate inputs
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          rating,
          feedback,
          website_honey: websiteHoney // Hidden anti-spam field
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback.");
      }

      // Success
      setSuccessData(data.data || { name, email, rating, feedback });
      // Reset form fields
      setName("");
      setEmail("");
      setRating(0);
      setFeedback("");
      setWebsiteHoney("");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setErrorMsg("");
    setClientErrors({});
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      
      {/* Background Decorative Glowing Blobs */}
      <div className="absolute top-1/4 -left-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/4 -right-10 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-3xl animate-float-medium pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Form</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Feedback Flow
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-sm">
            We value your thoughts! Please tell us about your experience.
          </p>
        </div>

        {/* Success Card or Form Card */}
        {successData ? (
          <div className="glass-panel w-full p-8 rounded-2xl shadow-2xl relative overflow-hidden border border-emerald-500/20 animate-scale-up">
            
            {/* Ambient emerald success glow */}
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl" />

            <div className="flex flex-col items-center text-center">
              {/* Checkmark Animation Container */}
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 text-emerald-400 mb-4 animate-scale-up">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
              <p className="text-slate-300 text-sm mb-6 max-w-xs">
                Your feedback has been successfully submitted and forwarded. Here is what we received:
              </p>

              {/* Submitted Data Review */}
              <div className="w-full bg-slate-950/50 rounded-xl p-5 border border-slate-800/80 text-left mb-6 space-y-4">
                <div>
                  <span className="text-xs text-slate-500 block uppercase tracking-wider">Name</span>
                  <span className="text-slate-200 font-medium">{successData.name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase tracking-wider">Email</span>
                  <span className="text-slate-200 font-medium">{successData.email}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase tracking-wider">Rating Given</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          s <= successData.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-amber-400">
                      {successData.rating}/5
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase tracking-wider">Your Message</span>
                  <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap leading-relaxed">
                    {successData.feedback}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleReset}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Submit Another Feedback
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="glass-panel w-full p-8 rounded-2xl shadow-2xl relative border border-white/5 space-y-5 animate-scale-up"
          >
            {/* Error Message banner */}
            {errorMsg && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            {/* HONEYPOT FIELD (Spam Prevention) - Styled to be invisible to users but filled by naive spam bots */}
            <div style={{ display: "none" }} aria-hidden="true">
              <label htmlFor="website_honey">Website URL</label>
              <input
                id="website_honey"
                type="text"
                name="website_honey"
                value={websiteHoney}
                onChange={(e) => setWebsiteHoney(e.target.value)}
                tabIndex="-1"
                autoComplete="off"
              />
            </div>

            {/* Input Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (clientErrors.name) setClientErrors({ ...clientErrors, name: "" });
                  }}
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 glass-input ${
                    clientErrors.name ? "border-red-500/40 focus:border-red-500 focus:shadow-red-500/10" : ""
                  }`}
                />
              </div>
              {clientErrors.name && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {clientErrors.name}
                </p>
              )}
            </div>

            {/* Input Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (clientErrors.email) setClientErrors({ ...clientErrors, email: "" });
                  }}
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 glass-input ${
                    clientErrors.email ? "border-red-500/40 focus:border-red-500 focus:shadow-red-500/10" : ""
                  }`}
                />
              </div>
              {clientErrors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {clientErrors.email}
                </p>
              )}
            </div>

            {/* Rating Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  How would you rate us?
                </label>
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-2 py-0.5 rounded">
                  {getRatingLabel(hoverRating || rating)}
                </span>
              </div>
              
              <div 
                className="flex items-center justify-center gap-2 py-3 bg-slate-900/40 rounded-xl border border-white/5"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isActive = starValue <= (hoverRating || rating);
                  const isGold = starValue <= rating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => {
                        setRating(starValue);
                        if (clientErrors.rating) setClientErrors({ ...clientErrors, rating: "" });
                      }}
                      onMouseEnter={() => setHoverRating(starValue)}
                      disabled={isSubmitting}
                      className="p-1.5 focus:outline-none hover:scale-125 focus:scale-125 transition-transform duration-150 cursor-pointer"
                      aria-label={`Rate ${starValue} Stars out of 5`}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors duration-200 ${
                          isActive
                            ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                            : "text-slate-600 hover:text-slate-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              {clientErrors.rating && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {clientErrors.rating}
                </p>
              )}
            </div>

            {/* Input Feedback Message */}
            <div className="space-y-1.5">
              <label htmlFor="feedback" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Your Feedback
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-3.5 text-slate-500 pointer-events-none">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <textarea
                  id="feedback"
                  rows="4"
                  placeholder="Share details of your experience..."
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    if (clientErrors.feedback) setClientErrors({ ...clientErrors, feedback: "" });
                  }}
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 glass-input min-h-[100px] max-h-[250px] resize-y ${
                    clientErrors.feedback ? "border-red-500/40 focus:border-red-500 focus:shadow-red-500/10" : ""
                  }`}
                />
              </div>
              {clientErrors.feedback && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {clientErrors.feedback}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:via-indigo-400 hover:to-violet-500 text-white shadow-xl hover:shadow-indigo-500/25 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Sending Feedback...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Admin Link */}
        <div className="text-center mt-6 animate-fade-in delay-200">
          <a
            href="/admin"
            className="text-xs text-slate-500 hover:text-indigo-400 transition-colors duration-200 inline-flex items-center gap-1"
          >
            Access Admin Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
