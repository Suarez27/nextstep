const VARIANT_CLASS = {
    success: 'alert-success',
    error: 'form-error',
};

export default function Alert({
    children,
    variant = 'success',
    onClick,
    className = '',
}) {
    const resolvedClass = VARIANT_CLASS[variant] || 'alert-success';

    return (
        <div
            className={`${resolvedClass} ${className}`.trim()}
            onClick={onClick}
            role="alert"
        >
            {children}
        </div>
    );
}