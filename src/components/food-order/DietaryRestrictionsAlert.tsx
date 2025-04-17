import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { DietaryRestrictions } from '@/types/foodOrder';

interface DietaryRestrictionsAlertProps {
  restrictions: DietaryRestrictions | null;
  selectedItems: Array<{
    menuItem: {
      name?: string;
      dietary_info?: {
        allergies: string[];
        diet_types: string[];
      };
    };
  }>;
}

export function DietaryRestrictionsAlert({ restrictions, selectedItems }: DietaryRestrictionsAlertProps) {
  if (!restrictions?.restrictions || selectedItems.length === 0) return null;

  const allergies = restrictions.restrictions.allergies || [];
  const dietTypes = restrictions.restrictions.diet_types || [];
  
  const conflicts = selectedItems.filter(item => {
    const itemAllergies = item.menuItem.dietary_info?.allergies || [];
    const itemDietTypes = item.menuItem.dietary_info?.diet_types || [];
    
    return allergies.some(allergy => itemAllergies.includes(allergy)) ||
           dietTypes.some(diet => !itemDietTypes.includes(diet));
  });

  if (conflicts.length === 0) return null;

  return (
    <Alert variant="destructive">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Dietary Restriction Warning</AlertTitle>
      <AlertDescription>
        Some selected items may conflict with the patient's dietary restrictions:
        <ul className="list-disc ml-4 mt-2">
          {conflicts.map((item, index) => (
            <li key={index}>{item.menuItem.name || 'Unnamed Item'}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
