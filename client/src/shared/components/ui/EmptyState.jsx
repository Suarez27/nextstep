export default function EmptyState({ icon, message, children }) {
    return (
        <div className="empty-state">
            {icon ? <div className="empty-icon">{icon}</div> : null}
            <p>{message}</p>
            {children}
        </div>
    );
}