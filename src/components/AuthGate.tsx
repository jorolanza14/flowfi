"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BaryaChan } from "./BaryaChan";

interface AuthGateProps {
  onAuthenticated: (token: string) => void;
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const signInMutation = useMutation(api.flowfi.signIn);
  const signUpMutation = useMutation(api.flowfi.signUp);

  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result =
        flow === "signIn"
          ? await signInMutation({ email, password })
          : await signUpMutation({ email, password });

      onAuthenticated(result.token);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace(/^.*Uncaught Error:\s*/, "")
          : "Authentication failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 py-8">
      <div className="kawaii-card animate-pop-in w-full p-6 text-center">
        <div className="mb-3 flex justify-center">
          <BaryaChan mood="happy" />
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-[#2B252C]">
          Flowfi
        </h1>
        <p className="mt-1 text-xs font-bold text-[#6E6570]">
          Cozy daily spending pace for GCash, Maya, BPI & Cash
        </p>

        <div className="mt-3 flex justify-center gap-1.5">
          <span className="rounded-full border-2 border-[#2B252C] bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-extrabold">
            ⚡ 3-Tap Log
          </span>
          <span className="rounded-full border-2 border-[#2B252C] bg-[#D1FAE5] px-2.5 py-0.5 text-[10px] font-extrabold">
            ☁️ Cloud Synced
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3 text-left">
          <div>
            <label className="text-xs font-extrabold text-[#2B252C]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-2xl border-2 border-[#2B252C] bg-[#FFF9EC] px-3.5 py-2.5 text-sm font-bold outline-none transition focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-[#2B252C]">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1 w-full rounded-2xl border-2 border-[#2B252C] bg-[#FFF9EC] px-3.5 py-2.5 text-sm font-bold outline-none transition focus:bg-white"
            />
          </div>

          {error && (
            <p className="animate-pop-in rounded-xl border-2 border-[#2B252C] bg-[#FFE4E6] px-3 py-2 text-xs font-extrabold text-[#BE123C]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="squishy-btn mt-2 w-full rounded-2xl bg-[#FBBF24] py-3 font-display text-base font-bold text-[#2B252C] disabled:opacity-50"
          >
            {loading
              ? "Opening vault..."
              : flow === "signIn"
                ? "Enter Flowfi"
                : "Create Flowfi Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setFlow(flow === "signIn" ? "signUp" : "signIn");
            setError("");
          }}
          className="mt-4 text-xs font-extrabold text-[#6E6570] underline transition hover:text-[#2B252C]"
        >
          {flow === "signIn"
            ? "New here? Create a Flowfi account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
