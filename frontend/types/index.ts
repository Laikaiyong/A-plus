// filepath: /dashboard/dashboard/src/types/index.ts
export interface StudySession {
    id: string;
    title: string;
    date: string;
    duration: number; // in minutes
    contentType: 'video' | 'text' | 'audio';
    completed: boolean;
  }
  
  export interface ProgressMetric {
    totalSessions: number;
    completedSessions: number;
    progressPercentage: number; // 0 to 100
  }
  
  export interface ContentPreview {
    id: string;
    title: string;
    summary: string;
    createdAt: string;
    contentType: 'video' | 'text' | 'audio';
  }
  
  export interface CalendarEvent {
    id: string;
    title: string;
    startDate: string; // ISO format
    endDate: string; // ISO format
    isUpcoming: boolean;
  }