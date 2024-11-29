import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import confetti from 'react-canvas-confetti';
import { format } from 'date-fns';
import { X, Check, Plus } from 'lucide-react';
import { addDocument, updateDocument, COLLECTIONS } from '../../lib/firebase';
import type { TimeEntry, Employee, Client } from '../../types';
import { SUBJECTS } from '../../types';

const QUICK_HOURS = [0.5, 1, 2, 3, 4];

interface TimeEntryModalProps {
  timeEntry?: TimeEntry;
  employees: Employee[];
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
}

const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
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
    subjectHours: timeEntry?.subjectHours || SUBJECTS.reduce((acc, subject) => ({ ...acc, [subject]: 0 }), {})
  });
  const [loading, setLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    timeEntry ? Object.entries(timeEntry.subjectHours).filter(([_, hours]) => hours > 0).map(([subject]) => subject) : []
  );

  useEffect(() => {
    return () => {
      setLoading(false);
      setSelectedSubjects([]);
    };
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
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    }
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );

    // Si le sujet n'était pas sélectionné, initialiser ses heures à 0
    if (!selectedSubjects.includes(subject)) {
      setFormData(prev => ({
        ...prev,
        subjectHours: {
          ...prev.subjectHours,
          [subject]: 0
        }
      }));
    }
  };

  const addHours = (e: React.MouseEvent, subject: string, hours: number) => {
    e.stopPropagation(); // Empêcher la propagation du clic
    setFormData(prev => ({
      ...prev,
      subjectHours: {
        ...prev.subjectHours,
        [subject]: (prev.subjectHours[subject] || 0) + hours
      }
    }));
  };

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
                        ? 'border-[#FF881B] bg-[#FF881B]/10 text-[#FF881B]'
                        : 'border-gray-200 hover:border-[#FF881B]/50'
                    }`}
                    disabled={loading}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.title}</p>
                      </div>
                      {formData.employeeId === employee.id && (
                        <Check className="h-5 w-5 text-[#FF881B]" />
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
                        ? 'border-[#FF881B] bg-[#FF881B]/10 text-[#FF881B]'
                        : 'border-gray-200 hover:border-[#FF881B]/50'
                    }`}
                    disabled={loading}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{client.name}</p>
                      {formData.clientId === client.id && (
                        <Check className="h-5 w-5 text-[#FF881B]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
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
                            onClick={(e) => addHours(e, subject, hours)}
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

export default TimeEntryModal;