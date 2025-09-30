export default function AdminDashboardPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-fg-strong">
          Dashboard Administrativo
        </h1>
      </div>
      <div className="p-6 bg-white rounded-lg shadow-s1 border border-border-brand">
        <p className="text-fg-muted text-center">
          Indicadores e métricas gerais serão exibidos aqui.
        </p>
      </div>
    </div>
  );
}
