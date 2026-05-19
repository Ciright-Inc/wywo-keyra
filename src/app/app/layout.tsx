export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-keyra-bg">
      <main className="min-w-0 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
