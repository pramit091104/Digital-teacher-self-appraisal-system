
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "../lib/api";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  progress?: {
    current: number;
    max: number;
  }
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, progress }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{category.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Max Credits:</span>
              <span className="text-lg font-semibold ml-2">{category.maxCredits}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Per Document:</span>
              <span className="text-lg font-semibold ml-2">{category.perDocumentCredits}</span>
            </div>
          </div>

          {progress && (
            <div className="mt-auto">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{progress.current} / {progress.max} credits</span>
              </div>
              
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    progress.current >= progress.max ? 'bg-green-600' : 'bg-primary'
                  }`}
                  style={{ 
                    width: `${Math.min(Math.round((progress.current / progress.max) * 100), 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          onClick={() => navigate(`/category/${category.id}`)}
        >
          View Details <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};
