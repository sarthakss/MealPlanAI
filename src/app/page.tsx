"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, ChefHat, Video, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold">
            Loading your meal planner...
          </h2>
          <p className="text-muted-foreground">
            Setting up your weekly calendar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Meal Planner</h1>
          </div>
          <Button
            className="flex items-center space-x-2"
            onClick={() => router.push("/recipe")}
          >
            <Plus className="h-4 w-4" />
            <span>Add Recipe</span>
          </Button>
        </div>

        {/* Weekly Calendar Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>This Week</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <div key={day} className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-center">{day}</h3>

                  {/* Breakfast */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Breakfast
                    </p>
                    <div className="h-16 border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center hover:border-primary/50 cursor-pointer transition-colors">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Lunch
                    </p>
                    <div className="h-16 border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center hover:border-primary/50 cursor-pointer transition-colors">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Dinner
                    </p>
                    <div className="h-16 border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center hover:border-primary/50 cursor-pointer transition-colors">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/recipe?tab=generate")}
          >
            <CardContent className="p-6 text-center space-y-2">
              <ChefHat className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Generate Recipe</h3>
              <p className="text-sm text-muted-foreground">
                Enter a dish name and get AI-generated recipes
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/recipe?tab=import")}
          >
            <CardContent className="p-6 text-center space-y-2">
              <Video className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Import from Video</h3>
              <p className="text-sm text-muted-foreground">
                Convert YouTube/TikTok videos to recipes
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/recipe?tab=library")}
          >
            <CardContent className="p-6 text-center space-y-2">
              <BookOpen className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Recipe Library</h3>
              <p className="text-sm text-muted-foreground">
                Browse and manage your saved recipes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
