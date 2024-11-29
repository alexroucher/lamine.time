export interface Employee {
  id: string;
  name: string;
  title: string;
}

export interface Client {
  id: string;
  name: string;
}

export interface TimeEntry {
  id?: string;
  date: string;
  employeeId: string;
  clientId: string;
  subjectHours: Record<string, number>; // Format: { sujet: heures }
}

export const SUBJECTS = [
  'Recrutement',
  'Administratif',
  'Développement des compétences',
  'Juridique et social',
  'Marque employeur',
  'HSE',
  'Formation',
  'Prospection'
] as const;

export type Subject = typeof SUBJECTS[number];