export default function Modal({
    title,
    onClose,
    children,
    actions,
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose} type="button">
                        &#10005;
                    </button>
                </div>

                {children}

                {actions ? <div className="modal-actions">{actions}</div> : null}
            </div>
        </div>
    );
}