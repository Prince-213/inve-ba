"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AnalyticsUpIcon,
  ArrowRight01Icon,
  Cancel01Icon,
  Menu01Icon,
  PackageSearch01Icon,
  QuoteUpIcon,
  WarehouseIcon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/landing/brand-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Finder", href: "#finder" },
  { label: "Data banks", href: "#data-banks" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80";

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-svh bg-muted/40 px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] border border-border/70 bg-card text-card-foreground shadow-sm sm:rounded-[2rem]">
        <header className="relative flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
          <BrandMark />

          <nav className="hidden items-center gap-5 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
            >
              Sign in
            </Link>
            <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
              Sign up
            </Link>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <HugeiconsIcon
                icon={menuOpen ? Cancel01Icon : Menu01Icon}
                size={18}
                strokeWidth={2}
                color="currentColor"
              />
            </Button>
          </div>
        </header>

        {menuOpen ? (
          <div className="border-b border-border/60 px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/sign-in"
                className="mt-1 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted sm:hidden"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
            </nav>
          </div>
        ) : null}

        <section className="px-4 pb-8 text-center sm:px-8 lg:px-10 lg:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-3xl pt-8 sm:pt-10"
          >
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-md bg-primary px-3.5 py-1.5 text-[12px] font-semibold tracking-wide text-primary-foreground uppercase">
              <HugeiconsIcon
                icon={WarehouseIcon}
                size={14}
                strokeWidth={2}
                color="currentColor"
              />
              <span className="truncate">Flexible inventory data banks</span>
            </div>

            <h1 className="text-[2rem] leading-[1.12] font-semibold tracking-tight text-foreground sm:text-[3rem]">
              Find any product ID in seconds
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Build custom data banks, import CSV or Excel, then snap or type an ID to pull the
              exact row you need — on the floor or at your desk.
            </p>

            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                Get started free
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={16}
                  strokeWidth={2}
                  color="currentColor"
                  data-icon="inline-end"
                />
              </Link>
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto")}
              >
                Sign in
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="relative mt-10 overflow-hidden rounded-xl border border-border/70 sm:mt-12 sm:rounded-2xl"
          >
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
              <Image
                src={HERO_IMAGE}
                alt="Warehouse inventory shelves with packaged stock"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-2 rounded-md bg-background/80 px-3 py-1.5 text-[11px] font-medium text-foreground backdrop-blur-sm sm:top-4 sm:right-4 sm:px-3.5 sm:py-2 sm:text-[12px]">
              <HugeiconsIcon
                icon={AnalyticsUpIcon}
                size={14}
                strokeWidth={2}
                color="currentColor"
              />
              OCR-ready lookup
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 text-left sm:bottom-6 sm:left-6 sm:max-w-md sm:p-0">
              <HugeiconsIcon
                icon={QuoteUpIcon}
                size={24}
                strokeWidth={2}
                className="mb-2 text-primary"
                color="currentColor"
              />
              <p className="text-[13px] leading-relaxed font-medium text-white sm:text-[15px]">
                Snap a clear product ID, confirm the read in search, and match the right bank row
                without flipping through spreadsheets.
              </p>
            </div>
          </motion.div>
        </section>

        <section
          id="features"
          className="border-t border-border/60 px-4 py-10 sm:px-8 sm:py-12 lg:px-10"
        >
          <div className="mx-auto grid max-w-4xl gap-8 text-left sm:grid-cols-3">
            {[
              {
                icon: PackageSearch01Icon,
                title: "Custom data banks",
                body: "Define the columns you actually use — model, size, price, notes — per inventory set.",
              },
              {
                icon: WarehouseIcon,
                title: "CSV & Excel import",
                body: "Upload spreadsheets, map headers once, and fill a bank without retyping every row.",
              },
              {
                icon: AnalyticsUpIcon,
                title: "Live ID finder",
                body: "Type or OCR an ID and watch matches filter as you go — built for quick lookups.",
              },
            ].map((feature) => (
              <div key={feature.title} className="space-y-2">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <HugeiconsIcon
                    icon={feature.icon}
                    size={18}
                    strokeWidth={2}
                    color="currentColor"
                  />
                </div>
                <h2 className="text-base font-semibold text-foreground">{feature.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="finder" className="scroll-mt-8" />
        <section id="data-banks" className="scroll-mt-8" />

        <section
          id="how-it-works"
          className="border-t border-border/60 px-4 py-10 sm:px-8 sm:py-12 lg:px-10"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">How it works</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Three steps from empty bank to instant floor lookup.
            </p>
            <ol className="mt-8 grid gap-4 text-left sm:grid-cols-3">
              {[
                "Create a bank and name your columns.",
                "Import CSV/Excel or add rows manually.",
                "Open Finder, snap or type the ID, get the match.",
              ].map((step, i) => (
                <li key={step} className="rounded-md border border-border/80 bg-muted/40 px-4 py-5">
                  <span className="text-xs font-semibold tracking-widest text-primary uppercase">
                    Step {i + 1}
                  </span>
                  <p className="mt-2 text-sm font-medium text-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <footer
          id="contact"
          className="flex flex-col items-center justify-between gap-4 border-t border-border/60 px-4 py-8 text-center sm:flex-row sm:px-8 sm:text-left lg:px-10"
        >
          <BrandMark wordmarkClassName="text-sm" />
          <p className="text-sm text-muted-foreground">
            Built by <span className="font-medium text-foreground">Prince Kuvuki</span>
          </p>
          <Link
            href="/sign-up"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Get started free
          </Link>
        </footer>
      </div>
    </div>
  );
}
