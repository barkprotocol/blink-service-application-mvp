'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CTA() {
  return (
    <section id="cta" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="font-inter text-3xl sm:text-4xl font-bold mb-6 text-foreground leading-tight">
                Unleash the Power of Blockchain with BARK
              </h2>
              <p className="mb-8 max-w-4xl mx-auto text-base sm:text-lg leading-relaxed text-muted-foreground">
                Dive into a world of limitless possibilities! With BARK, you can create, trade, send gifts, and manage your unique Blinks (Blockchain Links) on the Solana blockchain. Connect with like-minded creators, embrace cutting-edge innovation, and experience a vibrant ecosystem where digital ownership becomes seamless and rewarding.
              </p>
              <Link href="/get-started" passHref>
                <Button size="lg" className="font-semibold shadow-md hover:shadow-lg transition-shadow duration-300">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

