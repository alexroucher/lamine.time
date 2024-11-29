import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  name: string;
  hours: number;
  color: string;
}

interface GlobalTimeDistributionProps {
  viewMode: 'employee' | 'subject';
  data: ChartData[];
  onToggleViewMode: () => void;
}

const GlobalTimeDistribution: React.FC<GlobalTimeDistributionProps> = ({ 
  viewMode, 
  data,
  onToggleViewMode 
}) => {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#389BA9]" />
          Répartition du temps de travail {viewMode === 'subject' ? 'par sujet' : 'par salarié'}
        </h3>
        <button
          onClick={onToggleViewMode}
          className="btn btn-blue flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Vue par {viewMode === 'subject' ? 'salarié' : 'sujet'}</span>
        </button>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#252C36', fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fill: '#252C36' }} />
            <Tooltip 
              formatter={(value) => `${Math.round(Number(value))}h`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GlobalTimeDistribution;