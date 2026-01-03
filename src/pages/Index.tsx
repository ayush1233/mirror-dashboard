import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

const Index = () => {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--card))] px-4">
      <motion.div
        className="max-w-xl rounded-2xl border border-border/80 bg-card/80 p-8 shadow-[var(--shadow-soft)] backdrop-blur-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Shadow Mirror</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">Spring Boot Mirror Test Dashboard</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Run PROD vs UAT mirror tests, explore history analytics, and visualize JSON diffs without touching your backend
          implementation.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="hero" size="lg" onClick={() => navigate("/auth")}
            >Get Started – Sign In</Button
          >
          <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")}
            >View Dashboard</Button
          >
        </div>
      </motion.div>
    </main>
  );
};

export default Index;
