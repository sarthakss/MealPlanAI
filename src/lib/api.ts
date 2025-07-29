import { 
  Recipe, 
  CreateRecipeRequest, 
  UpdateRecipeRequest, 
  RecipeResponse, 
  RecipesListResponse,
  MealSlot 
} from '@/types/recipe';

// Base API configuration - using Next.js API routes
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Generic API request helper
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Recipe API functions
export const recipeAPI = {
  // Get all recipes
  getAll: async (page = 1, limit = 20): Promise<RecipesListResponse> => {
    try {
      const response = await apiRequest<any>('/recipes');
      
      // Handle the new API response format
      if (response.success && response.recipes) {
        return {
          recipes: response.recipes, // Already transformed by the backend
          pagination: response.pagination || {
            page,
            limit,
            total: response.recipes.length
          },
          success: true
        };
      } else {
        // Fallback for error responses
        return {
          recipes: [],
          pagination: {
            page,
            limit,
            total: 0
          },
          success: false
        };
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      return {
        recipes: [],
        pagination: {
          page,
          limit,
          total: 0
        },
        success: false
      };
    }
  },

  // Get recipe by ID
  getById: async (id: string): Promise<RecipeResponse> => {
    try {
      const recipe = await apiRequest<any>(`/recipes/${id}`);
      return {
        recipe: {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients || [],
          steps: recipe.recipe_steps?.map((step: any) => ({
            number: step.step_number,
            instruction: step.instruction
          })) || [],
          prepTime: recipe.prep_time,
          cookTime: recipe.cook_time,
          servings: recipe.servings,
          nutrition: recipe.nutrition?.[0] || null,
          tags: recipe.tags || [],
          imageUrl: recipe.image_url,
          createdAt: new Date(recipe.created_at),
          updatedAt: new Date(recipe.updated_at)
        },
        success: true
      };
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
      throw error;
    }
  },

  // Create new recipe
  create: async (recipeData: CreateRecipeRequest): Promise<RecipeResponse> => {
    try {
      const response = await apiRequest<{ id: string; message: string }>('/recipes', {
        method: 'POST',
        body: JSON.stringify({
          name: recipeData.name,
          description: recipeData.description,
          ingredients: recipeData.ingredients,
          steps: recipeData.steps?.map(step => step.instruction) || [],
          prepTime: recipeData.prepTime,
          cookTime: recipeData.cookTime,
          servings: recipeData.servings,
          nutrition: (recipeData as any).nutrition,
          tags: recipeData.tags,
          imageUrl: recipeData.imageUrl
        }),
      });
      
      // Fetch the created recipe to return full data
      return await recipeAPI.getById(response.id);
    } catch (error) {
      console.error('Failed to create recipe:', error);
      throw error;
    }
  },

  // Update existing recipe
  update: async (recipeData: UpdateRecipeRequest): Promise<RecipeResponse> => {
    try {
      await apiRequest(`/recipes/${recipeData.id}`, {
        method: 'PUT',
        body: JSON.stringify(recipeData),
      });
      
      // Fetch the updated recipe to return full data
      return await recipeAPI.getById(recipeData.id);
    } catch (error) {
      console.error('Failed to update recipe:', error);
      throw error;
    }
  },

  // Delete recipe
  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiRequest<{ message: string }>(`/recipes/${id}`, {
        method: 'DELETE',
      });
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      return { success: false, message: 'Failed to delete recipe' };
    }
  },

  // Search recipes (for now, filter on frontend - can be enhanced later)
  search: async (query: string, filters?: {
    tags?: string[];
    maxPrepTime?: number;
    maxCookTime?: number;
  }): Promise<RecipesListResponse> => {
    try {
      const allRecipes = await recipeAPI.getAll();
      
      const filteredRecipes = allRecipes.recipes.filter(recipe => {
        const matchesQuery = !query || 
          recipe.name.toLowerCase().includes(query.toLowerCase()) ||
          recipe.description?.toLowerCase().includes(query.toLowerCase());
        
        const matchesTags = !filters?.tags?.length || 
          filters.tags.some(tag => recipe.tags.includes(tag));
        
        const matchesPrepTime = !filters?.maxPrepTime || 
          (recipe.prepTime && recipe.prepTime <= filters.maxPrepTime);
        
        const matchesCookTime = !filters?.maxCookTime || 
          (recipe.cookTime && recipe.cookTime <= filters.maxCookTime);
        
        return matchesQuery && matchesTags && matchesPrepTime && matchesCookTime;
      });
      
      return {
        recipes: filteredRecipes,
        success: true,
        pagination: {
          page: 1,
          limit: filteredRecipes.length,
          total: filteredRecipes.length
        }
      };
    } catch (error) {
      console.error('Failed to search recipes:', error);
      throw error;
    }
  },

  // Generate recipe from AI text input
  generateFromText: async (input: string): Promise<RecipeResponse> => {
    try {
      const response = await apiRequest<any>('/recipes/generate/text', {
        method: 'POST',
        body: JSON.stringify({ prompt: input }),
      });
      
      // Check if the API returned the expected structure
      if (!response.success || !response.recipe) {
        throw new Error(response.message || 'Invalid API response structure');
      }
      
      const recipe = response.recipe;
      
      // Try to fetch an image for the recipe
      let imageUrl: string | undefined = undefined;
      try {
        const imageResponse = await apiRequest<any>(`/images/unsplash?query=${encodeURIComponent(recipe.name)}`);
        if (imageResponse.success && imageResponse.imageUrl) {
          imageUrl = imageResponse.imageUrl;
        }
      } catch (error) {
        console.log('Could not fetch image for recipe, using fallback');
      }
      
      return {
        recipe: {
          id: `generated-${Date.now()}`,
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients || [],
          steps: recipe.steps?.map((instruction: string, index: number) => ({
            number: index + 1,
            instruction
          })) || [],
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          nutrition: recipe.nutrition,
          tags: recipe.tags || [],
          imageUrl: imageUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        success: true
      };
    } catch (error) {
      console.error('Failed to generate recipe from text:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate recipe'
      };
    }
  },

  // Generate recipe from photo
  generateFromPhoto: async (imageFile: File): Promise<RecipeResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const recipe = await apiRequest<any>('/recipes/generate/photo', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
      
      return {
        recipe: {
          id: `generated-${Date.now()}`,
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients || [],
          steps: recipe.steps?.map((instruction: string, index: number) => ({
            number: index + 1,
            instruction
          })) || [],
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          nutrition: recipe.nutrition,
          tags: recipe.tags || [],
          imageUrl: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        success: true
      };
    } catch (error) {
      console.error('Failed to generate recipe from photo:', error);
      throw error;
    }
  },

  // Upload recipe image
  uploadImage: async (imageFile: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      return await apiRequest<{ url: string }>('/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  },

  // Fetch recipe image from Unsplash
  fetchRecipeImage: async (recipeName: string): Promise<{
    success: boolean;
    imageUrl?: string;
    thumbnailUrl?: string;
    description?: string;
    photographer?: string;
    photographerUrl?: string;
    message?: string;
  }> => {
    try {
      const response = await apiRequest<any>(`/images/unsplash?query=${encodeURIComponent(recipeName)}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch recipe image:', error);
      return {
        success: false,
        message: 'Failed to fetch recipe image'
      };
    }
  },
};

// Meal Planning API functions
export const mealPlanAPI = {
  // Get meal plan for a specific date
  getMealPlan: async (startDate: string, endDate: string): Promise<{
    mealSlots: MealSlot[];
    success: boolean;
    message?: string;
  }> => {
    try {
      // For now, get meal plan for the start date (can be enhanced for date ranges)
      const mealPlans = await apiRequest<any[]>(`/meal-plans?date=${startDate}`);
      
      const mealSlots: MealSlot[] = mealPlans.map(plan => ({
        id: plan.id,
        date: plan.date,
        mealType: plan.meal_type,
        recipes: plan.recipes ? [{
          id: plan.recipes.id,
          name: plan.recipes.name,
          description: plan.recipes.description,
          ingredients: [],
          steps: [],
          prepTime: plan.recipes.prep_time,
          cookTime: plan.recipes.cook_time,
          servings: plan.recipes.servings,
          nutrition: undefined,
          tags: [],
          imageUrl: plan.recipes.image_url,
          createdAt: new Date(),
          updatedAt: new Date()
        }] : []
      }));
      
      return {
        mealSlots,
        success: true
      };
    } catch (error) {
      console.error('Failed to fetch meal plan:', error);
      return {
        mealSlots: [],
        success: false,
        message: 'Failed to fetch meal plan'
      };
    }
  },

  // Add recipe to meal slot
  addRecipeToSlot: async (data: {
    date: string;
    mealType: string;
    recipeId: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      await apiRequest('/meal-plans', {
        method: 'POST',
        body: JSON.stringify({
          date: data.date,
          mealType: data.mealType,
          recipeId: data.recipeId
        }),
      });
      
      return {
        success: true,
        message: 'Recipe added to meal plan successfully'
      };
    } catch (error) {
      console.error('Failed to add recipe to meal plan:', error);
      return {
        success: false,
        message: 'Failed to add recipe to meal plan'
      };
    }
  },

  // Remove recipe from meal slot
  removeRecipeFromSlot: async (data: {
    date: string;
    mealType: string;
    recipeId: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      // First get the meal plan to find the ID to delete
      const mealPlans = await apiRequest<any[]>(`/meal-plans?date=${data.date}`);
      const mealPlan = mealPlans.find(plan => 
        plan.meal_type === data.mealType && plan.recipe_id === data.recipeId
      );
      
      if (mealPlan) {
        await apiRequest(`/meal-plans?id=${mealPlan.id}`, {
          method: 'DELETE',
        });
      }
      
      return {
        success: true,
        message: 'Recipe removed from meal plan successfully'
      };
    } catch (error) {
      console.error('Failed to remove recipe from meal plan:', error);
      return {
        success: false,
        message: 'Failed to remove recipe from meal plan'
      };
    }
  },

  // Update meal plan for a week (batch operation)
  updateWeekPlan: async (mealSlots: MealSlot[]): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      // For now, we'll implement this as individual operations
      // This could be optimized with a batch API endpoint later
      const promises = mealSlots.map(slot => {
        if (slot.recipes.length > 0) {
          return mealPlanAPI.addRecipeToSlot({
            date: slot.date,
            mealType: slot.mealType,
            recipeId: slot.recipes[0].id
          });
        }
        return Promise.resolve({ success: true });
      });
      
      await Promise.all(promises);
      
      return {
        success: true,
        message: 'Week meal plan updated successfully'
      };
    } catch (error) {
      console.error('Failed to update week meal plan:', error);
      return {
        success: false,
        message: 'Failed to update week meal plan'
      };
    }
  },
};

// Utility functions for local development/fallback
export const mockAPI = {
  // Create mock recipe data for development
  createMockRecipe: (overrides: Partial<Recipe> = {}): Recipe => ({
    id: `recipe-${Date.now()}`,
    name: 'Mock Recipe',
    description: 'A delicious mock recipe for development',
    ingredients: [
      { name: 'Main ingredient', amount: '2', unit: 'cups' },
      { name: 'Secondary ingredient', amount: '1', unit: 'tbsp' },
    ],
    steps: [
      { number: 1, instruction: 'Prepare ingredients' },
      { number: 2, instruction: 'Cook according to instructions' },
    ],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    nutrition: {
      calories: 350,
      protein: 15,
      carbs: 40,
      fat: 12,
    },
    tags: ['Mock', 'Development'],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  // Use localStorage as temporary persistence
  saveToLocalStorage: (key: string, data: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  loadFromLocalStorage: <T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },
};
