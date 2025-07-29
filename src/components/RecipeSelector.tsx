"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Clock, Users, X, Filter, ChefHat } from "lucide-react";
import Image from "next/image";
import { recipeAPI } from '@/lib/api';
import { Recipe } from '@/types/recipe';

// Extended Recipe type for local use with difficulty
type RecipeWithDifficulty = Recipe & { difficulty?: string };

interface RecipeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: RecipeWithDifficulty) => void;
  mealType: string;
  date: string;
}

export default function RecipeSelector({ isOpen, onClose, onSelectRecipe, mealType, date }: RecipeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeWithDifficulty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  // Note: Removed auto-filter by meal type to allow users to see all recipes

  // Reset filters when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedTags([]);
      setSelectedDifficulty("");
    }
  }, [isOpen]);

  // Fetch recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        const response = await recipeAPI.getAll();
        
        if (response.success && response.recipes) {
          // Add difficulty property to recipes for local use
          const recipesWithDifficulty: RecipeWithDifficulty[] = response.recipes.map(recipe => ({
            ...recipe,
            difficulty: 'medium', // Default difficulty
            imageUrl: recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'
          }));
          setRecipes(recipesWithDifficulty);
        } else {
          // No fallback - just set empty array if API fails
          setRecipes([]);
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        // No fallback - just set empty array if API fails
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Get all available categories from recipes
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    recipes.forEach(recipe => {
      recipe.tags.forEach(tag => categorySet.add(tag));
    });
    return Array.from(categorySet).sort();
  }, [recipes]);

  // Filter recipes based on search and filters
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => recipe.tags.includes(tag));

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === "" || 
        recipe.difficulty === selectedDifficulty;

      return matchesSearch && matchesTags && matchesDifficulty;
    });
  }, [recipes, searchQuery, selectedTags, selectedDifficulty]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5" />
            <span>Add Recipe to {mealType}</span>
            <Badge variant="outline" className="ml-2">
              {formatDate(date)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Tag Filters */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Meal Type & Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 capitalize"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <span className="text-sm font-medium mb-2 block">Difficulty</span>
              <div className="flex space-x-2">
                {["easy", "medium", "hard"].map(difficulty => (
                  <Badge
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 capitalize"
                    onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? "" : difficulty)}
                  >
                    {difficulty}
                    {selectedDifficulty === difficulty && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            <div className="text-sm text-muted-foreground mb-3">
              {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRecipes.map(recipe => (
                <Card 
                  key={recipe.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectRecipe(recipe)}
                >
                  <div className="relative h-32 w-full">
                    <Image
                      src={recipe.imageUrl || '/placeholder-recipe.jpg'}
                      alt={recipe.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm mb-1 truncate">{recipe.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{recipe.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{recipe.prepTime + recipe.cookTime}min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{recipe.servings}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {recipe.difficulty}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          +{recipe.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-8">
                <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No recipes found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search or filters, or add more recipes to your cookbook.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
