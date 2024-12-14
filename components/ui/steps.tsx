import React from 'react'
import { motion } from 'framer-motion'

interface Step {
  title: string
  description: string
}

interface StepsProps {
  items: Step[]
}

export function Steps({ items }: StepsProps) {
  return (
    <ol className="relative border-l border-gray-200 dark:border-gray-700">
      {items.map((item, index) => (
        <motion.li
          key={index}
          className="mb-10 ml-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-primary-600">
            <span className="sr-only">Step {index + 1}</span>
            <span className="text-white font-medium">{index + 1}</span>
          </span>
          <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
            {item.title}
          </h3>
          <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
            {item.description}
          </p>
        </motion.li>
      ))}
    </ol>
  )
}

