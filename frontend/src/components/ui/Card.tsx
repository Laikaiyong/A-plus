'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children }) => {
  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;