export default function SectionCard({ children, className = '' }) {
  return <div className={`dash-section ${className}`.trim()}>{children}</div>;
}