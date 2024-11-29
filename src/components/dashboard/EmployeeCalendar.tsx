import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import type { TimeEntry, Employee } from '../../types';

interface EmployeeCalendarProps {
  employee: Employee;
  timeEntries: TimeEntry[];
  startDate: Date;
  endDate: Date;
}

const EmployeeCalendar: React.FC<EmployeeCalendarProps> = ({
  employee,
  timeEntries,
  startDate,
  endDate
}) => {
  const employeeEntries = timeEntries.filter(entry => entry.employeeId === employee.id);
  
  const formatWeekdayName = (weekday: Date) => {
    return format(weekday, 'EEEEE', { locale: fr }).toUpperCase();
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{employee.name}</h3>
      <DayPicker
        mode="single"
        locale={fr}
        showOutsideDays={false}
        formatters={{ formatWeekdayName }}
        modifiers={{
          booked: (date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return employeeEntries.some(entry => entry.date === dateStr);
          }
        }}
        modifiersStyles={{
          booked: {
            backgroundColor: '#FF881B',
            color: 'white',
            fontWeight: 'bold'
          }
        }}
        disabled={(date) => date < startDate || date > endDate}
        styles={{
          head_cell: { padding: '8px' },
          cell: { padding: '4px' },
          day: { margin: '4px', width: '32px', height: '32px' },
          nav_button_previous: { color: '#389BA9' },
          nav_button_next: { color: '#389BA9' },
          caption: { color: '#252C36' }
        }}
      />
    </div>
  );
};

export default EmployeeCalendar;