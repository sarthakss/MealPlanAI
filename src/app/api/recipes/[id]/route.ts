import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/recipes/[id] - Get specific recipe
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients (*),
        recipe_steps (*),
        nutrition (*)
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json(
      { error: 'Recipe not found' },
      { status: 404 }
    )
  }
}

// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ 
      success: true,
      message: 'Recipe deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete recipe' 
      },
      { status: 500 }
    )
  }
}
