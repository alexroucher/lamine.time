import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import confetti from 'react-canvas-confetti';
import { format } from 'date-fns';
import { X, Check } from 'lucide-react';
import { addDocument, updateDocument, COLLECTIONS } from '../../lib/firebase';
import type { TimeEntry, Employee, Client } from '../../types';
import { SUBJECTS } from '../../types';

interface TimeEntryFormProps {
  timeEntry?: TimeEntry;
  employees: Employee[];
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  timeEntry,
  employees,
  clients,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    date: timeEntry?.date || format(new Date(), 'yyyy-MM-dd'),
    employeeId: timeEntry?.employeeId || '',
    clientId: timeEntry?.clientId || '',
    subject: timeEntry?.subject || [],
    hours: timeEntry?.hours || 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.hours <= 0) {
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
    if (formData.subject.length === 0) {
      toast.error('Veuillez sélectionner au moins un sujet');
      return;
    }

    setLoading(true);
    try {
      if (timeEntry?.id) {
        await updateDocument(COLLECTIONS.TIME_ENTRIES, timeEntry.id, formData);
      } else {
        await addDocument(COLLECTIONS.TIME_ENTRIES, formData);
      }
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success(timeEntry ? 'Temps modifié avec succès !' : 'Temps ajouté avec succès !');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = useCallback((subject: string) => {
    setFormData(prev => ({
      ...prev,
      subject: prev.subject.includes(subject)
        ? prev.subject.filter(s => s !== subject)
        : [...prev.subject, subject]
    }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {timeEntry ? 'Modifier une saisie' : 'Nouvelle saisie'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
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
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-teal-200'
                    }`}
                    disabled={loading}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.title}</p>
                      </div>
                      {formData.employeeId === employee.id && (
                        <Check className="h-5 w-5 text-teal-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
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
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-teal-200'
                    }`}
                    disabled={loading}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{client.name}</p>
                      {formData.clientId === client.id && (
                        <Check className="h-5 w-5 text-teal-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sujets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => handleSubjectToggle(subject)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.subject.includes(subject)
                        ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={loading}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                Heures
              </label>
              <input
                type="number"
                id="hours"
                min="0.5"
                step="0.5"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: parseFloat(e.target.value) }))}
                className="input"
                required
                disabled={loading}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
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
                ) : timeEntry ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TimeEntryForm;