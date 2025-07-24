import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Utensils, Users, Edit2, Save } from "lucide-react";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  number: number;
  instruction: string;
}

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface RecipePreviewProps {
  recipe?: {
    name: string;
    description: string;
    ingredients: Ingredient[];
    steps: Step[];
    prepTime: number;
    cookTime: number;
    servings: number;
    nutrition: NutritionInfo;
    tags: string[];
    imageUrl?: string;
  };
  onEdit?: () => void;
  onSave?: () => void;
}

const RecipePreview = ({
  recipe = {
    name: "Chicken Parmesan",
    description:
      "Classic Italian-American dish with breaded chicken cutlets, tomato sauce, and melted cheese.",
    ingredients: [
      { name: "Chicken breast", amount: "2", unit: "pieces" },
      { name: "Breadcrumbs", amount: "1", unit: "cup" },
      { name: "Parmesan cheese", amount: "1/2", unit: "cup" },
      { name: "Mozzarella cheese", amount: "1", unit: "cup" },
      { name: "Tomato sauce", amount: "2", unit: "cups" },
      { name: "Eggs", amount: "2", unit: "" },
      { name: "Olive oil", amount: "3", unit: "tbsp" },
      { name: "Salt", amount: "1", unit: "tsp" },
      { name: "Black pepper", amount: "1/2", unit: "tsp" },
      { name: "Italian herbs", amount: "1", unit: "tbsp" },
    ],
    steps: [
      { number: 1, instruction: "Preheat oven to 425°F (220°C)." },
      {
        number: 2,
        instruction: "Pound chicken breasts to even thickness, about 1/2 inch.",
      },
      {
        number: 3,
        instruction: "Season chicken with salt and pepper on both sides.",
      },
      {
        number: 4,
        instruction:
          "Beat eggs in a shallow bowl. In another bowl, mix breadcrumbs, half the parmesan, and Italian herbs.",
      },
      {
        number: 5,
        instruction: "Dip chicken in egg, then coat with breadcrumb mixture.",
      },
      {
        number: 6,
        instruction:
          "Heat olive oil in an oven-safe skillet over medium-high heat.",
      },
      {
        number: 7,
        instruction:
          "Cook chicken until golden brown, about 2-3 minutes per side.",
      },
      {
        number: 8,
        instruction: "Pour tomato sauce around chicken in the skillet.",
      },
      {
        number: 9,
        instruction: "Top chicken with mozzarella and remaining parmesan.",
      },
      {
        number: 10,
        instruction:
          "Bake in preheated oven until cheese is melted and chicken is cooked through, about 15-20 minutes.",
      },
    ],
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    nutrition: {
      calories: 450,
      protein: 38,
      carbs: 22,
      fat: 24,
    },
    tags: ["Italian", "Dinner", "Chicken", "Baked"],
    imageUrl:
      "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&q=80",
  },
  onEdit = () => {},
  onSave = () => {},
}: RecipePreviewProps) => {
  return (
    <Card className="w-full max-w-4xl mx-auto bg-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">{recipe.name}</CardTitle>
            <CardDescription className="mt-2">
              {recipe.description}
            </CardDescription>
          </div>
          {recipe.imageUrl && (
            <div className="w-32 h-32 rounded-md overflow-hidden">
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {recipe.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-6 justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Prep Time</p>
              <p className="text-sm">{recipe.prepTime} mins</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Cook Time</p>
              <p className="text-sm">{recipe.cookTime} mins</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Servings</p>
              <p className="text-sm">{recipe.servings}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-sm font-medium">
                  {ingredient.amount} {ingredient.unit}
                </span>
                <span className="text-sm">{ingredient.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-3">Instructions</h3>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.number} className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {step.number}
                </span>
                <p className="text-sm">{step.instruction}</p>
              </li>
            ))}
          </ol>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-3">Nutrition Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-muted rounded-md text-center">
              <p className="text-sm font-medium">Calories</p>
              <p className="text-lg">{recipe.nutrition.calories}</p>
            </div>
            <div className="p-3 bg-muted rounded-md text-center">
              <p className="text-sm font-medium">Protein</p>
              <p className="text-lg">{recipe.nutrition.protein}g</p>
            </div>
            <div className="p-3 bg-muted rounded-md text-center">
              <p className="text-sm font-medium">Carbs</p>
              <p className="text-lg">{recipe.nutrition.carbs}g</p>
            </div>
            <div className="p-3 bg-muted rounded-md text-center">
              <p className="text-sm font-medium">Fat</p>
              <p className="text-lg">{recipe.nutrition.fat}g</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-4">
        <Button variant="outline" onClick={onEdit}>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Recipe
        </Button>
        <Button onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Recipe
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecipePreview;
