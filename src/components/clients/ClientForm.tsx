import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import confetti from 'react-canvas-confetti';
import { addDocument, updateDocument, COLLECTIONS } from '../../lib/firebase';
import type { Client } from '../../types';

interface ClientFormProps {
  client?: Client;
  onSuccess: () => void;
  onCancel: () => void;
  onUpdate: () => Promise<void>;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess, onCancel, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: client?.name || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Le nom du client est requis');
      return;
    }

    setLoading(true);
    try {
      if (client?.id) {
        await updateDocument(COLLECTIONS.CLIENTS, client.id, formData);
      } else {
        await addDocument(COLLECTIONS.CLIENTS, formData);
      }
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success(client ? 'Client modifié avec succès !' : 'Client ajouté avec succès !');
      await onUpdate();
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
          Nom du client
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="input"
          required
          placeholder="Nom de l'entreprise"
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
          ) : client ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;