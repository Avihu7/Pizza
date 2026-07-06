const STATUS_LABELS = {
  new: "חדשה",
  preparing: "בהכנה",
  ready: "מוכנה",
  delivered: "נמסרה",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
