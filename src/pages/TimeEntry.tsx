import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Clock, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAllDocuments, deleteDocument, COLLECTIONS } from '../lib/firebase';
import type { TimeEntry, Employee, Client } from '../types';
import TimeEntryModal from '../components/time-entry/TimeEntryModal';

const TimeEntryPage = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [entriesData, employeesData, clientsData] = await Promise.all([
        getAllDocuments(COLLECTIONS.TIME_ENTRIES),
        getAllDocuments(COLLECTIONS.EMPLOYEES),
        getAllDocuments(COLLECTIONS.CLIENTS)
      ]);
      
      setTimeEntries(entriesData as TimeEntry[]);
      setEmployees(employeesData as Employee[]);
      setClients(clientsData as Client[]);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleEdit = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setSelectedEntry(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    setShowModal(false);
    setSelectedEntry(null);
    fetchData();
  }, [fetchData]);

  const getEmployeeName = useCallback((id: string) => {
    return employees.find(e => e.id === id)?.name || 'Inconnu';
  }, [employees]);

  const getClientName = useCallback((id: string) => {
    return clients.find(c => c.id === id)?.name || 'Inconnu';
  }, [clients]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="h-6 w-6 text-teal-600" />
          Saisie du Temps
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Clock className="h-4 w-4" />
          <span>Nouvelle saisie</span>
        </button>
      </div>

      {showModal && (
        <TimeEntryModal
          timeEntry={selectedEntry || undefined}
          employees={employees}
          clients={clients}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent" />
        </div>
      ) : timeEntries.length > 0 ? (
        <div className="grid gap-4">
          {timeEntries.map((entry) => (
            <div
              key={entry.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-teal-600">
                      {format(new Date(entry.date), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm font-medium text-gray-600">
                      {entry.hours}h
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {getEmployeeName(entry.employeeId)}
                  </h3>
                  <p className="text-gray-600">
                    Client : {getClientName(entry.clientId)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {entry.subject.map((subject) => (
                      <span
                        key={subject}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
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
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucun enregistrement de temps</p>
        </div>
      )}
    </div>
  );
};

export default TimeEntryPage;