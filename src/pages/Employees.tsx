import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus, Pencil, Trash2, Users } from 'lucide-react';
import { getAllDocuments, deleteDocument, COLLECTIONS } from '../lib/firebase';
import type { Employee } from '../types';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const data = await getAllDocuments(COLLECTIONS.EMPLOYEES);
      setEmployees(data as Employee[]);
    } catch (error) {
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await deleteDocument(COLLECTIONS.EMPLOYEES, id);
        toast.success('Employé supprimé avec succès');
        fetchEmployees();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-6 w-6 text-[#FF881B]" />
          Gestion des Salariés
        </h1>
        <button
          onClick={() => navigate('/employees/new')}
          className="btn btn-primary flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Ajouter un salarié</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FF881B] border-t-transparent" />
        </div>
      ) : employees.length > 0 ? (
        <div className="grid gap-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="card hover:shadow-lg transition-shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{employee.name}</h3>
                <p className="text-gray-600">{employee.title}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/employees/${employee.id}/edit`)}
                  className="p-2 text-gray-600 hover:text-[#FF881B] hover:bg-[#FF881B]/10 rounded-full transition-colors"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
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
          <p className="text-gray-600">Aucun salarié enregistré</p>
        </div>
      )}
    </div>
  );
};

export default Employees;