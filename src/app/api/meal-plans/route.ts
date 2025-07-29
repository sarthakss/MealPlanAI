import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/meal-plans?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }

    const { data: mealPlans, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        recipes (
          id,
          name,
          description,
          prep_time,
          cook_time,
          servings,
          image_url
        )
      `)
      .eq('date', date)
      .order('meal_type')

    if (error) throw error
    return NextResponse.json(mealPlans)
  } catch (error) {
    console.error('Error fetching meal plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meal plans' },
      { status: 500 }
    )
  }
}

// POST /api/meal-plans
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, mealType, recipeId } = body

    const { data: mealPlan, error } = await supabase
      .from('meal_plans')
      .insert({
        date,
        meal_type: mealType,
        recipe_id: recipeId
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(mealPlan)
  } catch (error) {
    console.error('Error creating meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to create meal plan' },
      { status: 500 }
    )
  }
}

// DELETE /api/meal-plans - Remove meal from plan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID parameter required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ message: 'Meal plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete meal plan' },
      { status: 500 }
    )
  }
}
