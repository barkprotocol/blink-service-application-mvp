import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressCardProps {
  progress: number
  steps: string[]
}

export function ProgressCard({ progress, steps }: ProgressCardProps) {
  return (
    <Card className="bg-background shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
          {steps.map((step, index) => (
            <div 
              key={step} 
              className={`p-3 rounded-lg transition-all duration-300 ${
                index <= progress / 20 - 1 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              <div className="font-semibold">{`Step ${index + 1}`}</div>
              <div className="text-sm">{step}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

