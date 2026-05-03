export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Subtle dotted grid texture */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Drifting gradient blobs */}
      <div className="animate-blob-1 absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-indigo-300/50 mix-blend-multiply blur-3xl" />
      <div className="animate-blob-2 absolute -right-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-violet-300/50 mix-blend-multiply blur-3xl" />
      <div className="animate-blob-3 absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-rose-300/45 mix-blend-multiply blur-3xl" />
      <div className="animate-blob-4 absolute -bottom-32 -right-32 h-[26rem] w-[26rem] rounded-full bg-emerald-300/40 mix-blend-multiply blur-3xl" />
    </div>
  );
}
