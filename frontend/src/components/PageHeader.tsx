import React from 'react';
import { VantaGlobe } from './3d/VantaGlobe';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      
      {/* 1. The Global Animation */}
      <VantaGlobe />

      {/* 2. Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title: Dark Blue (visible on white globe) */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-950 tracking-tight mb-4 drop-shadow-sm">
            {title}
          </h1>
          
          {/* Subtitle: Slate Gray */}
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>
      </div>

      {/* 3. Bottom Fade (Optional: blends header into the page content) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-10" />
    </div>
  );
};

export default PageHeader;