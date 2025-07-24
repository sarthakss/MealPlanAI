"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Trash2 } from "lucide-react";

interface RecipeFormProps {
  onSubmit?: (recipeData: RecipeData) => void;
  onPreview?: (recipeData: RecipeData) => void;
}

export interface RecipeData {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cookingTime: string;
  servings: string;
  sourceUrl?: string;
}

const RecipeForm = ({ onSubmit, onPreview }: RecipeFormProps = {}) => {
  const [activeTab, setActiveTab] = useState("generate");
  const [currentStep, setCurrentStep] = useState(1);
  const [recipeData, setRecipeData] = useState<RecipeData>({
    name: "",
    description: "",
    ingredients: [""],
    steps: [""],
    cookingTime: "",
    servings: "2",
    sourceUrl: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setRecipeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index: number, value: string) => {
    const updatedIngredients = [...recipeData.ingredients];
    updatedIngredients[index] = value;
    setRecipeData((prev) => ({ ...prev, ingredients: updatedIngredients }));
  };

  const handleStepChange = (index: number, value: string) => {
    const updatedSteps = [...recipeData.steps];
    updatedSteps[index] = value;
    setRecipeData((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const addIngredient = () => {
    setRecipeData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = recipeData.ingredients.filter(
      (_, i) => i !== index,
    );
    setRecipeData((prev) => ({ ...prev, ingredients: updatedIngredients }));
  };

  const addStep = () => {
    setRecipeData((prev) => ({ ...prev, steps: [...prev.steps, ""] }));
  };

  const removeStep = (index: number) => {
    const updatedSteps = recipeData.steps.filter((_, i) => i !== index);
    setRecipeData((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const handleGenerateRecipe = () => {
    // Simulate AI recipe generation
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(2);
    }, 1500);
  };

  const handleImportRecipe = () => {
    // Simulate recipe import from URL
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setCurrentStep(2);
    }, 1500);
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(recipeData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(recipeData);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-background">
      <CardHeader>
        <CardTitle>Create Recipe</CardTitle>
        <CardDescription>
          Generate a recipe from a dish name or import from a video URL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="generate">Generate from Dish Name</TabsTrigger>
            <TabsTrigger value="import">Import from Video URL</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Dish Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter dish name (e.g., Chicken Parmesan)"
                    value={recipeData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <Button
                  onClick={handleGenerateRecipe}
                  disabled={!recipeData.name || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? "Generating..." : "Generate Recipe"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceUrl">Video URL</Label>
                  <Input
                    id="sourceUrl"
                    name="sourceUrl"
                    placeholder="Paste YouTube or TikTok URL"
                    value={recipeData.sourceUrl}
                    onChange={handleInputChange}
                  />
                </div>
                <Button
                  onClick={handleImportRecipe}
                  disabled={!recipeData.sourceUrl || isImporting}
                  className="w-full"
                >
                  {isImporting ? "Importing..." : "Import Recipe"}
                </Button>
              </div>
            )}
          </TabsContent>

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Recipe Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={recipeData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of the recipe"
                  value={recipeData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cookingTime">Cooking Time (minutes)</Label>
                  <Input
                    id="cookingTime"
                    name="cookingTime"
                    type="number"
                    value={recipeData.cookingTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    name="servings"
                    type="number"
                    value={recipeData.servings}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <Button onClick={nextStep} className="w-full">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Ingredients</Label>
                  <Button variant="outline" size="sm" onClick={addIngredient}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                {recipeData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) =>
                        handleIngredientChange(index, e.target.value)
                      }
                      placeholder={`Ingredient ${index + 1}`}
                    />
                    {recipeData.ingredients.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={nextStep}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Preparation Steps</Label>
                  <Button variant="outline" size="sm" onClick={addStep}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                {recipeData.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Textarea
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                    />
                    {recipeData.steps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={handlePreview}>Preview Recipe</Button>
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStep > 1 && (
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            Start Over
          </Button>
        )}
        {currentStep === 4 && (
          <Button onClick={handleSubmit}>Save Recipe</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default RecipeForm;
