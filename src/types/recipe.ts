// Standard Recipe interface for the entire app
export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  nutrition?: Nutrition;
  tags: string[];
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface RecipeStep {
  number: number;
  instruction: string;
}

export interface Nutrition {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

// For meal planning
export interface MealSlot {
  id: string;
  date: string; // ISO date string
  mealType: string;
  recipes: Recipe[];
}

// API request/response types
export interface CreateRecipeRequest {
  name: string;
  description?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags?: string[];
  imageUrl?: string;
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {
  id: string;
}

export interface RecipeResponse {
  recipe?: Recipe;
  success: boolean;
  message?: string;
}

export interface RecipesListResponse {
  recipes: Recipe[];
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
