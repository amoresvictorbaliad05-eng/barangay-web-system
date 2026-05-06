export type IncidentType = 'Emergency' | 'Infrastructure' | 'Disturbance' | 'Environmental' | 'Health' | 'Other';

export type ReportStatus = 'pending' | 'verifying' | 'investigating' | 'resolving' | 'resolved' | 'archived';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface IncidentReport {
  id: string;
  type: IncidentType;
  description: string;
  location: string;
  reporterName?: string;
  reporterContact?: string;
  isAnonymous: boolean;
  status: ReportStatus;
  priority: Priority;
  evidenceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
