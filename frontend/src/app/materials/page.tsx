'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LuSearch, LuFilter, LuPlus, LuFileText, LuUpload, 
  LuLink, LuBook, LuBookmark, LuCircleCheck, LuX,
  LuCalendar, LuSquareCheck
} from 'react-icons/lu';
import { useAllData } from '../../hooks/useAllData'; // Import the custom hook

// Material type definitions
type MaterialSource = 'ai' | 'uploaded' | 'website' | 'resource' | 'document' | 'task';

interface Material {
  id: string;
  title: string;
  description: string;
  type: MaterialSource;
  dateAdded: string;
  thumbnail?: string;
  url?: string;
  completed: boolean;
  tags: string[];
  planId?: number;
}

export default function LearningMaterialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MaterialSource | 'all'>('all');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Fetch data using the custom hook
  const { data, loading, error } = useAllData();

  // Process data when it's loaded
  useEffect(() => {
    if (data) {
      // Transform documents to materials
      const documentMaterials = data.documents.map(doc => ({
        id: `doc-${doc.id}`,
        title: doc.title,
        description: doc.summary || doc.content?.substring(0, 150) || 'No description available',
        type: (doc.type?.toLowerCase() === 'ai' ? 'ai' : 
               doc.type?.toLowerCase() === 'website' ? 'website' : 
               doc.type?.toLowerCase() === 'resource' ? 'resource' : 'document') as MaterialSource,
        dateAdded: doc.created_at,
        thumbnail: doc.image || undefined,
        url: doc.metadata?.url || undefined,
        completed: false,
        tags: [doc.tag || 'Document'].filter(Boolean),
        planId: doc.plan_id
      }));

      // Transform tasks to materials
      // const taskMaterials = data.tasks.map(task => ({
      //   id: `task-${task.id}`,
      //   title: task.title,
      //   description: `${task.start_date ? `Date: ${task.start_date}` : ''} ${task.start_time ? `Time: ${task.start_time}` : ''} ${task.duration ? `Duration: ${task.duration} min` : ''}`,
      //   type: 'task' as MaterialSource,
      //   dateAdded: task.created_at,
      //   completed: task.status === 'completed',
      //   tags: [task.status, `Plan ID: ${task.plan_id}`],
      //   planId: task.plan_id
      // }));

      // Combine with mock data and set materials
      setMaterials([...documentMaterials, ...mockMaterials]);
      setIsLoading(false);
    }
  }, [data]);

  // Set loading state based on the hook's loading state
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || material.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const toggleCompleted = (id: string) => {
    setMaterials(materials.map(material => 
      material.id === id ? {...material, completed: !material.completed} : material
    ));
  };

  // Error handling
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> Failed to load materials. Please try again later.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Learning Materials</h1>
        <p className="text-gray-600 dark:text-gray-300">Access all your learning resources in one place</p>
      </motion.div>

      {/* Search and actions bar */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-grow">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <LuFilter className="w-5 h-5" />
          <span className="hidden sm:inline">Filter</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md shadow-orange-200 dark:shadow-orange-900/20"
        >
          <LuPlus className="w-5 h-5" />
          <span>Add Material</span>
        </motion.button>
      </motion.div>

      {/* Material type tabs */}
      <motion.div 
        className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {[
          { id: 'all', label: 'All Materials', icon: <LuBook /> },
          { id: 'ai', label: 'AI Generated', icon: <LuFileText /> },
          { id: 'document', label: 'Documents', icon: <LuFileText /> },
          { id: 'uploaded', label: 'Uploaded', icon: <LuUpload /> },
          { id: 'website', label: 'Websites', icon: <LuLink /> },
          { id: 'resource', label: 'Resources', icon: <LuBookmark /> },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab.id as MaterialSource | 'all')}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors ${
              activeTab === tab.id 
                ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {React.cloneElement(tab.icon as React.ReactElement, { 
              className: "w-4 h-4" 
            })}
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Materials grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, staggerChildren: 0.1 }}
        >
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <MaterialCard 
                key={material.id}
                material={material}
                onToggleCompleted={toggleCompleted}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <LuSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No materials found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                Try adjusting your search or filter to find what you&apos;re looking for
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Add material modal */}
      {showAddModal && (
        <AddMaterialModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

// Material card component
const MaterialCard = ({ 
  material,
  onToggleCompleted 
}: { 
  material: Material,
  onToggleCompleted: (id: string) => void
}) => {
  const typeIcons = {
    ai: <LuFileText className="w-4 h-4 text-blue-500" />,
    uploaded: <LuUpload className="w-4 h-4 text-green-500" />,
    website: <LuLink className="w-4 h-4 text-purple-500" />,
    resource: <LuBookmark className="w-4 h-4 text-yellow-500" />,
    document: <LuFileText className="w-4 h-4 text-indigo-500" />,
    task: <LuSquareCheck className="w-4 h-4 text-red-500" />
  };

  const typeLabels = {
    ai: 'AI Generated',
    uploaded: 'Uploaded',
    website: 'Website',
    resource: 'Resource',
    document: 'Document',
    task: 'Task'
  };

  // Check if this is a database item or mock data
  const isDbItem = material.id.startsWith('doc-') || material.id.startsWith('task-');

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {material.thumbnail && (
        <div className="h-40 w-full overflow-hidden">
          <img 
            src={material.thumbnail} 
            alt={material.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {!material.thumbnail && material.type === 'task' && (
        <div className="h-24 w-full bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center">
          <LuCalendar className="w-12 h-12 text-red-400 dark:text-red-500" />
        </div>
      )}
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              {typeIcons[material.type]}
              <span className="ml-1">{typeLabels[material.type]}</span>
            </span>
            {material.planId && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                Plan: {material.planId}
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleCompleted(material.id)}
            className={`rounded-full p-1 ${
              material.completed 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            {material.completed ? (
              <LuCircleCheck className="w-5 h-5" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-current" />
            )}
          </motion.button>
        </div>
        
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
          {material.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
          {material.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {material.tags.map((tag) => (
            <span 
              key={tag} 
              className="inline-block px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Added creation date */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
          Added: {new Date(material.dateAdded).toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex items-stretch border-t border-gray-100 dark:border-gray-700 mt-auto">
        <button className="flex-1 p-3 text-center text-orange-600 dark:text-orange-400 font-medium border-r border-gray-100 dark:border-gray-700">
          View
        </button>
        {material.url && (
          <a 
            href={material.url}
            target="_blank"
            rel="noopener noreferrer" 
            className="flex-1 p-3 text-center text-gray-600 dark:text-gray-300 font-medium"
          >
            Open Link
          </a>
        )}
        {/* Different action for tasks */}
        {material.type === 'task' && (
          <button 
            className="flex-1 p-3 text-center text-gray-600 dark:text-gray-300 font-medium"
          >
            Update Status
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Add material modal component
const AddMaterialModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Learning Material</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LuX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <LuFileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Generate with AI</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Create new learning content using our AI assistant
              </p>
            </button>
            
            <button className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <LuUpload className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Upload Content</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Upload files from your device
              </p>
            </button>
            
            <button className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <LuLink className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Add Website Link</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Link to external websites with useful content
              </p>
            </button>
            
            <button className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <LuBookmark className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Add Resource</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Add reference materials and resources
              </p>
            </button>
            
            {/* Added new option for tasks */}
            <button className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <LuSquareCheck className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Create Task</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Add a new learning task with timeline
              </p>
            </button>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Mock data preserved for fallback/testing
const mockMaterials: Material[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    description: 'A comprehensive introduction to machine learning concepts, techniques, and applications.',
    type: 'ai',
    dateAdded: '2025-04-10',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    completed: false,
    tags: ['AI', 'Machine Learning', 'Data Science']
  },
  {
    id: '2',
    title: 'React Hooks Cheat Sheet',
    description: 'Quick reference guide for React hooks with examples and best practices.',
    type: 'uploaded',
    dateAdded: '2025-04-15',
    thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    completed: true,
    tags: ['React', 'JavaScript', 'Frontend']
  },
  {
    id: '3',
    title: 'CS50: Introduction to Computer Science',
    description: 'Harvard University\'s introduction to computer science course materials.',
    type: 'website',
    dateAdded: '2025-04-18',
    url: 'https://cs50.harvard.edu/',
    completed: false,
    tags: ['Computer Science', 'Programming', 'Course']
  },
  {
    id: '4',
    title: 'TypeScript Documentation',
    description: 'Official TypeScript documentation with guides and references.',
    type: 'resource',
    dateAdded: '2025-04-20',
    url: 'https://www.typescriptlang.org/docs/',
    completed: false,
    tags: ['TypeScript', 'JavaScript', 'Documentation']
  },
  {
    id: '5',
    title: 'Design System Fundamentals',
    description: 'Learn about creating and maintaining design systems for consistent user interfaces.',
    type: 'ai',
    dateAdded: '2025-04-22',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    completed: false,
    tags: ['Design', 'UI/UX', 'Frontend']
  },
  {
    id: '6',
    title: 'Database Optimization Techniques',
    description: 'Advanced strategies for optimizing database performance and queries.',
    type: 'uploaded',
    dateAdded: '2025-04-25',
    completed: true,
    tags: ['Database', 'SQL', 'Performance']
  }
];