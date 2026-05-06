function valueOrDash(value) {
    return value || 'No informado';
}

function initials(name) {
    return (name || 'E').slice(0, 1).toUpperCase();
}

export default function CompanyDetailPanel({
    company,
    internships = [],
}) {
    if (!company) return null;

    const isActive = Boolean(company.is_active);

    return (
        <div className="company-detail">
            <div className="company-detail-header">
                <div className="profile-avatar-big company">{initials(company.company_name)}</div>
                <div className="company-detail-heading">
                    <div className="company-detail-title-row">
                        <h3>{valueOrDash(company.company_name)}</h3>
                        <span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`}>
                            {isActive ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>
                    <p>{company.description || 'La empresa aun no ha completado su descripcion.'}</p>
                </div>
            </div>

            <div className="company-detail-grid">
                <div>
                    <span>Sector</span>
                    <strong>{valueOrDash(company.sector)}</strong>
                </div>
                <div>
                    <span>Ciudad</span>
                    <strong>{valueOrDash(company.city)}</strong>
                </div>
                <div>
                    <span>Persona de contacto</span>
                    <strong>{valueOrDash(company.contact_person)}</strong>
                </div>
                <div>
                    <span>Email de contacto</span>
                    <strong>{valueOrDash(company.contact_email)}</strong>
                </div>
                <div>
                    <span>Telefono de contacto</span>
                    <strong>{valueOrDash(company.contact_phone)}</strong>
                </div>
            </div>

            <div className="company-offers-block">
                <div className="company-offers-heading">
                    <h4>Ofertas asociadas</h4>
                    <span>{internships.length} practica{internships.length !== 1 ? 's' : ''}</span>
                </div>

                {internships.length === 0 ? (
                    <p className="empty-msg">No hay practicas asociadas a esta empresa.</p>
                ) : (
                    <div className="company-offers-list">
                        {internships.map((item) => (
                            <div key={item.id} className="list-card compact">
                                <div className="list-card-header">
                                    <div>
                                        <div className="list-card-title">{item.title}</div>
                                        <div className="list-card-sub">
                                            {item.hours_total}h - {item.slots} plaza{item.slots !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                    {item.schedule ? <span className="tag tag-gray">{item.schedule}</span> : null}
                                </div>
                                {item.description ? <p className="list-card-desc">{item.description}</p> : null}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
