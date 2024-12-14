"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";

export const InfoBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#F2E8D5] dark:bg-[#3D3D3D] border-b border-[#D0BFB4] dark:border-[#4A4A4A]"
        >
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex-1" />
            <p className="text-sm font-medium text-center text-[#4A4A4A] dark:text-[#F2E8D5] flex-1">
              🚧 This is a demo application and is currently under construction 🚧
            </p>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="text-[#8B7355] hover:text-[#6B5B3D] dark:text-[#F2E8D5] dark:hover:text-[#D0BFB4] transition-colors"
                aria-label="Close info bar"
              >
                <X size={18} />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};