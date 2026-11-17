"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "sign-up") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not create account");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) throw new Error("Invalid email or password");

      toast.success(mode === "sign-up" ? "Account created" : "Welcome back");
      router.push("/app");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm space-y-4"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "sign-in"
            ? "Access your inventory data banks."
            : "Start building flexible inventory banks."}
        </p>
      </div>

      {mode === "sign-up" ? (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prince"
            autoComplete="name"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? (
          <>
            No account?{" "}
            <Link href="/sign-up" className="text-foreground underline underline-offset-4">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </>
        )}
      </p>
    </motion.form>
  );
}
