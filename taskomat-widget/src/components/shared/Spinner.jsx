export default function Spinner({ size = 24 }) {
  return (
    <div
      className="anim-spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Caricamento"
    />
  )
}
