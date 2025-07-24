"use client";

import React, { useState } from "react";
import { Search, Filter, Grid, List, Tag, Edit, Trash2 } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  categories: string[];
  tags: string[];
}

interface RecipeLibraryProps {
  recipes?: Recipe[];
  onSelectRecipe?: (recipe: Recipe) => void;
  onEditRecipe?: (recipe: Recipe) => void;
  onDeleteRecipe?: (recipeId: string) => void;
}

export default function RecipeLibrary({
  recipes = [
    {
      id: "1",
      name: "Chicken Parmesan",
      description:
        "Classic Italian dish with breaded chicken, tomato sauce, and melted cheese",
      image:
        "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&q=80",
      prepTime: "20 mins",
      cookTime: "30 mins",
      categories: ["Italian", "Dinner"],
      tags: ["Chicken", "Cheese", "Tomato"],
    },
    {
      id: "2",
      name: "Avocado Toast",
      description:
        "Simple and nutritious breakfast with mashed avocado on toasted bread",
      image:
        "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600&q=80",
      prepTime: "5 mins",
      cookTime: "5 mins",
      categories: ["Breakfast", "Vegetarian"],
      tags: ["Avocado", "Quick", "Healthy"],
    },
    {
      id: "3",
      name: "Beef Stir Fry",
      description: "Quick and flavorful stir-fried beef with vegetables",
      image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
      prepTime: "15 mins",
      cookTime: "10 mins",
      categories: ["Asian", "Dinner"],
      tags: ["Beef", "Quick", "Vegetables"],
    },
    {
      id: "4",
      name: "Greek Salad",
      description: "Fresh Mediterranean salad with feta cheese and olives",
      image:
        "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=600&q=80",
      prepTime: "10 mins",
      cookTime: "0 mins",
      categories: ["Mediterranean", "Lunch", "Vegetarian"],
      tags: ["Salad", "Healthy", "No-cook"],
    },
  ],
  onSelectRecipe = () => {},
  onEditRecipe = () => {},
  onDeleteRecipe = () => {},
}: RecipeLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Extract all unique categories and tags
  const allCategories = Array.from(
    new Set(recipes.flatMap((recipe) => recipe.categories)),
  );
  const allTags = Array.from(new Set(recipes.flatMap((recipe) => recipe.tags)));

  // Filter recipes based on search term, category, and tag
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      searchTerm === "" ||
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === null || recipe.categories.includes(selectedCategory);
    const matchesTag =
      selectedTag === null || recipe.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleSelectRecipe = () => {
    if (selectedRecipe) {
      onSelectRecipe(selectedRecipe);
      setSelectedRecipe(null);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setIsFilterDialogOpen(false);
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

          <Dialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Recipes</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((category) => (
                      <Badge
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === category ? null : category,
                          )
                        }
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Tags</h3>
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
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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

      {/* Active filters display */}
      {(selectedCategory || selectedTag) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory && (
            <Badge className="flex items-center gap-1">
              Category: {selectedCategory}
              <button
                onClick={() => setSelectedCategory(null)}
                className="ml-1"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedTag && (
            <Badge className="flex items-center gap-1">
              Tag: {selectedTag}
              <button onClick={() => setSelectedTag(null)} className="ml-1">
                ×
              </button>
            </Badge>
          )}
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
                    src={recipe.image}
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
                    <span>Prep: {recipe.prepTime}</span>
                    <span>Cook: {recipe.cookTime}</span>
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
                    src={recipe.image}
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
                    <span>Prep: {recipe.prepTime}</span>
                    <span>Cook: {recipe.cookTime}</span>
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

      {/* Recipe detail dialog */}
      <Dialog
        open={!!selectedRecipe}
        onOpenChange={(open) => !open && setSelectedRecipe(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRecipe.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video w-full overflow-hidden rounded-md">
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p>{selectedRecipe.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span>Prep time: {selectedRecipe.prepTime}</span>
                  <span>Cook time: {selectedRecipe.cookTime}</span>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.categories.map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onEditRecipe(selectedRecipe);
                        setSelectedRecipe(null);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onDeleteRecipe(selectedRecipe.id);
                        setSelectedRecipe(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <Button onClick={handleSelectRecipe}>Select Recipe</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
