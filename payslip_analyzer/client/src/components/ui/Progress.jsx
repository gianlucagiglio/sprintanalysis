export default function Progress({ label }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      {label && <p className="text-text-muted text-sm">{label}</p>}
    </div>
  );
}
