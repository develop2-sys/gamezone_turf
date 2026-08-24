const CONFIG = {
  AVAILABLE: { color: "text-status-available", bg: "bg-status-available/15", icon: "●", label: "Available" },
  PENDING: { color: "text-status-pending", bg: "bg-status-pending/15", icon: "◐", label: "Pending" },
  CASH_PENDING: { color: "text-status-pending", bg: "bg-status-pending/15", icon: "◐", label: "Cash Pending" },
  VERIFICATION_PENDING: { color: "text-status-pending", bg: "bg-status-pending/15", icon: "◐", label: "Verifying" },
  UNPAID: { color: "text-status-pending", bg: "bg-status-pending/15", icon: "◐", label: "Unpaid" },
  BOOKED: { color: "text-status-booked", bg: "bg-status-booked/15", icon: "■", label: "Booked" },
  CONFIRMED: { color: "text-status-available", bg: "bg-status-available/15", icon: "✓", label: "Confirmed" },
  PAID: { color: "text-status-available", bg: "bg-status-available/15", icon: "✓", label: "Paid" },
  REJECTED: { color: "text-status-rejected", bg: "bg-status-rejected/15", icon: "✕", label: "Rejected" },
  FAILED: { color: "text-status-rejected", bg: "bg-status-rejected/15", icon: "✕", label: "Failed" },
  EXPIRED: { color: "text-status-rejected", bg: "bg-status-rejected/15", icon: "✕", label: "Expired" },
  CANCELLED: { color: "text-status-rejected", bg: "bg-status-rejected/15", icon: "✕", label: "Cancelled" },
  COMPLETED: { color: "text-gray-400", bg: "bg-white/5", icon: "•", label: "Completed" },
  BLOCKED: { color: "text-status-blocked", bg: "bg-status-blocked/15", icon: "▪", label: "Blocked" },
};

export default function StatusBadge({ status }) {
  const c = CONFIG[status] ?? { color: "text-gray-400", bg: "bg-white/5", icon: "•", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono ${c.color} ${c.bg}`}>
      <span aria-hidden="true">{c.icon}</span>
      {c.label}
    </span>
  );
}