"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RecipeForm, { RecipeData } from "@/components/recipe/RecipeForm";
import RecipePreview from "@/components/recipe/RecipePreview";
import RecipeLibrary from "@/components/recipe/RecipeLibrary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Calendar, Home } from "lucide-react";

export default function RecipePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("generate");
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "library") {
      setShowLibrary(true);
    } else if (tab === "import") {
      setActiveTab("import");
    } else {
      setActiveTab("generate");
    }
  }, [searchParams]);

  // Mock function to handle recipe generation
  const handleRecipeGeneration = (recipeData: RecipeData) => {
    // In a real implementation, this would call an API to generate the recipe
    console.log("Generating recipe with data:", recipeData);

    // Convert RecipeForm data to RecipePreview format
    const mockRecipe = {
      name: recipeData.name || "Delicious Recipe",
      description:
        recipeData.description ||
        "A wonderful dish that's easy to prepare and full of flavor.",
      ingredients: recipeData.ingredients
        .filter((ing) => ing.trim())
        .map((ingredient, index) => ({
          name: ingredient,
          amount: "1",
          unit: "cup",
        })),
      steps: recipeData.steps
        .filter((step) => step.trim())
        .map((step, index) => ({
          number: index + 1,
          instruction: step,
        })),
      prepTime: 15,
      cookTime: parseInt(recipeData.cookingTime) || 30,
      servings: parseInt(recipeData.servings) || 2,
      nutrition: {
        calories: 350,
        protein: 15,
        carbs: 40,
        fat: 12,
      },
      tags: ["Generated", "AI Recipe"],
      imageUrl:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    };

    setGeneratedRecipe(mockRecipe);
    setShowPreview(true);
  };

  const handleSaveRecipe = () => {
    // In a real implementation, this would save the recipe to a database
    console.log("Saving recipe:", generatedRecipe);
    // Show success message or redirect
  };

  const handleAddToCalendar = () => {
    // In a real implementation, this would open a modal to select a date and meal type
    console.log("Adding recipe to calendar:", generatedRecipe);
    // Show success message or redirect
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  const toggleLibrary = () => {
    setShowLibrary(!showLibrary);
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <Home className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Recipe Creator</h1>
        </div>
        <Button variant="outline" onClick={toggleLibrary}>
          {showLibrary ? "Close Library" : "Recipe Library"}
        </Button>
      </div>

      {showLibrary ? (
        <RecipeLibrary />
      ) : showPreview ? (
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={handleBackToForm}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Form
          </Button>

          <RecipePreview recipe={generatedRecipe} />

          <div className="flex flex-wrap gap-4 justify-end mt-6">
            <Button
              variant="outline"
              onClick={handleAddToCalendar}
              className="flex items-center gap-2"
            >
              <Calendar size={16} />
              Add to Calendar
            </Button>
            <Button
              onClick={handleSaveRecipe}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              Save Recipe
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create a New Recipe</CardTitle>
            <CardDescription>
              Generate a recipe from a dish name or import from a cooking video
              URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="generate"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="generate">
                  Generate from Dish Name
                </TabsTrigger>
                <TabsTrigger value="import">Import from Video URL</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-4">
                <RecipeForm onSubmit={handleRecipeGeneration} />
              </TabsContent>

              <TabsContent value="import" className="space-y-4">
                <RecipeForm onSubmit={handleRecipeGeneration} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
