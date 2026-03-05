import { Toaster } from "sonner";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <h1 className="text-2xl font-semibold">Vite + React + Shadcn + TS</h1>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
