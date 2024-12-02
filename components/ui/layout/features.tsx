import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, CreditCard, Gift, FileText, Heart, LinkIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <Card className="bg-card text-card-foreground dark:bg-card-dark dark:text-card-foreground-dark shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center text-xl font-semibold">
        {icon}
        <span className="ml-3">{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-muted-foreground dark:text-muted-foreground-dark">{description}</CardDescription>
    </CardContent>
  </Card>
);

const Features: React.FC = () => {
  const featuresList = [
    {
      title: "NFT Blinks",
      description: "Create, manage, and scale unique NFTs or Compressed NFTs on Solana effortlessly.",
      icon: <ImageIcon className="h-6 w-6 text-primary" />,
    },
    {
      title: "Send Payment Blink",
      description: "Facilitate payments effortlessly using Blinks and Solana blockchain.",
      icon: <CreditCard className="h-6 w-6 text-primary" />,
    },
    {
      title: "Gift Blink",
      description: "Send personalized digital gifts to your loved ones using Blinks.",
      icon: <Gift className="h-6 w-6 text-primary" />,
    },
    {
      title: "Memo Blink",
      description: "Share meaningful messages and notes on the blockchain.",
      icon: <FileText className="h-6 w-6 text-primary" />,
    },
    {
      title: "Donation Blink",
      description: "Make an impact by sending donations with transparent tracking.",
      icon: <Heart className="h-6 w-6 text-primary" />,
    },
    {
      title: "Referral Blink",
      description: "Promote your projects or initiatives with trackable referral links.",
      icon: <LinkIcon className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-4">Explore the Power of Blinks</h2>
        <p className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Discover six versatile Blink types that enable digital asset creation, payments, donations, and more—all on the Solana blockchain.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

