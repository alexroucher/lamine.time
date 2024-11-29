import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Clock, ArrowLeft } from 'lucide-react';
import { addDocument, getAllDocuments, COLLECTIONS } from '../lib/firebase';
import type { Employee, Client } from '../types';
import { SUBJECTS } from '../types';

const QUICK_HOURS = [0.5, 1, 2, 3, 4];

const TimeEntryForm = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    employeeId: '',
    clientId: '',
    subjectHours: SUBJECTS.reduce((acc, subject) => ({ ...acc, [subject]: 0 }), {})
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesData, clientsData] = await Promise.all([
          getAllDocuments(COLLECTIONS.EMPLOYEES),
          getAllDocuments(COLLECTIONS.CLIENTS)
        ]);
        setEmployees(employeesData as Employee[]);
        setClients(clientsData as Client[]);
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalHours = Object.values(formData.subjectHours).reduce((sum, h) => sum + h, 0);
    
    if (totalHours <= 0) {
      toast.error('Le nombre d\'heures doit être supérieur à 0');
      return;
    }
    if (!formData.employeeId) {
      toast.error('Veuillez sélectionner un salarié');
      return;
    }
    if (!formData.clientId) {
      toast.error('Veuillez sélectionner un client');
      return;
    }

    setLoading(true);
    try {
      await addDocument(COLLECTIONS.TIME_ENTRIES, formData);
      toast.success('Temps ajouté avec succès !');
      navigate('/time-entries');
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const addHours = (subject: string, hours: number) => {
    setFormData(prev => ({
      ...prev,
      subjectHours: {
        ...prev.subjectHours,
        [subject]: (prev.subjectHours[subject] || 0) + hours
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/time-entries')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="h-6 w-6 text-[#FF881B]" />
          Nouvelle saisie de temps
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salarié
            </label>
            <div className="grid grid-cols-2 gap-3">
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, employeeId: employee.id }))}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.employeeId === employee.id
                      ? 'border-[#FF881B] bg-[#FF881B]/10 text-[#FF881B]'
                      : 'border-gray-200 hover:border-[#FF881B]/50'
                  }`}
                  disabled={loading}
                >
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <div className="grid grid-cols-2 gap-3">
              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, clientId: client.id }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.clientId === client.id
                      ? 'border-[#FF881B] bg-[#FF881B]/10 text-[#FF881B]'
                      : 'border-gray-200 hover:border-[#FF881B]/50'
                  }`}
                  disabled={loading}
                >
                  <p className="font-medium">{client.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sujets et temps passé
            </label>
            <div className="grid grid-cols-2 gap-4">
              {SUBJECTS.map((subject) => (
                <div
                  key={subject}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSubjects.includes(subject)
                      ? 'border-[#389BA9] bg-[#389BA9]/5'
                      : 'border-gray-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className="w-full text-left font-medium mb-2"
                  >
                    {subject}
                    {formData.subjectHours[subject] > 0 && (
                      <span className="ml-2 text-[#389BA9]">
                        ({formData.subjectHours[subject]}h)
                      </span>
                    )}
                  </button>
                  
                  {selectedSubjects.includes(subject) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {QUICK_HOURS.map((hours) => (
                        <button
                          key={hours}
                          type="button"
                          onClick={() => addHours(subject, hours)}
                          className="px-2 py-1 text-sm rounded bg-[#389BA9]/10 text-[#389BA9] hover:bg-[#389BA9]/20 transition-colors"
                        >
                          +{hours}h
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/time-entries')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Enregistrement...
              </div>
            ) : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeEntryForm;