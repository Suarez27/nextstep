export default function FormField({
    label,
    hint,
    error,
    htmlFor,
    children,
    className = '',
}) {
    return (
        <div className={`field ${className}`.trim()}>
            {label ? <label htmlFor={htmlFor}>{label}</label> : null}
            {children}
            {error ? <div className="form-error">{error}</div> : null}
            {!error && hint ? <span className="field-hint">{hint}</span> : null}
        </div>
    );
}