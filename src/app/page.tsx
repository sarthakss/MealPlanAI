"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, ChefHat, Video, BookOpen, Save, Camera, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import PhotoUpload from "@/components/PhotoUpload";
import RecipeForm, { RecipeData } from "@/components/recipe/RecipeForm";
import RecipePreview from "@/components/recipe/RecipePreview";
import { Recipe } from "@/types/recipe";
import { recipeAPI } from "@/lib/api";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Week selection state - moved before early return
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  // Recipe creation state
  const [activeTab, setActiveTab] = useState("generate");
  const [recipeInput, setRecipeInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [showRecipePreview, setShowRecipePreview] = useState(false);
  
  // Photo upload state
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  
  // Save state
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Recipe generation functions
  const handleRecipeGeneration = async () => {
    if (!recipeInput.trim()) return;
    try {
      setIsGenerating(true);
      
      // Use real AI generation API
      const response = await recipeAPI.generateFromText(recipeInput);
      
      if (response.success && response.recipe) {
        setGeneratedRecipe(response.recipe);
        setShowRecipePreview(true);
      } else {
        throw new Error(response.message || 'Failed to generate recipe');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle recipe form submission from RecipeForm component
  const handleRecipeFormSubmission = async (formData: any) => {
    try {
      setIsGenerating(true);
      
      // Create recipe using real API
      const createRequest = {
        name: formData.name || 'Custom Recipe',
        description: formData.description || 'A custom recipe created by you',
        prepTime: parseInt(formData.prepTime) || 15,
        cookTime: parseInt(formData.cookTime) || 30,
        servings: parseInt(formData.servings) || 4,
        ingredients: formData.ingredients?.split('\n').filter((ing: string) => ing.trim()).map((ing: string, index: number) => ({
          id: `ing-${index}`,
          name: ing.trim(),
          amount: '1',
          unit: 'unit'
        })) || [],
        steps: formData.instructions?.split('\n').filter((step: string) => step.trim()).map((step: string, index: number) => ({
          number: index + 1,
          instruction: step.trim()
        })) || [],
        tags: formData.tags?.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) || []
      };
      
      const response = await recipeAPI.create(createRequest);
      
      if (response.success && response.recipe) {
        setGeneratedRecipe(response.recipe);
      } else {
        throw new Error(response.message || 'Failed to create recipe');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;
    
    setIsSaving(true);
    
    try {
      // Use real API to save recipe to database
      const response = await recipeAPI.create({
        name: generatedRecipe.name,
        description: generatedRecipe.description,
        ingredients: generatedRecipe.ingredients,
        steps: generatedRecipe.steps,
        prepTime: generatedRecipe.prepTime,
        cookTime: generatedRecipe.cookTime,
        servings: generatedRecipe.servings,
        tags: generatedRecipe.tags,
        imageUrl: generatedRecipe.imageUrl
      });
      
      if (response.success) {
        console.log("Recipe saved successfully:", response.recipe);
        setIsSaved(true);
        // Update the generated recipe with the saved recipe ID
        if (response.recipe) {
          setGeneratedRecipe(response.recipe);
        }
      } else {
        throw new Error(response.message || 'Failed to save recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToMealPlanner = async () => {
    if (!generatedRecipe) return;
    
    // First, save the recipe to cookbook if not already saved
    if (!isSaved) {
      setIsSaving(true);
      
      // Simulate API call to save recipe to cookbook
      setTimeout(() => {
        console.log("Saving recipe to cookbook:", generatedRecipe);
        setIsSaving(false);
        setIsSaved(true);
        
        // After saving, navigate to meal planner with recipe selected
        router.push(`/meal-planner?selectedRecipe=${generatedRecipe.id}&recipeName=${encodeURIComponent(generatedRecipe.name)}`);
      }, 1000);
    } else {
      // Recipe already saved, just navigate to meal planner
      router.push(`/meal-planner?selectedRecipe=${generatedRecipe.id}&recipeName=${encodeURIComponent(generatedRecipe.name)}`);
    }
  };

  const handleNewRecipe = () => {
    setRecipeInput("");
    setGeneratedRecipe(null);
    setShowRecipePreview(false);
    setShowPhotoUpload(false);
    setIsAnalyzingPhoto(false);
    setIsSaved(false);
    setIsSaving(false);
  };

  const handlePhotoAnalyzed = (recipe: any) => {
    setGeneratedRecipe(recipe);
    setShowRecipePreview(true);
    setIsAnalyzingPhoto(false);
    setShowPhotoUpload(false);
  };

  const togglePhotoUpload = () => {
    setShowPhotoUpload(!showPhotoUpload);
    if (showRecipePreview) {
      handleNewRecipe();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold">
            Loading your meal planner...
          </h2>
          <p className="text-muted-foreground">
            Setting up your weekly calendar
          </p>
        </div>
      </div>
    );
  }



  // Helper to get all days in week
  function getWeekDays(startDate: Date) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }
  const weekDays = getWeekDays(weekStart);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">AI Chef Assistant</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 px-2">
            Generate recipes, build your cookbook, and plan your meals
          </p>
        </div>

        {/* Smart Recipe Input */}
        <Card className="mb-6 sm:mb-8 border-2 border-primary/20 shadow-lg">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2 sm:mb-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse"></div>
                <h2 className="text-xl sm:text-2xl font-bold">AI Recipe Assistant</h2>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                Tell me what you want to cook, paste a recipe/video URL, or upload a photo of ingredients/dish
              </p>
            </div>
            
            <div className="w-full">
              {!showPhotoUpload ? (
                <div className="relative">
                  <textarea
                    placeholder="What would you like to cook? Try 'Chicken tikka masala' or paste a recipe URL..."
                    className="w-full h-32 sm:h-40 p-4 sm:p-6 border-2 border-muted-foreground/20 rounded-xl resize-none focus:border-primary focus:outline-none transition-colors text-base sm:text-lg"
                    style={{ fontFamily: 'inherit' }}
                    value={recipeInput}
                    onChange={(e) => setRecipeInput(e.target.value)}
                    disabled={isGenerating}
                  />
                  {/* Mobile buttons - stacked */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-3 sm:mt-0 sm:absolute sm:bottom-4 sm:right-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePhotoUpload}
                      className="flex items-center justify-center space-x-1 w-full sm:w-auto"
                      disabled={isGenerating}
                    >
                      <Camera className="h-4 w-4" />
                      <span>Upload Photo</span>
                    </Button>
                    <Button 
                      size="sm"
                      className="shadow-lg w-full sm:w-auto sm:size-lg" 
                      onClick={handleRecipeGeneration}
                      disabled={isGenerating || !recipeInput.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                          <span className="text-sm sm:text-base">Generating...</span>
                        </>
                      ) : (
                        <>
                          <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          <span className="text-sm sm:text-base">Create Recipe</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <PhotoUpload 
                  onPhotoAnalyzed={handlePhotoAnalyzed} 
                  isAnalyzing={isAnalyzingPhoto}
                  setIsAnalyzing={setIsAnalyzingPhoto}
                  onBackToText={togglePhotoUpload}
                />
              )}
              
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <ChefHat className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>AI Generation</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Video Import</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Web Import</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Photo Recipe Analysis</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Preview Section */}
        {showRecipePreview && generatedRecipe && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-800">Recipe Generated!</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewRecipe}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>New Recipe</span>
              </Button>
            </div>
            
            {!isSaved ? (
              <RecipePreview 
                recipe={generatedRecipe}
                context="home"
                onSave={handleSaveRecipe}
                onAddToMealPlanner={handleAddToMealPlanner}
                isSaving={isSaving}
                isAddingToMealPlanner={false}
              />
            ) : (
              <div className="text-center mb-6">
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardContent className="p-6">
                    <p className="text-green-800 font-medium mb-4">✓ Recipe saved to your cookbook!</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push('/cookbook')}
                        className="flex items-center space-x-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>View Cookbook</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleAddToMealPlanner}
                        className="flex items-center space-x-2"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Add to Meal Planner</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Navigation Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-center mb-6">What would you like to do next?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Button
              size="lg"
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-primary hover:bg-primary/5"
              onClick={() => router.push("/cookbook")}
            >
              <BookOpen className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">My Cookbook</div>
                <div className="text-xs text-muted-foreground">View & manage recipes</div>
              </div>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-primary hover:bg-primary/5"
              onClick={() => router.push("/meal-planner")}
            >
              <Calendar className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Meal Planner</div>
                <div className="text-xs text-muted-foreground">Plan weekly meals</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Recipes Saved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Meals Planned</div>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
