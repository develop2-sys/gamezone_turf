export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm gap-3">
      <div className="w-6 h-6 border-2 border-white/20 border-t-brand rounded-full animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}