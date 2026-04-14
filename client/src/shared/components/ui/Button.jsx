export default function Button({
    children,
    type = 'button',
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) {
    const variantClass = variant === 'ghost' ? 'btn-ghost' : 'btn-primary';
    const fullWidthClass = fullWidth ? ' btn-full' : '';

    return (
        <button
            type={type}
            className={`${variantClass}${fullWidthClass} ${className}`.trim()}
            {...props}
        >
            {children}
        </button>
    );
}