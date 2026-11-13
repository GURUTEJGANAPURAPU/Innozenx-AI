import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Brain, Telescope, LineChart, Rocket, Code2, Briefcase } from "lucide-react";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INNOZENX AI — Assemble. Analyze. Achieve." },
      { name: "description", content: "INNOZENX AI dynamically assembles specialized AI agents to solve complex goals." },
      { property: "og:title", content: "INNOZENX AI — Multi-Agent AI Operating System" },
      { property: "og:description", content: "Your personal team of AI experts. Supervised orchestration across research, finance, startup, coding, and career agents." },
    ],
  }),
  component: Landing,
});

const AGENT_PREVIEW = [
  { name: "Research", icon: Telescope, color: "#06B6D4", note: "Web + market intel" },
  { name: "Finance", icon: LineChart, color: "#22D3EE", note: "Equities + risk" },
  { name: "Startup", icon: Rocket, color: "#A78BFA", note: "GTM + investors" },
  { name: "Coding", icon: Code2, color: "#F472B6", note: "Architecture + code" },
  { name: "Career", icon: Briefcase, color: "#FBBF24", note: "ATS + interview" },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden className="absolute inset-0 grid-bg" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-[13px] text-muted-foreground md:flex">
          <a className="hover:text-foreground" href="#agents">Agents</a>
          <a className="hover:text-foreground" href="#workflow">Workflow</a>
          <a className="hover:text-foreground" href="#showcase">Showcase</a>
        </nav>
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-[13px] font-medium text-foreground backdrop-blur transition hover:border-primary/40 hover:bg-surface"
        >
          Open app <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[11.5px] font-medium text-muted-foreground backdrop-blur"
        >
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-success" />
          A multi-agent AI operating system · powered by Groq
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          <span className="text-gradient">Your personal team</span>
          <br />
          of AI experts.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-[16px]"
        >
          INNOZENX AI dynamically assembles specialized agents — research, finance, startup, coding, career — orchestrated by a Supervisor that decomposes your goal and synthesizes a decisive strategic briefing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-[14px] font-semibold text-white shadow-[0_18px_60px_-15px_color-mix(in_oklab,var(--primary)_70%,transparent)] transition hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" /> Start mission
          </Link>
          <a
            href="#workflow"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-[14px] font-medium text-foreground backdrop-blur transition hover:border-primary/40"
          >
            <Play className="h-4 w-4" /> Watch the flow
          </a>
        </motion.div>

        {/* Hero mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="glass-strong overflow-hidden rounded-2xl p-2 shadow-[0_40px_120px_-30px_color-mix(in_oklab,var(--primary)_50%,transparent)]">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-3 rounded-xl bg-sidebar/80 p-3">
                <Logo size={22} />
                <div className="mt-4 space-y-1.5">
                  {["Dashboard", "AI Mission", "Agents", "Memory", "Projects"].map((s, i) => (
                    <div key={s} className={`rounded-md px-2 py-1.5 text-[11px] ${i === 1 ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-6 rounded-xl bg-surface/80 p-5">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">Mission</div>
                <div className="mt-1 font-display text-base font-semibold">Launch an AI agents startup</div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {AGENT_PREVIEW.slice(0, 4).map((a, i) => {
                    const I = a.icon;
                    return (
                      <motion.div
                        key={a.name}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-2.5 py-2"
                      >
                        <div className="grid h-6 w-6 place-items-center rounded-md" style={{ background: `color-mix(in oklab, ${a.color} 20%, transparent)` }}>
                          <I className="h-3 w-3" style={{ color: a.color }} />
                        </div>
                        <div className="text-[11px] font-medium">{a.name}</div>
                        <div className="ml-auto text-[9.5px] uppercase tracking-wider text-accent">{i < 2 ? "Running" : "Done"}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <div className="col-span-3 rounded-xl bg-background/60 p-3">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">Activity</div>
                <div className="mt-3 space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1">
                      <div className="h-1.5 w-3/4 overflow-hidden rounded bg-surface-2"><div className="shimmer h-full w-full" /></div>
                      <div className="h-1.5 w-1/2 overflow-hidden rounded bg-surface-2"><div className="shimmer h-full w-full" /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Agents */}
      <section id="agents" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Specialists</div>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Five domain experts. One supervisor.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] text-muted-foreground">
            The Supervisor decomposes your goal and dispatches only the agents that matter.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="glass-strong row-span-2 flex flex-col justify-between rounded-2xl p-6">
            <div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">Supervisor Agent</h3>
              <p className="mt-2 text-[13.5px] text-muted-foreground">
                The brain. Understands objectives, decomposes tasks, selects the right specialists, coordinates parallel execution, and synthesizes the final briefing.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 text-[11.5px]">
              {["Goal parsing", "Task breakdown", "Agent routing", "Synthesis"].map((c) => (
                <div key={c} className="rounded-md border border-border bg-surface/60 px-2 py-1.5 text-foreground/80">
                  {c}
                </div>
              ))}
            </div>
          </div>
          {AGENT_PREVIEW.map((a) => {
            const I = a.icon;
            return (
              <motion.div
                whileHover={{ y: -3 }}
                key={a.name}
                className="glass relative overflow-hidden rounded-2xl p-5"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-3xl"
                  style={{ background: a.color }}
                />
                <div
                  className="grid h-9 w-9 place-items-center rounded-lg"
                  style={{ background: `color-mix(in oklab, ${a.color} 18%, transparent)` }}
                >
                  <I className="h-4.5 w-4.5" style={{ color: a.color }} />
                </div>
                <div className="mt-3 font-display text-base font-semibold">{a.name} Agent</div>
                <div className="text-[12.5px] text-muted-foreground">{a.note}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="relative z-10 mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Workflow</div>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            From goal to strategic briefing.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {["You set a goal", "Supervisor plans", "Agents run in parallel", "Outputs aggregated", "Final report"].map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-xl p-4"
            >
              <div className="font-mono text-[10.5px] text-accent">0{i + 1}</div>
              <div className="mt-1 font-display text-[14px] font-semibold">{step}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="showcase" className="relative z-10 mx-auto max-w-4xl px-6 pb-28 pt-10 text-center">
        <div className="glass-strong rounded-3xl p-10 ring-glow">
          <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Assemble. Analyze. Achieve.
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] text-muted-foreground">
            Stop chatting with one AI. Start commanding a team of them.
          </p>
          <Link
            to="/app"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-[14px] font-semibold text-white shadow-[0_18px_60px_-15px_color-mix(in_oklab,var(--primary)_70%,transparent)] transition hover:scale-[1.02]"
          >
            Launch your first mission <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-6 text-center text-[11.5px] text-muted-foreground">
        INNOZENX AI · Multi-Agent AI Operating System
      </footer>
    </div>
  );
}
