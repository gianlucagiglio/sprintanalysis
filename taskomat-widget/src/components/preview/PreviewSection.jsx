export default function PreviewSection({ label, value, mono }) {
  return (
    <div className="preview-section">
      <div className="preview-label">{label}</div>
      <div className={`preview-value${mono ? ' preview-value--mono' : ''}`}>
        {value}
      </div>
    </div>
  )
}
