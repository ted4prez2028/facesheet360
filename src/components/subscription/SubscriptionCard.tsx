
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  title: string;
  role: 'doctor' | 'nurse' | 'therapist' | 'cna';
  price: number;
  features: string[];
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
  isSelected: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  plan, 
  onSelect, 
  isSelected 
}) => {
  return (
    <Card className={`border-2 ${isSelected ? 'border-primary' : 'border-border'}`}>
      <CardHeader>
        <CardTitle className="text-xl">{plan.title}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground"> /month</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onSelect(plan)} 
          className="w-full"
          variant={isSelected ? "default" : "outline"}
        >
          {isSelected ? "Selected" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCard;
