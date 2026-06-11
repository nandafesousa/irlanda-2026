export interface StatCardProps {
  value: string | number;
  label: string;
  icon?: string;
}

export default function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div className="glass-card p-6 text-center">
      {icon && <span className="text-2xl mb-2 block">{icon}</span>}
      <p className="text-[2.4rem] font-[800] text-[var(--warning)] leading-none mb-1">{value}</p>
      <p className="text-white">{label}</p>
    </div>
  );
}
