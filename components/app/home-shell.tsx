"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { BanksTab } from "@/components/banks/banks-tab";
import { FinderTab } from "@/components/finder/finder-tab";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HomeShell() {
  const [tab, setTab] = useState("banks");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList className="mb-6">
            <TabsTrigger value="banks">Data Banks</TabsTrigger>
            <TabsTrigger value="finder">Finder</TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {tab === "banks" ? <BanksTab /> : <FinderTab />}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
