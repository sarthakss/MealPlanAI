"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Recipe } from "@/types/recipe";
import { recipeAPI } from "@/lib/api";

interface RecipeLibraryProps {
  onRecipeClick?: (recipe: Recipe) => void;
  onEditRecipe?: (recipe: Recipe) => void;
  onDeleteRecipe?: (recipeId: string) => void;
}

export default function RecipeLibrary({
  onRecipeClick = () => {},
  onEditRecipe = () => {},
  onDeleteRecipe = () => {},
}: RecipeLibraryProps) {
  // State for recipes
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Fetch recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await recipeAPI.getAll();
        
        if (response.success && response.recipes) {
          setRecipes(response.recipes);
        } else {
          throw new Error(response.message || 'Failed to fetch recipes');
        }
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Failed to load recipes');
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Extract all unique tags
  const allTags = Array.from(new Set(recipes.flatMap((recipe) => recipe.tags)));

  // Filter recipes based on search term and tag
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      searchTerm === "" ||
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag =
      selectedTag === null || recipe.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const handleRecipeClick = (recipe: Recipe) => {
    onRecipeClick(recipe);
  };

  return (
    <div className="w-full h-full bg-background p-4 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Recipe Library</h1>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsFilterDialogOpen(!isFilterDialogOpen)}
          >
            <Filter className="h-4 w-4" />
          </Button>

          <div className="border rounded-md flex">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter options */}
      {isFilterDialogOpen && (
        <div className="mb-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Filter by Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {selectedTag && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="flex items-center gap-1">
            Tag: {selectedTag}
            <button onClick={() => setSelectedTag(null)} className="ml-1">
              ×
            </button>
          </Badge>
        </div>
      )}

      {/* Recipe display */}
      <ScrollArea className="flex-grow">
        {filteredRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-2">No recipes found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRecipeClick(recipe)}
              >
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Prep: {recipe.prepTime}m</span>
                    <span>Cook: {recipe.cookTime}m</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-wrap gap-1">
                  {recipe.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {recipe.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{recipe.tags.length - 3}
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRecipeClick(recipe)}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col p-4 flex-grow">
                  <h3 className="font-medium">{recipe.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Prep: {recipe.prepTime}m</span>
                    <span>Cook: {recipe.cookTime}m</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
