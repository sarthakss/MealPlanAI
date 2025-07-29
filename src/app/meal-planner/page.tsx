"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WeekNavigator from "../WeekNavigator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, ArrowLeft, BookOpen, X, Clock, Users } from "lucide-react";
import RecipeSelector from "@/components/RecipeSelector";
import { Recipe, MealSlot } from "@/types/recipe";
import { mockAPI } from "@/lib/api";

export default function MealPlannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Week selection state
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  
  // Meal planning state
  const [mealPlan, setMealPlan] = useState<MealSlot[]>([]);
  const [showRecipeSelector, setShowRecipeSelector] = useState<{date: string, mealType: string} | null>(null);
  const [customMealTypes, setCustomMealTypes] = useState<{[dateString: string]: string[]}>({});
  const [showMealSelector, setShowMealSelector] = useState<string | null>(null);
  const [preSelectedRecipe, setPreSelectedRecipe] = useState<Recipe | null>(null);
  const [showPreSelectedRecipePrompt, setShowPreSelectedRecipePrompt] = useState(false);


  // Predefined meal type options
  const mealTypeOptions = [
    'breakfast',
    'brunch', 
    'lunch',
    'snack',
    'dinner',
    'dessert',
    'late night'
  ];

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
  
  // Handle pre-selected recipe from home page
  useEffect(() => {
    const selectedRecipeId = searchParams.get('selectedRecipe');
    const recipeName = searchParams.get('recipeName');
    
    if (selectedRecipeId && recipeName) {
      // Create a mock recipe object for the pre-selected recipe
      const recipe: Recipe = mockAPI.createMockRecipe({
        id: selectedRecipeId,
        name: decodeURIComponent(recipeName),
        description: "Recipe from your home page creation",
        ingredients: [
          { name: "Ingredient 1", amount: "1", unit: "cup" },
          { name: "Ingredient 2", amount: "2", unit: "tbsp" }
        ],
        steps: [
          { number: 1, instruction: "Prepare ingredients" },
          { number: 2, instruction: "Cook according to recipe" }
        ],
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        tags: ["Home Created"],
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
      });
      
      setPreSelectedRecipe(recipe);
      setShowPreSelectedRecipePrompt(true);
      
      // Clear URL parameters
      router.replace('/meal-planner');
    }
  }, [searchParams, router]);
  
  // Helper functions for meal planning
  const getMealSlot = (date: string, mealType: string) => {
    return mealPlan.find(slot => slot.date === date && slot.mealType === mealType);
  };
  
  const addRecipeToSlot = (date: string, mealType: string, recipe: Recipe) => {
    setMealPlan(prev => {
      const existingSlot = prev.find(slot => slot.date === date && slot.mealType === mealType);
      
      if (existingSlot) {
        return prev.map(slot => 
          slot.date === date && slot.mealType === mealType
            ? { ...slot, recipes: [...slot.recipes, recipe] }
            : slot
        );
      } else {
        return [...prev, {
          id: `${date}-${mealType}`,
          date,
          mealType,
          recipes: [recipe]
        }];
      }
    });
  };
  
  const removeRecipeFromSlot = (date: string, mealType: string, recipeId: string) => {
    setMealPlan(prev => 
      prev.map(slot => 
        slot.date === date && slot.mealType === mealType
          ? { ...slot, recipes: slot.recipes.filter(r => r.id !== recipeId) }
          : slot
      ).filter(slot => slot.recipes.length > 0)
    );
  };
  
  const handleAddRecipe = (date: string, mealType: string) => {
    setShowRecipeSelector({ date, mealType });
  };
  
  const handleRecipeSelected = (recipe: any) => {
    if (showRecipeSelector) {
      // Convert the selected recipe to our Recipe type
      const mealPlanRecipe: Recipe = mockAPI.createMockRecipe({
        id: recipe.id,
        name: recipe.name,
        prepTime: recipe.prepTime || 15,
        cookTime: recipe.cookTime || 30,
        servings: recipe.servings || 4,
        imageUrl: recipe.imageUrl,
        description: recipe.description || "Recipe from cookbook",
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        tags: recipe.tags || ["Meal Plan"]
      });
      
      addRecipeToSlot(showRecipeSelector.date, showRecipeSelector.mealType, mealPlanRecipe);
      setShowRecipeSelector(null);
    }
  };
  
  const handleCloseSelectorModal = () => {
    setShowRecipeSelector(null);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    // Navigate to cookbook page to view recipe details
    router.push(`/cookbook?recipe=${recipe.id}&name=${encodeURIComponent(recipe.name)}`);
  };

  const addMealTypeSlot = (dateString: string, mealType: string) => {
    // Check if this meal type already exists for this day
    const existingMealTypes = ['breakfast', 'lunch', 'dinner', ...(customMealTypes[dateString] || [])];
    
    if (!existingMealTypes.includes(mealType)) {
      // Only add to custom meal types if it's not a default meal and doesn't already exist
      if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
        setCustomMealTypes(prev => ({
          ...prev,
          [dateString]: [...(prev[dateString] || []), mealType]
        }));
      }
    }
    
    // Always trigger recipe selector for the meal type
    setShowRecipeSelector({ date: dateString, mealType });
    setShowMealSelector(null);
  };

  const removeMealTypeSlot = (dateString: string, mealType: string, index: number) => {
    setCustomMealTypes(prev => {
      const dayMeals = prev[dateString] || [];
      const updatedMeals = [...dayMeals];
      updatedMeals.splice(index, 1);
      return {
        ...prev,
        [dateString]: updatedMeals
      };
    });
  };

  const getMealTypesForDay = (dateString: string) => {
    const defaultMeals = ['breakfast', 'lunch', 'dinner'];
    const customMeals = customMealTypes[dateString] || [];
    return [...defaultMeals, ...customMeals];
  };


  
  // Mobile-first meal slot component
  const MealSlotComponent = ({ date, mealType, dateString, isCustom = false }: { date: Date, mealType: string, dateString: string, isCustom?: boolean }) => {
    const slot = getMealSlot(dateString, mealType);
    const recipes = slot?.recipes || [];
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground capitalize">
              {mealType}
            </p>
            {isCustom && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeMealTypeSlot(dateString, mealType, 0)}
                className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                title="Remove meal type"
              >
                <X className="h-2 w-2" />
              </Button>
            )}
          </div>
        </div>
        
        {recipes.length === 0 ? (
          <div 
            className="text-xs text-muted-foreground text-center py-2 border-2 border-dashed rounded cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleAddRecipe(dateString, mealType)}
          >
            Click to add recipe
          </div>
        ) : (
          <div className="space-y-1">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between bg-muted/50 rounded p-1.5 text-xs">
                <div 
                  className="flex-1 min-w-0 cursor-pointer hover:bg-muted/70 rounded p-1 -m-1 transition-colors"
                  onClick={() => handleRecipeClick(recipe)}
                  title="Click to view recipe details"
                >
                  <p className="font-medium truncate">{recipe.name}</p>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.prepTime}m
                    </span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {recipe.servings}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecipeFromSlot(dateString, mealType, recipe.id);
                  }}
                  className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}

          </div>
        )}
      </div>
    );
  };

  // Compact add meal component
  const AddMealTypeComponent = ({ dateString }: { dateString: string }) => {
    const handleMealTypeSelect = (mealType: string) => {
      addMealTypeSlot(dateString, mealType);
    };

    return (
      <div className="relative">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowMealSelector(showMealSelector === dateString ? null : dateString)}
          className="h-6 w-6 p-0 border-dashed hover:bg-primary/5"
        >
          <Plus className="h-3 w-3" />
        </Button>
        
        {showMealSelector === dateString && (
          <div className="absolute top-8 left-0 z-10 bg-white border rounded-md shadow-lg p-1 min-w-[120px]">
            {mealTypeOptions.map((mealType) => (
              <button
                key={mealType}
                onClick={() => handleMealTypeSelect(mealType)}
                className="block w-full text-left px-2 py-1 text-xs hover:bg-primary/10 rounded capitalize"
              >
                {mealType}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
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
              onClick={() => router.push("/cookbook")}
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">My Cookbook</span>
              <span className="sm:hidden">Cookbook</span>
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Weekly Meal Planner</h1>
          <p className="text-muted-foreground">
            Plan your meals by adding recipes from your cookbook
          </p>
        </div>

        {/* Pre-selected Recipe Prompt */}
        {showPreSelectedRecipePrompt && preSelectedRecipe && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <CardTitle className="text-lg">Recipe Ready to Plan!</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPreSelectedRecipePrompt(false);
                    setPreSelectedRecipe(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={preSelectedRecipe.imageUrl}
                    alt={preSelectedRecipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-1">{preSelectedRecipe.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your recipe has been saved to the cookbook and is ready to add to your meal plan.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {preSelectedRecipe.prepTime + preSelectedRecipe.cookTime}m total
                    </span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {preSelectedRecipe.servings} servings
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowRecipeSelector({ date: weekDays[0].toISOString().split('T')[0], mealType: 'lunch' });
                      setShowPreSelectedRecipePrompt(false);
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Add to Plan</span>
                    <span className="sm:hidden">Add to Plan</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/cookbook')}
                    className="w-full sm:w-auto"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">View in Cookbook</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Week Navigation */}
        <WeekNavigator weekStart={weekStart} setWeekStart={setWeekStart} />

        {/* Weekly Meal Planner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span className="text-lg sm:text-xl">Week of {weekDays[0].toLocaleDateString()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
              {weekDays.map((date) => {
                const dateString = date.toISOString().split('T')[0];
                
                return (
                  <div key={date.toISOString()} className="border rounded-lg p-2 sm:p-3 space-y-3 sm:space-y-4">
                    <div className="text-center border-b pb-2">
                      <h3 className="font-semibold text-sm sm:text-base">
                        {date.toLocaleDateString(undefined, { weekday: "short" })}
                      </h3>
                      <div className="text-xs text-muted-foreground">
                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {/* Meal Slots */}
                    <div className="space-y-3 sm:space-y-4">
                      {/* Default meal slots */}
                      {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                        <MealSlotComponent 
                          key={`default-${mealType}`}
                          date={date} 
                          mealType={mealType} 
                          dateString={dateString}
                          isCustom={false}
                        />
                      ))}
                      
                      {/* Custom meal slots */}
                      {(customMealTypes[dateString] || []).map((mealType) => (
                        <MealSlotComponent 
                          key={`custom-${mealType}`}
                          date={date} 
                          mealType={mealType} 
                          dateString={dateString}
                          isCustom={true}
                        />
                      ))}
                      
                      {/* Add meal type section */}
                      <div className="pt-2 border-t border-dashed flex justify-center">
                        <AddMealTypeComponent dateString={dateString} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Empty State Helper */}
        <Card className="mt-6 border-dashed">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No recipes in your cookbook yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate or import recipes first, then come back to plan your meals
            </p>
            <Button onClick={() => router.push("/")}>
              Create Recipes
            </Button>
          </CardContent>
        </Card>
        
        {/* Recipe Selector Modal */}
        {showRecipeSelector && (
          <RecipeSelector
            isOpen={true}
            onClose={handleCloseSelectorModal}
            onSelectRecipe={handleRecipeSelected}
            mealType={showRecipeSelector.mealType}
            date={showRecipeSelector.date}
          />
        )}


      </div>
    </div>
  );
}
