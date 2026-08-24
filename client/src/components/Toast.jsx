export default function Toast({ message, tone = "error", onDismiss }) {
  if (!message) return null;
  const styles = tone === "error"
    ? "bg-status-rejected/15 text-status-rejected border-status-rejected/30"
    : "bg-status-available/15 text-status-available border-status-available/30";
  return (
    <div className={`flex items-start justify-between gap-3 border rounded-xl px-4 py-3 text-sm mb-4 ${styles}`} role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="text-current opacity-70 hover:opacity-100">✕</button>
      )}
    </div>
  );
}