export default function StatCard({ icon, label, value, color = 'blue' }) {
    return (
        <div className={`stat-card stat-${color}`}>
            <div className="stat-icon" dangerouslySetInnerHTML={{ __html: icon }} />
            <div className="stat-info">
                <div className="stat-value">{value ?? '—'}</div>
                <div className="stat-label">{label}</div>
            </div>
        </div>
    );
}