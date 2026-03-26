export default function FormField({ label, error, required, children, htmlFor }) {
  return (
    <div className="form-group">
      {label && (
        <label
          className={`form-label${required ? ' form-label-required' : ''}`}
          htmlFor={htmlFor}
        >
          {label}
        </label>
      )}
      <div className="form-field">
        {children}
      </div>
      {error && (
        <div className="form-message form-message--error">
          <svg viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4v3.5M7 9.5v.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}
