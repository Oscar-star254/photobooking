export default function PageLayout({ children, className = "" }) {
  return (
    <div className={`min-h-screen bg-dark-900 ${className}`}>
      {children}
    </div>
  );
}

export function PageContainer({ children, className = "" }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, badge }) {
  return (
    <div className="text-center mb-12 pt-28 pb-4">
      {badge && (
        <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest block mb-2">
          {badge}
        </span>
      )}
      <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-400 font-body text-lg mt-3 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Grid({ children, cols = "3", className = "" }) {
  const colMap = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-2 lg:grid-cols-4",
  };
  return (
    <div className={`grid ${colMap[cols]} gap-5 ${className}`}>
      {children}
    </div>
  );
}

export function DashboardLayout({ sidebar, children }) {
  return (
    <div className="min-h-screen bg-dark-900 flex">
      {sidebar}
      <main className="flex-1 lg:ml-64 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export function Section({ children, className = "" }) {
  return (
    <section className={`py-16 sm:py-24 ${className}`}>
      {children}
    </section>
  );
}