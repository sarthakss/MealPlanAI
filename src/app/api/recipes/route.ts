import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/recipes - Get all recipes
export async function GET() {
  try {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients (*),
        recipe_steps (*),
        nutrition (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform the data to match frontend expectations
    const transformedRecipes = (recipes || []).map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients?.map((ing: any) => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit
      })) || [],
      steps: recipe.recipe_steps?.map((step: any) => ({
        number: step.step_number,
        instruction: step.instruction
      })) || [],
      prepTime: recipe.prep_time,
      cookTime: recipe.cook_time,
      servings: recipe.servings,
      nutrition: recipe.nutrition?.[0] ? {
        calories: recipe.nutrition[0].calories,
        protein: recipe.nutrition[0].protein,
        carbs: recipe.nutrition[0].carbs,
        fat: recipe.nutrition[0].fat
      } : undefined,
      tags: recipe.tags || [],
      imageUrl: recipe.image_url,
      createdAt: new Date(recipe.created_at),
      updatedAt: new Date(recipe.updated_at)
    })) || []
    
    return NextResponse.json({
      success: true,
      recipes: transformedRecipes,
      pagination: {
        page: 1,
        limit: transformedRecipes.length,
        total: transformedRecipes.length
      }
    })
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch recipes',
        recipes: [],
        pagination: { page: 1, limit: 0, total: 0 }
      },
      { status: 500 }
    )
  }
}

// POST /api/recipes - Create new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, ingredients, steps, prepTime, cookTime, servings, nutrition, tags, imageUrl } = body

    // Insert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        name,
        description,
        prep_time: prepTime,
        cook_time: cookTime,
        servings,
        image_url: imageUrl,
        tags
      })
      .select()
      .single()

    if (recipeError) throw recipeError

    const recipeId = recipe.id

    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
      const ingredientsData = ingredients.map((ing: any, index: number) => ({
        recipe_id: recipeId,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        order_index: index
      }))

      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(ingredientsData)

      if (ingredientsError) throw ingredientsError
    }

    // Insert steps
    if (steps && steps.length > 0) {
      const stepsData = steps.map((step: string, index: number) => ({
        recipe_id: recipeId,
        step_number: index + 1,
        instruction: step
      }))

      const { error: stepsError } = await supabase
        .from('recipe_steps')
        .insert(stepsData)

      if (stepsError) throw stepsError
    }

    // Insert nutrition
    if (nutrition) {
      const { error: nutritionError } = await supabase
        .from('nutrition')
        .insert({
          recipe_id: recipeId,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat
        })

      if (nutritionError) throw nutritionError
    }

    return NextResponse.json({ id: recipeId, message: 'Recipe created successfully' })
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}
