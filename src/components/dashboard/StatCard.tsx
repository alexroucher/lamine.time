import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, Icon, gradient }) => {
  return (
    <div className={`card ${gradient} text-white`}>
      <div className="flex items-center gap-3">
        <Icon className="h-8 w-8" />
        <div>
          <h2 className="text-sm font-medium opacity-90">{title}</h2>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;