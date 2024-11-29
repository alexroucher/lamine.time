import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="card flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
      <Calendar className="h-5 w-5 text-[#FF881B] hidden md:block" />
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
        <div className="w-full md:w-auto">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="date"
            id="startDate"
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={(e) => onStartDateChange(new Date(e.target.value))}
            className="input"
          />
        </div>
        <div className="w-full md:w-auto">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            id="endDate"
            value={format(endDate, 'yyyy-MM-dd')}
            onChange={(e) => onEndDateChange(new Date(e.target.value))}
            className="input"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector;