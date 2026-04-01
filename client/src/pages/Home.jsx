import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const BENEFITS = {
  es: [
    {
      title: 'Coordinacion total',
      text: 'Gestiona practicas, entrevistas, convenios y seguimiento en un mismo flujo para centro, empresa y alumnado.',
    },
    {
      title: 'Mas velocidad operativa',
      text: 'Automatiza tareas repetitivas y centraliza decisiones con paneles por rol y estados claros.',
    },
    {
      title: 'Trazabilidad real',
      text: 'Cada candidatura y acuerdo queda registrado para auditoria academica y mejora continua.',
    },
  ],
  en: [
    {
      title: 'Total coordination',
      text: 'Manage internships, interviews, agreements, and follow-up in a single workflow for schools, companies, and students.',
    },
    {
      title: 'Faster operations',
      text: 'Automate repetitive work and centralize decisions with role-based dashboards and clear statuses.',
    },
    {
      title: 'Real traceability',
      text: 'Every application and agreement is tracked for academic auditing and continuous improvement.',
    },
  ],
};

const STEPS = {
  es: [
    {
      id: '01',
      title: 'Publica y organiza',
      text: 'Centros y empresas crean ofertas de practicas con plazas, horarios y requisitos.',
    },
    {
      id: '02',
      title: 'Conecta talento',
      text: 'El alumnado aplica a vacantes y las entidades validan candidaturas desde una sola vista.',
    },
    {
      id: '03',
      title: 'Da seguimiento',
      text: 'Entrevistas, convenios y evaluaciones quedan unificados para un control continuo.',
    },
  ],
  en: [
    {
      id: '01',
      title: 'Publish and organize',
      text: 'Schools and companies create internship listings with seats, schedules, and requirements.',
    },
    {
      id: '02',
      title: 'Connect talent',
      text: 'Students apply to opportunities while organizations validate candidates from one view.',
    },
    {
      id: '03',
      title: 'Track progress',
      text: 'Interviews, agreements, and evaluations are unified for continuous control.',
    },
  ],
};

const PLANS = {
  es: [
    {
      name: 'Start',
      price: 49,
      subtitle: 'Para centros pequenos o empresas con pocas plazas.',
      features: ['Hasta 60 alumnos', 'Panel de practicas y candidaturas', 'Soporte por correo'],
    },
    {
      name: 'Growth',
      price: 129,
      subtitle: 'Escala la gestion multi-sede y equipos mixtos.',
      features: ['Hasta 300 alumnos', 'Entrevistas y convenios avanzados', 'Soporte prioritario'],
      featured: true,
    },
    {
      name: 'Enterprise',
      price: 'A medida',
      subtitle: 'Implementacion personalizada para redes educativas.',
      features: ['Integraciones dedicadas', 'Onboarding guiado', 'Acuerdo SLA empresarial'],
    },
  ],
  en: [
    {
      name: 'Start',
      price: 49,
      subtitle: 'For small schools or companies with limited seats.',
      features: ['Up to 60 students', 'Internship and applications dashboard', 'Email support'],
    },
    {
      name: 'Growth',
      price: 129,
      subtitle: 'Scale multi-campus operations and mixed teams.',
      features: ['Up to 300 students', 'Advanced interviews and agreements', 'Priority support'],
      featured: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      subtitle: 'Tailored implementation for educational networks.',
      features: ['Dedicated integrations', 'Guided onboarding', 'Enterprise SLA agreement'],
    },
  ],
};

const ROLE_EXPERIENCE = {
  es: [
    {
      key: 'centro',
      label: 'Centro educativo',
      title: 'Control academico en tiempo real',
      text: 'Coordina alumnos, tutores y empresas en una sola vista con seguimiento continuo de cada practica.',
      points: ['Validacion de alumnado', 'Trazabilidad de acuerdos', 'Panel de seguimiento'],
    },
    {
      key: 'empresa',
      label: 'Empresa',
      title: 'Seleccion agil de candidatos',
      text: 'Publica plazas, revisa perfiles y gestiona entrevistas con estados claros para tu equipo.',
      points: ['Publicacion de practicas', 'Gestion de candidatos', 'Agenda de entrevistas'],
    },
    {
      key: 'alumno',
      label: 'Alumno',
      title: 'Ruta profesional guiada',
      text: 'Encuentra vacantes, postulate y sigue cada etapa con feedback centralizado.',
      points: ['Busqueda por perfil', 'Estado de candidaturas', 'Seguimiento personal'],
    },
  ],
  en: [
    {
      key: 'centro',
      label: 'School',
      title: 'Real-time academic control',
      text: 'Coordinate students, tutors, and companies from a single view with continuous internship tracking.',
      points: ['Student validation', 'Agreement traceability', 'Follow-up dashboard'],
    },
    {
      key: 'empresa',
      label: 'Company',
      title: 'Agile candidate selection',
      text: 'Publish openings, review profiles, and manage interviews with clear statuses for your team.',
      points: ['Internship publishing', 'Candidate management', 'Interview scheduling'],
    },
    {
      key: 'alumno',
      label: 'Student',
      title: 'Guided career journey',
      text: 'Find vacancies, apply, and track every stage with centralized feedback.',
      points: ['Profile-based search', 'Application status', 'Personal follow-up'],
    },
  ],
};

const FAQ = {
  es: [
    {
      q: 'Cuanto tarda la puesta en marcha?',
      a: 'En planes Start y Growth, la activacion suele completarse en 48-72 horas con importacion inicial de datos.',
    },
    {
      q: 'Puedo migrar desde hojas de calculo?',
      a: 'Si. NextStep permite carga inicial de alumnos y empresas para arrancar sin perder historico.',
    },
    {
      q: 'Como se gestionan permisos y seguridad?',
      a: 'Cada perfil opera con permisos por rol y trazabilidad de acciones para mantener control operativo.',
    },
  ],
  en: [
    {
      q: 'How long does onboarding take?',
      a: 'For Start and Growth plans, activation is usually completed in 48-72 hours with initial data import.',
    },
    {
      q: 'Can I migrate from spreadsheets?',
      a: 'Yes. NextStep supports initial student and company imports so you can launch without losing history.',
    },
    {
      q: 'How are permissions and security handled?',
      a: 'Each profile operates with role-based permissions and action traceability to maintain operational control.',
    },
  ],
};

const UI_TEXT = {
  es: {
    nav: {
      experience: 'Experiencia',
      flow: 'Como funciona',
      pricing: 'Tarifas',
      faq: 'FAQ',
      login: 'Iniciar sesion',
      demo: 'Solicitar demo',
      homeAria: 'Inicio NextStep',
      ariaMain: 'Navegacion principal',
      ariaLang: 'Cambiar idioma',
      brandSub: 'Gestion de practicas FP',
    },
    hero: {
      kicker: 'Plataforma integral para practicas de Formacion Profesional',
      title: 'Una nueva forma de coordinar centros, empresas y alumnado en una sola experiencia.',
      subtitle:
        'NextStep conecta oportunidades reales con procesos claros: desde la oferta inicial hasta el seguimiento final, con paneles por rol, visibilidad completa y decisiones mas rapidas.',
      start: 'Comenzar ahora',
      account: 'Ya tengo cuenta',
      ribbon1: 'Gestion completa de practicas',
      ribbon2: 'Estados en tiempo real',
      ribbon3: 'Integracion centro-empresa-alumno',
    },
    sections: {
      value: 'Que aporta NextStep',
      valueTitle: 'Operacion educativa y empresarial en armonia',
      role: 'Experiencia por perfil',
      roleTitle: 'Una plataforma, tres vistas inteligentes',
      flow: 'Flujo de trabajo',
      flowTitle: 'Como funciona en 3 pasos',
      pricing: 'Planes y tarifas',
      pricingTitle: 'Elige el ritmo de crecimiento para tu organizacion',
      faq: 'Preguntas frecuentes',
      faqTitle: 'Todo claro antes de empezar',
      cta: 'Transforma tu gestion de practicas con una experiencia elegante y eficiente.',
      ctaSub: 'Empieza hoy con NextStep y convierte cada proceso de practicas en una ruta clara de resultados.',
      create: 'Crear cuenta',
      access: 'Acceder',
      monthly: 'Mensual',
      annual: 'Anual',
      annualNote: '*Facturacion anual con descuento aplicado.',
      billingAria: 'Selector de facturacion',
      popular: 'Mas popular',
      clickHint: 'Haz click para ver que incluye',
      includes: 'incluye',
      requestAccess: 'Solicitar acceso',
      backToFront: 'Volver al frente del plan',
      detailsAria: 'Ver detalles del plan',
      perMonth: 'mes',
      perMonthAnnual: 'mes*',
    },
    metrics: {
      aria: 'Indicadores de impacto',
      one: 'Centros y empresas conectados',
      two: 'Candidaturas gestionadas en menos de 72h',
      three: 'Alumnos en seguimiento activo',
    },
    footer: {
      desc: 'Disenada para conectar centros, empresas y alumnado con una operacion moderna, segura y medible.',
      product: 'Producto',
      company: 'Empresa',
      contact: 'Contacto',
      brandSub: 'Plataforma de practicas FP',
      flow: 'Como funciona',
      pricing: 'Tarifas',
      faq: 'Preguntas frecuentes',
      benefits: 'Beneficios',
      roleExp: 'Experiencia por rol',
      access: 'Acceso plataforma',
      schedule: 'Lunes a Viernes · 9:00 - 18:00',
      rights: '(c) 2026 NextStep. Todos los derechos reservados.',
      privacy: 'Privacidad',
      terms: 'Terminos',
      cookies: 'Cookies',
    },
  },
  en: {
    nav: {
      experience: 'Experience',
      flow: 'How it works',
      pricing: 'Pricing',
      faq: 'FAQ',
      login: 'Sign in',
      demo: 'Request demo',
      homeAria: 'NextStep home',
      ariaMain: 'Main navigation',
      ariaLang: 'Change language',
      brandSub: 'Vocational internship management',
    },
    hero: {
      kicker: 'End-to-end platform for vocational internships',
      title: 'A new way to connect schools, companies, and students in one experience.',
      subtitle:
        'NextStep connects real opportunities with clear workflows, from first listing to final follow-up, with role-based panels and faster decisions.',
      start: 'Get started',
      account: 'I already have an account',
      ribbon1: 'Full internship management',
      ribbon2: 'Real-time status tracking',
      ribbon3: 'School-company-student integration',
    },
    sections: {
      value: 'What NextStep brings',
      valueTitle: 'Educational and business operations in sync',
      role: 'Role-based experience',
      roleTitle: 'One platform, three smart views',
      flow: 'Workflow',
      flowTitle: 'How it works in 3 steps',
      pricing: 'Plans and pricing',
      pricingTitle: 'Choose the right growth pace for your organization',
      faq: 'Frequently asked questions',
      faqTitle: 'Everything clear before you start',
      cta: 'Upgrade internship management with an elegant and efficient experience.',
      ctaSub: 'Start today with NextStep and turn every internship process into measurable results.',
      create: 'Create account',
      access: 'Access platform',
      monthly: 'Monthly',
      annual: 'Annual',
      annualNote: '*Annual billing with discount applied.',
      billingAria: 'Billing selector',
      popular: 'Most popular',
      clickHint: 'Click to see what is included',
      includes: 'includes',
      requestAccess: 'Request access',
      backToFront: 'Back to front of plan',
      detailsAria: 'View plan details',
      perMonth: 'month',
      perMonthAnnual: 'month*',
    },
    metrics: {
      aria: 'Impact metrics',
      one: 'Connected schools and companies',
      two: 'Applications managed in less than 72h',
      three: 'Students in active follow-up',
    },
    footer: {
      desc: 'Built to connect schools, companies, and students through a modern, secure, and measurable operation.',
      product: 'Product',
      company: 'Company',
      contact: 'Contact',
      brandSub: 'Vocational internship platform',
      flow: 'How it works',
      pricing: 'Pricing',
      faq: 'FAQ',
      benefits: 'Benefits',
      roleExp: 'Role experience',
      access: 'Platform access',
      schedule: 'Monday to Friday · 9:00 - 18:00',
      rights: '(c) 2026 NextStep. All rights reserved.',
      privacy: 'Privacy',
      terms: 'Terms',
      cookies: 'Cookies',
    },
  },
};

export default function Home() {
  const [lang, setLang] = useState('es');
  const [billing, setBilling] = useState('monthly');
  const [activeRole, setActiveRole] = useState('centro');
  const [activeFaq, setActiveFaq] = useState(0);
  const [flippedPlan, setFlippedPlan] = useState(null);
  const copy = UI_TEXT[lang];
  const benefits = BENEFITS[lang];
  const steps = STEPS[lang];
  const plans = PLANS[lang];
  const roleExperience = ROLE_EXPERIENCE[lang];
  const faqItems = FAQ[lang];

  const highlightedRole = useMemo(
    () => roleExperience.find((role) => role.key === activeRole) || roleExperience[0],
    [activeRole, roleExperience],
  );

  return (
    <div className="home-page">
      <div className="home-glow home-glow-left" aria-hidden="true" />
      <div className="home-glow home-glow-right" aria-hidden="true" />

      <header className="home-nav-wrap">
        <nav className="home-nav">
          <Link to="/" className="home-brand" aria-label={copy.nav.homeAria}>
            <span className="home-brand-mark">N</span>
            <span>
              <strong>NextStep</strong>
              <small>{copy.nav.brandSub}</small>
            </span>
          </Link>

          <div className="home-nav-center" aria-label={copy.nav.ariaMain}>
            <a href="#experiencia" className="home-link">{copy.nav.experience}</a>
            <a href="#como-funciona" className="home-link">{copy.nav.flow}</a>
            <a href="#tarifas" className="home-link">{copy.nav.pricing}</a>
            <a href="#faq" className="home-link">{copy.nav.faq}</a>
          </div>

          <div className="home-nav-actions">
            <button
              type="button"
              className="home-btn home-btn-ghost nav-lang"
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              aria-label={copy.nav.ariaLang}
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <Link to="/login" className="home-btn home-btn-ghost nav-login">{copy.nav.login}</Link>
            <Link to="/login?mode=register" className="home-btn home-btn-primary">{copy.nav.demo}</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <p className="home-kicker">{copy.hero.kicker}</p>
          <h1>
            {copy.hero.title}
          </h1>
          <p className="home-hero-sub">
            {copy.hero.subtitle}
          </p>
          <div className="home-hero-actions">
            <Link to="/login?mode=register" className="home-btn home-btn-primary">{copy.hero.start}</Link>
            <Link to="/login" className="home-btn home-btn-ghost">{copy.hero.account}</Link>
          </div>

          <div className="hero-ribbon reveal-up" aria-label={copy.hero.kicker}>
            <span>{copy.hero.ribbon1}</span>
            <span>{copy.hero.ribbon2}</span>
            <span>{copy.hero.ribbon3}</span>
          </div>
        </section>

        <div className="home-lower">
          <section className="home-metrics" aria-label={copy.metrics.aria}>
            <article>
              <strong>+120</strong>
              <span>{copy.metrics.one}</span>
            </article>
            <article>
              <strong>94%</strong>
              <span>{copy.metrics.two}</span>
            </article>
            <article>
              <strong>+4.5k</strong>
              <span>{copy.metrics.three}</span>
            </article>
          </section>

          <section className="home-section" id="beneficios">
            <div className="home-section-head">
              <p>{copy.sections.value}</p>
              <h2>{copy.sections.valueTitle}</h2>
            </div>
            <div className="home-cards">
              {benefits.map((item) => (
                <article key={item.title} className="home-card reveal-up">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="home-section" id="experiencia">
            <div className="home-section-head">
              <p>{copy.sections.role}</p>
              <h2>{copy.sections.roleTitle}</h2>
            </div>
            <div className="role-switch" role="tablist" aria-label={copy.sections.role}>
              {roleExperience.map((role) => (
                <button
                  key={role.key}
                  role="tab"
                  type="button"
                  aria-selected={activeRole === role.key}
                  className={`role-pill${activeRole === role.key ? ' active' : ''}`}
                  onClick={() => setActiveRole(role.key)}
                >
                  {role.label}
                </button>
              ))}
            </div>

            <article className="role-panel reveal-up" role="tabpanel">
              <h3>{highlightedRole.title}</h3>
              <p>{highlightedRole.text}</p>
              <ul>
                {highlightedRole.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="home-section" id="como-funciona">
            <div className="home-section-head">
              <p>{copy.sections.flow}</p>
              <h2>{copy.sections.flowTitle}</h2>
            </div>
            <div className="home-timeline">
              {steps.map((item) => (
                <article key={item.id} className="home-step reveal-up">
                  <span>{item.id}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="home-section" id="tarifas">
            <div className="home-section-head">
              <p>{copy.sections.pricing}</p>
              <h2>{copy.sections.pricingTitle}</h2>
            </div>

            <div className="billing-toggle" aria-label={copy.sections.billingAria}>
              <button
                type="button"
                className={billing === 'monthly' ? 'active' : ''}
                onClick={() => setBilling('monthly')}
              >
                {copy.sections.monthly}
              </button>
              <button
                type="button"
                className={billing === 'annual' ? 'active' : ''}
                onClick={() => setBilling('annual')}
              >
                {copy.sections.annual} <span>-20%</span>
              </button>
            </div>

            <div className="home-pricing-grid">
              {plans.map((plan, index) => (
                <article
                  key={plan.name}
                  className={`price-flip price-card-flip${plan.featured ? ' featured' : ''}${flippedPlan === plan.name ? ' is-flipped' : ''}`}
                  style={{ '--card-delay': `${index * 0.1}s` }}
                >
                  <div className="price-flip-clip">
                    <div className="price-flip-inner price-card-inner">
                    <button
                      type="button"
                      className="price-face price-face-front price-card-front"
                      onClick={() => setFlippedPlan(flippedPlan === plan.name ? null : plan.name)}
                      aria-label={`${copy.sections.detailsAria} ${plan.name}`}
                    >
                      {plan.featured && <div className="price-badge">{copy.sections.popular}</div>}
                      <h3>{plan.name}</h3>
                      <div className="price-value">
                        {typeof plan.price === 'number' ? (
                          <>
                            <span>{billing === 'annual' ? Math.round(plan.price * 0.8) : plan.price}</span>{' '}
                            EUR/{billing === 'annual' ? copy.sections.perMonthAnnual : copy.sections.perMonth}
                          </>
                        ) : (
                          plan.price
                        )}
                      </div>
                      <p>{plan.subtitle}</p>
                      <small className="price-flip-hint">{copy.sections.clickHint}</small>
                    </button>

                    <div
                      className="price-face price-face-back price-card-back"
                      role="button"
                      tabIndex={0}
                      onClick={() => setFlippedPlan(null)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setFlippedPlan(null);
                        }
                      }}
                      aria-label={`${copy.sections.backToFront} ${plan.name}`}
                    >
                      <h3>{plan.name} {copy.sections.includes}</h3>
                      <ul>
                        {plan.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                      <div className="price-face-actions" onClick={(event) => event.stopPropagation()}>
                        <Link to="/login?mode=register" className="home-btn home-btn-primary">{copy.sections.requestAccess}</Link>
                      </div>
                    </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {billing === 'annual' && <p className="billing-note">{copy.sections.annualNote}</p>}
          </section>

          <section className="home-section" id="faq">
            <div className="home-section-head">
              <p>{copy.sections.faq}</p>
              <h2>{copy.sections.faqTitle}</h2>
            </div>
            <div className="faq-list">
              {faqItems.map((item, index) => (
                <article key={item.q} className={`faq-item${activeFaq === index ? ' open' : ''}`}>
                  <button type="button" onClick={() => setActiveFaq(index === activeFaq ? -1 : index)}>
                    <span>{item.q}</span>
                    <strong>{activeFaq === index ? '-' : '+'}</strong>
                  </button>
                  {activeFaq === index && <p>{item.a}</p>}
                </article>
              ))}
            </div>
          </section>

          <section className="home-cta">
            <h2>{copy.sections.cta}</h2>
            <p>
              {copy.sections.ctaSub}
            </p>
            <div className="home-hero-actions">
              <Link to="/login?mode=register" className="home-btn home-btn-primary">{copy.sections.create}</Link>
              <Link to="/login" className="home-btn home-btn-ghost">{copy.sections.access}</Link>
            </div>
          </section>

          <footer className="home-footer">
            <div className="home-footer-grid">
              <div>
                <Link to="/" className="home-footer-brand" aria-label={copy.nav.homeAria}>
                  <span className="home-brand-mark">N</span>
                  <span>
                    <strong>NextStep</strong>
                    <small>{copy.footer.brandSub}</small>
                  </span>
                </Link>
                <p className="home-footer-desc">
                  {copy.footer.desc}
                </p>
              </div>

              <div>
                <h4>{copy.footer.product}</h4>
                <a href="#como-funciona">{copy.footer.flow}</a>
                <a href="#tarifas">{copy.footer.pricing}</a>
                <a href="#faq">{copy.footer.faq}</a>
              </div>

              <div>
                <h4>{copy.footer.company}</h4>
                <a href="#beneficios">{copy.footer.benefits}</a>
                <a href="#experiencia">{copy.footer.roleExp}</a>
                <Link to="/login">{copy.footer.access}</Link>
              </div>

              <div>
                <h4>{copy.footer.contact}</h4>
                <a href="mailto:hola@nextstep.local">hola@nextstep.local</a>
                <a href="tel:+34900000000">+34 900 000 000</a>
                <span>{copy.footer.schedule}</span>
              </div>
            </div>

            <div className="home-footer-bottom">
              <span>{copy.footer.rights}</span>
              <div>
                <a href="#">{copy.footer.privacy}</a>
                <a href="#">{copy.footer.terms}</a>
                <a href="#">{copy.footer.cookies}</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
