
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
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 hover:bg-accent rounded-lg transition-colors"
              >
                <div className="space-y-2 flex-1 pr-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.brand && (
                        <p className="text-xs text-muted-foreground">by {item.brand}</p>
                      )}
                    </div>
                    {item.unit_price && (
                      <Badge variant="secondary" className="ml-2">
                        ${item.unit_price.toFixed(2)}
                      </Badge>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {item.dietary_info?.diet_types?.map((diet) => (
                      <Badge key={diet} variant="outline" className="text-xs">
                        {diet}
                      </Badge>
                    ))}
                    {Object.entries(item.dietary_info || {})
                      .filter(([key, value]) => 
                        ['kosher', 'halal', 'vegan', 'vegetarian', 'gluten_free', 'dairy_free'].includes(key) && value
                      )
                      .map(([key]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key.replace('_', ' ')}
                        </Badge>
                      ))
                    }
                  </div>

                  {item.allergen_warnings && item.allergen_warnings.length > 0 && (
                    <div className="text-xs text-destructive">
                      Contains: {item.allergen_warnings.join(', ')}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    {item.dietary_info?.calories && (
                      <p>{item.dietary_info.calories} calories</p>
                    )}
                    {item.serving_size && (
                      <p>Serving size: {item.serving_size}</p>
                    )}
                  </div>
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
