import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image and create a detailed recipe in JSON format with this exact structure:
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
              }
              Include estimated prep time, cook time, ingredients, steps, and nutrition.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })

    const recipeText = completion.choices[0].message.content
    // Try to parse as JSON, fallback to text parsing if needed
    let recipe
    try {
      recipe = JSON.parse(recipeText!)
    } catch {
      // If not valid JSON, return a structured response
      recipe = {
        name: "Recipe from Image",
        description: recipeText,
        prepTime: 30,
        cookTime: 45,
        servings: 4,
        ingredients: [],
        steps: [recipeText || "Follow the description above"],
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        tags: ["photo-generated"]
      }
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error generating recipe from photo:', error)
    return NextResponse.json(
      { error: 'Failed to generate recipe from photo' },
      { status: 500 }
    )
  }
}
