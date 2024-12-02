'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Sparkles, Coins, Gift } from 'lucide-react';

interface HowItWorksStepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function HowItWorksStep({ number, title, description, icon }: HowItWorksStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="transition-all duration-300 transform hover:scale-105 flex flex-col h-full relative overflow-hidden group bg-white dark:bg-gray-800 border-primary/20 shadow-lg">
        <div className="absolute top-0 left-0 w-40 h-40 opacity-5 transform -translate-x-1/4 -translate-y-1/4 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 duration-300 text-primary">
          {React.cloneElement(icon as React.ReactElement, { className: "w-full h-full" })}
        </div>
        <CardHeader className="text-center pb-2 relative z-10">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center font-bold mb-3 transform transition-transform group-hover:scale-110 duration-300 bg-primary/10 text-primary shadow-md">
            <span className="text-2xl">{number}</span>
          </div>
          <CardTitle className="font-inter text-xl font-semibold mb-2 text-foreground dark:text-gray-100">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center flex-grow relative z-10">
          <div className="mb-4">
            {React.cloneElement(icon as React.ReactElement, { className: "w-10 h-10 mx-auto transform transition-transform group-hover:rotate-12 duration-300 text-primary" })}
          </div>
          <p className="font-poppins text-sm text-muted-foreground dark:text-gray-300">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function HowItWorks() {
  const howItWorksSteps: HowItWorksStepProps[] = [
    {
      number: 1,
      title: "Connect Your Wallet",
      description: "Link your Solana wallet to BARK BLINK to get started and access all features securely.",
      icon: <Wallet />,
    },
    {
      number: 2,
      title: "Create Your Blink",
      description: "Use our intuitive interface to create and customize your Solana Blink with unique attributes.",
      icon: <Sparkles />,
    },
    {
      number: 3,
      title: "Share or Trade",
      description: "Send your Blink to friends or trade it on supported marketplaces to grow your collection.",
      icon: <Coins />,
    },
    {
      number: 4,
      title: "Manage Collection",
      description: "Track and manage your Blinks in your personal Blinkboard, monitoring value and activity.",
      icon: <Gift />,
    }
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-inter text-4xl sm:text-5xl font-bold mb-6 text-center text-foreground dark:text-gray-100">How It Works</h2>
          <p className="text-center mb-16 max-w-2xl mx-auto text-lg text-muted-foreground dark:text-gray-300">
            Get started with BARK BLINK in just a few simple steps. Our intuitive platform makes it easy to create, manage, and trade your digital assets on the Solana blockchain.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorksSteps.map((step, index) => (
            <HowItWorksStep key={index} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
