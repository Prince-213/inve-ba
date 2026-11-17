export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-5 sm:px-6">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
          IF
        </div>
        <span className="text-sm font-semibold tracking-wide uppercase">InventoryFinder</span>
      </div>
      <div className="flex flex-1 items-center px-4 pb-16">{children}</div>
    </div>
  );
}
