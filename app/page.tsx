import Scene from "@/components/Scene/Scene";

export default function Home() {
  return (
    <main className="relative w-full">
      <div className="canvas-container">
        <Scene />
      </div>
      <div className="scroll-content">
        {/* Invisible scroll spacer, or overlay content */}
        <div className="h-screen flex items-center justify-center pointer-events-none">
          <h1 className="text-4xl font-bold text-white mix-blend-difference opacity-0">Scroll to Enter</h1>
        </div>
      </div>
    </main>
  );
}
