import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key (for admin operations)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// Type definitions for better TypeScript support
export type Recipe = {
  id: string
  name: string
  description: string | null
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  image_url: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  ingredients?: Ingredient[]
  recipe_steps?: RecipeStep[]
  nutrition?: Nutrition
}

export type Ingredient = {
  id: string
  recipe_id: string
  name: string
  amount: string | null
  unit: string | null
  order_index: number | null
}

export type RecipeStep = {
  id: string
  recipe_id: string
  step_number: number
  instruction: string
}

export type Nutrition = {
  id: string
  recipe_id: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

export type MealPlan = {
  id: string
  date: string
  meal_type: string
  recipe_id: string | null
  created_at: string
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('recipes').select('count')
    if (error) throw error
    console.log('✅ Supabase connection successful!')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}
