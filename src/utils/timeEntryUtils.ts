import type { TimeEntry } from '../types';

export const calculateTotalHours = (entries: TimeEntry[]): number => {
  return entries.reduce((sum, entry) => {
    const totalHours = Object.values(entry.subjectHours).reduce((acc, hours) => acc + hours, 0);
    return sum + totalHours;
  }, 0);
};

export const getMostCommonSubject = (entries: TimeEntry[]): string => {
  const subjectHours = entries.reduce((acc, entry) => {
    Object.entries(entry.subjectHours).forEach(([subject, hours]) => {
      acc[subject] = (acc[subject] || 0) + hours;
    });
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(subjectHours)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Aucun';
};

export const getMostTimeConsumingClient = (
  entries: TimeEntry[],
  getClientName: (id: string) => string
): string => {
  const clientHours = entries.reduce((acc, entry) => {
    const totalHours = Object.values(entry.subjectHours).reduce((sum, hours) => sum + hours, 0);
    acc[entry.clientId] = (acc[entry.clientId] || 0) + totalHours;
    return acc;
  }, {} as Record<string, number>);

  const topClientId = Object.entries(clientHours)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  return topClientId ? getClientName(topClientId) : 'Aucun';
};