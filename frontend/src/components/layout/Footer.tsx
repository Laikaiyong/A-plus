'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0 flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mr-2">
            <span className="text-white font-bold text-sm">A+</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Aplus Learning Platform. All rights reserved.
          </span>
        </div>
        
        <div className="flex space-x-6">
          <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            Help Center
          </a>
          <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;