import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Unsplash API endpoint
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' food dish')}&per_page=1&orientation=landscape`
    
    const response = await fetch(unsplashUrl, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const image = data.results[0]
      return NextResponse.json({
        success: true,
        imageUrl: image.urls.regular,
        thumbnailUrl: image.urls.small,
        description: image.alt_description,
        photographer: image.user.name,
        photographerUrl: image.user.links.html
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No images found for this query'
      })
    }
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch image from Unsplash' 
      },
      { status: 500 }
    )
  }
}
