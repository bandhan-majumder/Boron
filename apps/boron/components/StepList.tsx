"use client";

import { Step } from "../types";
import { CheckCircle, Circle, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Progress } from "./index";
import { Button } from "./index";
import { Badge } from "./index";
import { ScrollArea } from "./index";
import { cn } from "./index";
import { useEffect } from "react";

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onSelectStep: (stepId: number) => void;
}

export default function StepsList({
  steps,
  currentStep,
  onSelectStep,
}: StepsListProps) {
  let progress = null;
  const completedSteps = steps.filter(
    (step) => step.status === "completed",
  ).length;
  const totalSteps = steps.length;

  useEffect(() => {
    progress = (completedSteps / totalSteps) * 100;
  }, [completedSteps, totalSteps]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          >
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card className="h-auto flex flex-col bg-[#1C1C1C] border-gray-700 shadow-2xl border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            Build Steps
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          </CardTitle>
          <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
            {completedSteps}/{totalSteps}
          </Badge>
        </div>
        <div className="w-full bg-white rounded-full h-2 mt-2">
          <Progress value={progress} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full w-auto rounded-md">
          <div className="p-4 space-y-2">
            {steps.map((step, index) => (
              <Button
                key={step.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start p-4 h-auto text-left transition-all duration-200 group relative overflow-hidden",
                  currentStep === step.id
                    ? "shadow-lg text-white"
                    : "hover:bg-slate-800/50 text-slate-300 hover:text-white",
                )}
                onClick={() => onSelectStep(step.id)}
              >
                {/* Background shimmer effect for current step */}
                {currentStep === step.id && (
                  <div className="absolute inset-0" />
                )}

                <div className="flex items-center gap-3 w-full relative z-10">
                  <div className="flex-shrink-0">
                    {getStatusIcon(step.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {step.title}
                      </h3>
                      {getStatusBadge(step.status)}
                    </div>

                    {step.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {step.description}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Step number indicator */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm shadow-amber-400/50" />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
