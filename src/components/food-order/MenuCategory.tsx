
import React from 'react';
import { Button } from "@/components/ui/button";
import { MenuItem } from '@/types/foodOrder';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MenuCategoryProps {
  category: string;
  items: MenuItem[];
  onAddItem: (item: MenuItem) => void;
}

export function MenuCategory({ category, items, onAddItem }: MenuCategoryProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{category}</CardTitle>
        <CardDescription>{items.length} items available</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-3 hover:bg-accent rounded-lg transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{item.name}</p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {item.dietary_info?.diet_types?.map((diet) => (
                      <Badge key={diet} variant="secondary" className="text-xs">
                        {diet}
                      </Badge>
                    ))}
                  </div>
                  {item.dietary_info?.calories && (
                    <p className="text-xs text-muted-foreground">
                      {item.dietary_info.calories} calories
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddItem(item)}
                  disabled={!item.is_available}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
