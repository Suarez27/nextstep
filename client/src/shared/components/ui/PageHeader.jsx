export default function PageHeader({ title, subtitle, actions, children }) {
    return (
        <div className="page-header">
            <div>
                <h1 className="page-title">{title}</h1>
                {subtitle ? <p className="page-sub">{subtitle}</p> : null}
                {children}
            </div>
            {actions ? <div>{actions}</div> : null}
        </div>
    );
}