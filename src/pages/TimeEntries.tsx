import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Clock, Pencil, Trash2, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAllDocuments, deleteDocument, COLLECTIONS } from '../lib/firebase';
import type { TimeEntry, Employee, Client } from '../types';

const TimeEntries = () => {
  const navigate = useNavigate();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    employeeId: '',
    clientId: ''
  });

  const fetchData = async () => {
    try {
      const [entriesData, employeesData, clientsData] = await Promise.all([
        getAllDocuments(COLLECTIONS.TIME_ENTRIES),
        getAllDocuments(COLLECTIONS.EMPLOYEES),
        getAllDocuments(COLLECTIONS.CLIENTS)
      ]);
      
      const sortedEntries = (entriesData as TimeEntry[]).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setTimeEntries(sortedEntries);
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      try {
        await deleteDocument(COLLECTIONS.TIME_ENTRIES, id);
        toast.success('Enregistrement supprimé avec succès');
        fetchData();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleMultipleDelete = async () => {
    if (selectedEntries.length === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedEntries.length} enregistrement(s) ?`)) {
      try {
        await Promise.all(selectedEntries.map(id => deleteDocument(COLLECTIONS.TIME_ENTRIES, id)));
        toast.success(`${selectedEntries.length} enregistrement(s) supprimé(s) avec succès`);
        setSelectedEntries([]);
        fetchData();
      } catch (error) {
        toast.error('Erreur lors de la suppression multiple');
      }
    }
  };

  const toggleEntrySelection = (id: string) => {
    setSelectedEntries(prev => 
      prev.includes(id) ? prev.filter(entryId => entryId !== id) : [...prev, id]
    );
  };

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.name || 'Inconnu';
  };

  const getClientName = (id: string) => {
    return clients.find(c => c.id === id)?.name || 'Inconnu';
  };

  const filteredEntries = timeEntries.filter(entry => {
    if (filters.employeeId && entry.employeeId !== filters.employeeId) return false;
    if (filters.clientId && entry.clientId !== filters.clientId) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-[#FF881B]" />
          <h1 className="text-2xl font-bold text-gray-800">Liste des temps saisis</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
              className="select"
            >
              <option value="">Tous les salariés</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>

            <select
              value={filters.clientId}
              onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value }))}
              className="select"
            >
              <option value="">Tous les clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {selectedEntries.length > 0 && (
              <button
                onClick={handleMultipleDelete}
                className="btn btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer ({selectedEntries.length})</span>
              </button>
            )}

            <button
              onClick={() => navigate('/time-entries/new')}
              className="btn btn-primary flex items-center gap-2 w-full md:w-auto"
            >
              <Clock className="h-4 w-4" />
              <span>Nouvelle saisie</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FF881B] border-t-transparent" />
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => {
            const totalHours = Object.values(entry.subjectHours).reduce((sum, h) => sum + h, 0);
            
            return (
              <div
                key={entry.id}
                className={`card hover:shadow-lg transition-shadow ${
                  selectedEntries.includes(entry.id!) ? 'ring-2 ring-[#FF881B] bg-[#FF881B]/5' : ''
                }`}
                onClick={() => toggleEntrySelection(entry.id!)}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-[#FF881B]">
                        {format(new Date(entry.date), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm font-medium text-gray-600">
                        {totalHours}h
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {getEmployeeName(entry.employeeId)}
                    </h3>
                    <p className="text-gray-600">
                      Client : {getClientName(entry.clientId)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(entry.subjectHours)
                        .filter(([_, hours]) => hours > 0)
                        .map(([subject, hours]) => (
                          <span
                            key={subject}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#389BA9]/10 text-[#389BA9]"
                          >
                            {subject} ({hours}h)
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/time-entries/${entry.id}/edit`)}
                      className="p-2 text-gray-600 hover:text-[#FF881B] hover:bg-[#FF881B]/10 rounded-full transition-colors"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id!)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {filters.employeeId || filters.clientId 
              ? 'Aucun enregistrement ne correspond aux filtres sélectionnés'
              : 'Aucun enregistrement de temps'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeEntries;