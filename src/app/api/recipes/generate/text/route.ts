import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional chef AI. Generate detailed recipes in JSON format with this exact structure:
          {
            "name": "Recipe Name",
            "description": "Brief description",
            "prepTime": 15,
            "cookTime": 30,
            "servings": 4,
            "ingredients": [
              {"name": "ingredient", "amount": "1", "unit": "cup"}
            ],
            "steps": ["Step 1 instruction", "Step 2 instruction"],
            "nutrition": {
              "calories": 250,
              "protein": 15,
              "carbs": 30,
              "fat": 8
            },
            "tags": ["tag1", "tag2"]
          }`
        },
        {
          role: "user",
          content: `Create a recipe for: ${prompt}`
        }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    })

    const recipe = JSON.parse(completion.choices[0].message.content!)
    return NextResponse.json({
      success: true,
      recipe: recipe
    })
  } catch (error) {
    console.error('Error generating recipe:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate recipe',
        error: 'Failed to generate recipe' 
      },
      { status: 500 }
    )
  }
}
