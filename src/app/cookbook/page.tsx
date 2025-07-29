"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Plus, BookOpen } from "lucide-react";
import RecipeLibrary from "@/components/recipe/RecipeLibrary";
import RecipePreview from "@/components/recipe/RecipePreview";
import { ConfirmationModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Recipe } from "@/types/recipe";
import { recipeAPI } from "@/lib/api";

export default function CookbookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeView, setShowRecipeView] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Check if we're viewing a specific recipe from meal planner
    const recipeId = searchParams.get("recipe");
    const recipeName = searchParams.get("name");
    
    if (recipeId && recipeName) {
      // Fetch the specific recipe from backend
      const fetchRecipe = async () => {
        try {
          const response = await recipeAPI.getById(recipeId);
          if (response.success && response.recipe) {
            setSelectedRecipe(response.recipe);
          } else {
            // Fallback: create a basic recipe object
            const basicRecipe: Recipe = {
              id: recipeId,
              name: decodeURIComponent(recipeName),
              description: "A delicious recipe from your collection",
              ingredients: [],
              steps: [],
              prepTime: 15,
              cookTime: 30,
              servings: 4,
              nutrition: undefined,
              tags: ["Saved Recipe"],
              imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
              createdAt: new Date(),
              updatedAt: new Date()
            };
            setSelectedRecipe(basicRecipe);
          }
        } catch (error) {
          console.error('Error fetching recipe:', error);
        }
      };
      
      fetchRecipe();
      setShowRecipeView(true);
    }
  }, [searchParams]);

  const handleBackToLibrary = () => {
    setShowRecipeView(false);
    setSelectedRecipe(null);
    // Clear URL parameters
    router.push('/cookbook');
  };

  const handleDeleteRecipe = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteRecipe = async () => {
    if (!selectedRecipe) return;
    
    setIsDeleting(true);
    
    try {
      const response = await recipeAPI.delete(selectedRecipe.id);
      
      if (response.success) {
        // Successfully deleted, go back to library
        setShowDeleteModal(false);
        handleBackToLibrary();
        toast({
          title: "Recipe deleted",
          description: "Recipe has been successfully removed from your cookbook.",
        });
      } else {
        throw new Error(response.message || 'Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/meal-planner")}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Meal Planner</span>
            </Button>
          </div>
        </div>

        {showRecipeView && selectedRecipe ? (
          // Show specific recipe view
          <>
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToLibrary}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Cookbook</span>
              </Button>
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold">{selectedRecipe.name}</h1>
              </div>
              <p className="text-muted-foreground">
                Recipe details from your cookbook
              </p>
            </div>

            <RecipePreview 
              recipe={selectedRecipe}
              context="cookbook"
              onEdit={() => {
                // TODO: Implement recipe editing
                console.log('Edit recipe:', selectedRecipe.id);
              }}
              onAddToMealPlanner={() => {
                router.push('/meal-planner');
              }}
              onBack={handleBackToLibrary}
              onDelete={handleDeleteRecipe}
              isDeleting={isDeleting}
            />
          </>
        ) : (
          // Show recipe library
          <>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold">My Cookbook</h1>
              </div>
              <p className="text-muted-foreground">
                Manage your saved recipes and add them to your meal planner
              </p>
            </div>

            {/* Recipe Library */}
            <RecipeLibrary 
              onRecipeClick={(recipe) => {
                setSelectedRecipe(recipe);
                setShowRecipeView(true);
                // Update URL to show recipe details
                router.push(`/cookbook?recipe=${recipe.id}&name=${encodeURIComponent(recipe.name)}`);
              }}
            />
          </>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteRecipe}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${selectedRecipe?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
