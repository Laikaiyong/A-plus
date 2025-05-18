// Example custom hook you can add to a hooks folder
import { useState, useEffect } from 'react';

// Define types based on your database schema
export interface Plan {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  plan_id: number;
  title: string;
  content: string | null;
  metadata: any;
  created_at: string;
  summary: string | null;
  type: string | null;
  tag: string | null;
  image: string | null;
}

export interface Task {
  id: number;
  title: string;
  plan_id: number;
  start_time: string | null;
  start_date: string | null;
  duration: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface AllData {
  plans: Plan[];
  documents: Document[];
  tasks: Task[];
}

export function useAllData() {
  const [data, setData] = useState<AllData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/db/all');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err: unknown) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return { data, loading, error };
}