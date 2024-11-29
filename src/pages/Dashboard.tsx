import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Clock, Target, Building2 } from 'lucide-react';
import { getAllDocuments, COLLECTIONS } from '../lib/firebase';
import type { TimeEntry, Employee, Client } from '../types';
import { COLORS } from '../utils/colors';
import { calculateTotalHours, getMostCommonSubject, getMostTimeConsumingClient } from '../utils/timeEntryUtils';
import DateRangeSelector from '../components/dashboard/DateRangeSelector';
import EmployeeCalendar from '../components/dashboard/EmployeeCalendar';
import StatCard from '../components/dashboard/StatCard';
import ClientChart from '../components/dashboard/ClientChart';
import GlobalTimeDistribution from '../components/dashboard/GlobalTimeDistribution';

const Dashboard = () => {
  const navigate = useNavigate();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [viewMode, setViewMode] = useState<Record<string, 'employee' | 'subject'>>({});
  const [globalViewMode, setGlobalViewMode] = useState<'employee' | 'subject'>('subject');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [entriesData, employeesData, clientsData] = await Promise.all([
        getAllDocuments(COLLECTIONS.TIME_ENTRIES),
        getAllDocuments(COLLECTIONS.EMPLOYEES),
        getAllDocuments(COLLECTIONS.CLIENTS)
      ]);
      
      setTimeEntries(entriesData as TimeEntry[]);
      setEmployees(employeesData as Employee[]);
      setClients(clientsData as Client[]);
      setLoading(false);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  const getClientName = (id: string) => {
    return clients.find(c => c.id === id)?.name || 'Inconnu';
  };

  const getGlobalDistributionData = (mode: 'employee' | 'subject') => {
    if (mode === 'employee') {
      return employees.map((employee, index) => {
        const hours = filteredEntries
          .filter(entry => entry.employeeId === employee.id)
          .reduce((sum, entry) => 
            sum + Object.values(entry.subjectHours).reduce((acc, h) => acc + h, 0), 
            0
          );
        return {
          name: employee.name,
          hours,
          color: COLORS.orange[index % COLORS.orange.length]
        };
      }).filter(item => item.hours > 0)
        .sort((a, b) => b.hours - a.hours);
    } else {
      const subjectHours = filteredEntries.reduce((acc, entry) => {
        Object.entries(entry.subjectHours).forEach(([subject, hours]) => {
          acc[subject] = (acc[subject] || 0) + hours;
        });
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(subjectHours)
        .map(([subject, hours], index) => ({
          name: subject,
          hours,
          color: COLORS.blue[index % COLORS.blue.length]
        }))
        .sort((a, b) => b.hours - a.hours);
    }
  };

  const getClientDetails = (clientId: string, mode: 'employee' | 'subject') => {
    const clientEntries = filteredEntries.filter(entry => entry.clientId === clientId);
    
    if (mode === 'employee') {
      return employees.map((employee, index) => {
        const hours = clientEntries
          .filter(entry => entry.employeeId === employee.id)
          .reduce((sum, entry) => 
            sum + Object.values(entry.subjectHours).reduce((acc, h) => acc + h, 0), 
            0
          );
        return {
          name: employee.name,
          hours,
          color: COLORS.orange[index % COLORS.orange.length]
        };
      }).filter(item => item.hours > 0);
    } else {
      return Object.entries(
        clientEntries.reduce((acc, entry) => {
          Object.entries(entry.subjectHours).forEach(([subject, hours]) => {
            acc[subject] = (acc[subject] || 0) + hours;
          });
          return acc;
        }, {} as Record<string, number>)
      ).map(([subject, hours], index) => ({
        name: subject,
        hours,
        color: COLORS.blue[index % COLORS.blue.length]
      }));
    }
  };

  const clientStats = clients.map(client => {
    const clientEntries = filteredEntries.filter(entry => entry.clientId === client.id);
    const hours = clientEntries.reduce((sum, entry) => 
      sum + Object.values(entry.subjectHours).reduce((acc, h) => acc + h, 0),
      0
    );
    return { id: client.id, name: client.name, hours };
  }).filter(stat => stat.hours > 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FF881B] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#252C36]">Hello jeune mineur !</h1>

      <div className="flex justify-between items-center">
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <button
          onClick={() => navigate('/time-entries/new')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          <span>Nouvelle saisie</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard
          title="Total des heures"
          value={`${calculateTotalHours(filteredEntries)}h`}
          Icon={Clock}
          gradient="bg-gradient-to-r from-[#FF881B] to-[#FFB01B]"
        />
        <StatCard
          title="Sujet principal"
          value={getMostCommonSubject(filteredEntries)}
          Icon={Target}
          gradient="bg-gradient-to-r from-[#389BA9] to-[#2B7A8C]"
        />
        <StatCard
          title="Client principal"
          value={getMostTimeConsumingClient(filteredEntries, getClientName)}
          Icon={Building2}
          gradient="bg-gradient-to-r from-[#252C36] to-[#363D47]"
        />
      </div>

      <GlobalTimeDistribution
        viewMode={globalViewMode}
        data={getGlobalDistributionData(globalViewMode)}
        onToggleViewMode={() => setGlobalViewMode(prev => 
          prev === 'employee' ? 'subject' : 'employee'
        )}
      />

      {clientStats.length > 0 && (
        <div className="grid gap-6">
          {clientStats.map((client) => (
            <ClientChart
              key={client.id}
              clientName={client.name}
              viewMode={viewMode[client.id] || 'employee'}
              data={getClientDetails(client.id, viewMode[client.id] || 'employee')}
              onToggleViewMode={() => setViewMode(prev => ({
                ...prev,
                [client.id]: prev[client.id] === 'employee' ? 'subject' : 'employee'
              }))}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <EmployeeCalendar
            key={employee.id}
            employee={employee}
            timeEntries={timeEntries}
            startDate={startDate}
            endDate={endDate}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;