import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import confetti from 'react-canvas-confetti';
import { addDocument, updateDocument, COLLECTIONS } from '../../lib/firebase';
import type { Employee } from '../../types';

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess: () => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    title: employee?.title || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim()) {
      toast.error('Tous les champs sont requis');
      return;
    }

    setLoading(true);
    try {
      if (employee?.id) {
        await updateDocument(COLLECTIONS.EMPLOYEES, employee.id, formData);
      } else {
        await addDocument(COLLECTIONS.EMPLOYEES, formData);
      }
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success(employee ? 'Employé modifié avec succès !' : 'Employé ajouté avec succès !');
      onSuccess();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nom complet
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="input"
          required
          placeholder="Jean Dupont"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Titre / Fonction
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="input"
          required
          placeholder="Consultant RH"
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
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
          ) : employee ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;