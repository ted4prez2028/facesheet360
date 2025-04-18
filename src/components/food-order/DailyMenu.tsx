
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, ShoppingCart } from "lucide-react";
import { exportToPdf } from '@/utils/exportUtils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

const menuItems = [
  {
    id: "breakfast",
    name: "Breakfast",
    items: [
      { name: "Ham Slice", description: "Seasonal Fruit Cup" },
      { name: "Banana Pancakes", description: "Hot or Cold Cereal" },
    ]
  },
  {
    id: "lunch",
    name: "Lunch",
    items: [
      { name: "Roast Turkey Breast", description: "Oven Roasted" },
      { name: "Snickerdoodle Cookie", description: "Choice of Beverage" },
      { name: "Broccoli and Cauliflower", description: "Roll with Margarine" },
    ]
  },
  {
    id: "dinner",
    name: "Dinner",
    items: [
      { name: "Dutch Apple Pie", description: "Milk 2%" },
      { name: "Crispy Chicken Tenders", description: "Brown Gravy" },
      { name: "Garlic Mashed Potatoes", description: "Dinner Roll & Butter" },
    ]
  },
  {
    id: "snack",
    name: "HS Snack",
    items: [
      { name: "Snack Juice", description: "Choice of snack" },
    ]
  }
];

export function DailyMenu() {
  const navigate = useNavigate();
  const menuDate = "April 20, 2023";

  const handleExportPdf = () => {
    const flattenedMenu = menuItems.flatMap(category => 
      category.items.map(item => ({
        category: category.name,
        item: item.name,
        description: item.description
      }))
    );
    
    exportToPdf(`Menu for ${menuDate}`, flattenedMenu);
  };

  const handleOrderFood = () => {
    navigate('/food-order');
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Today's Menu - {menuDate}</CardTitle>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleExportPdf}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={handleOrderFood}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Order Food
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {menuItems.map((category) => (
            <div key={category.id} className="space-y-2">
              <h3 className="text-lg font-semibold border-b pb-2">{category.name}</h3>
              <div className="grid gap-2">
                {category.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-2 hover:bg-accent rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
