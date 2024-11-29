import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Building2, Pencil, Trash2, Building } from 'lucide-react';
import { getAllDocuments, deleteDocument, COLLECTIONS } from '../lib/firebase';
import type { Client } from '../types';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const data = await getAllDocuments(COLLECTIONS.CLIENTS);
      setClients(data as Client[]);
    } catch (error) {
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await deleteDocument(COLLECTIONS.CLIENTS, id);
        toast.success('Client supprimé avec succès');
        fetchClients();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building className="h-6 w-6 text-[#FF881B]" />
          Gestion des Clients
        </h1>
        <button
          onClick={() => navigate('/clients/new')}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Building2 className="h-4 w-4" />
          <span>Ajouter un client</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FF881B] border-t-transparent" />
        </div>
      ) : clients.length > 0 ? (
        <div className="grid gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="card hover:shadow-lg transition-shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{client.name}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/clients/${client.id}/edit`)}
                  className="p-2 text-gray-600 hover:text-[#FF881B] hover:bg-[#FF881B]/10 rounded-full transition-colors"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucun client enregistré</p>
        </div>
      )}
    </div>
  );
};

export default Clients;