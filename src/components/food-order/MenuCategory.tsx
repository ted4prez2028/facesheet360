
import React from 'react';
import { Button } from "@/components/ui/button";
import { MenuItem } from '@/types/foodOrder';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Leaf, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
        <CardDescription>
          {items.filter(item => item.is_available).length} items available
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 hover:bg-accent rounded-lg transition-colors"
              >
                <div className="space-y-2 flex-1 pr-4">
                  <div className="flex items-start gap-4">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
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
                            {item.unit_size && <span className="ml-1">/ {item.unit_size}</span>}
                          </Badge>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1 mt-2">
                        {/* Dietary badges */}
                        {item.dietary_info?.diet_types?.map((diet) => (
                          <Badge key={diet} variant="outline" className="text-xs">
                            {diet}
                          </Badge>
                        ))}
                        {/* Special dietary indicators */}
                        {Object.entries(item.dietary_info || {})
                          .filter(([key, value]) => 
                            ['kosher', 'halal', 'vegan', 'vegetarian', 'gluten_free', 'dairy_free'].includes(key) && value
                          )
                          .map(([key]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              <Leaf className="w-3 h-3 mr-1" />
                              {key.replace('_', ' ')}
                            </Badge>
                          ))
                        }
                      </div>

                      {/* Allergen warnings */}
                      {item.allergen_warnings && item.allergen_warnings.length > 0 && (
                        <div className="flex items-center mt-2 text-xs text-destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Contains: {item.allergen_warnings.join(', ')}
                        </div>
                      )}

                      {/* Nutrition Info Hover Card */}
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 px-2 mt-2">
                            <Info className="w-3 h-3 mr-1" />
                            Nutrition Info
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Nutritional Information</h4>
                            {item.serving_size && (
                              <p className="text-xs">Serving size: {item.serving_size}</p>
                            )}
                            {item.dietary_info?.calories && (
                              <p className="text-xs">Calories: {item.dietary_info.calories}</p>
                            )}
                            {item.dietary_info?.protein && (
                              <p className="text-xs">Protein: {item.dietary_info.protein}</p>
                            )}
                            {item.nutrition_facts && Object.entries(item.nutrition_facts).map(([key, value]) => (
                              <p key={key} className="text-xs">
                                {key.replace(/_/g, ' ')}: {value}
                              </p>
                            ))}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </div>

                  {/* Preparation instructions if available */}
                  {item.preparation_instructions && (
                    <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                      <strong>Preparation:</strong> {item.preparation_instructions}
                    </div>
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
