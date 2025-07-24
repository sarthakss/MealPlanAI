"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MealItem {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner";
  recipeId?: string;
}

interface DayMeals {
  breakfast?: MealItem;
  lunch?: MealItem;
  dinner?: MealItem;
}

interface MealCalendarProps {
  onAddMeal?: (day: string, mealType: string) => void;
  onViewMeal?: (mealId: string) => void;
}

const MealCalendar = ({
  onAddMeal = () => {},
  onViewMeal = () => {},
}: MealCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [selectedMeal, setSelectedMeal] = useState<{
    day: string;
    type: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sample data - in a real app this would come from a database or API
  const [weeklyMeals, setWeeklyMeals] = useState<Record<string, DayMeals>>(
    () => {
      const days = getDaysOfWeek(currentWeek);
      const meals: Record<string, DayMeals> = {};

      days.forEach((day) => {
        const dateStr = formatDate(day);
        meals[dateStr] = {
          breakfast:
            day.getDay() === 1
              ? { id: "1", name: "Avocado Toast", type: "breakfast" }
              : undefined,
          lunch:
            day.getDay() === 2
              ? { id: "2", name: "Chicken Caesar Salad", type: "lunch" }
              : undefined,
          dinner:
            day.getDay() === 3
              ? { id: "3", name: "Spaghetti Bolognese", type: "dinner" }
              : undefined,
        };
      });

      return meals;
    },
  );

  // Get array of dates for the current week
  function getDaysOfWeek(date: Date): Date[] {
    const days: Date[] = [];
    const currentDate = new Date(date);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

    const monday = new Date(currentDate.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }

    return days;
  }

  // Format date as YYYY-MM-DD
  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  // Format date for display
  function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  // Navigate to previous week
  function previousWeek() {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  }

  // Navigate to next week
  function nextWeek() {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  }

  // Handle adding a meal
  function handleAddMeal(day: string, mealType: string) {
    setSelectedMeal({ day, type: mealType });
    setIsDialogOpen(true);
    onAddMeal(day, mealType);
  }

  // Handle viewing a meal
  function handleViewMeal(mealId: string) {
    onViewMeal(mealId);
  }

  const daysOfWeek = getDaysOfWeek(currentWeek);

  return (
    <div className="bg-background w-full max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Meal Calendar</h2>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="font-medium">
            {formatDisplayDate(daysOfWeek[0])} -{" "}
            {formatDisplayDate(daysOfWeek[6])}
          </span>
          <Button variant="outline" onClick={nextWeek}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {daysOfWeek.map((day) => {
          const dateStr = formatDate(day);
          const meals = weeklyMeals[dateStr] || {};

          return (
            <Card key={dateStr} className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-center">
                  {formatDisplayDate(day)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="breakfast" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                    <TabsTrigger value="lunch">Lunch</TabsTrigger>
                    <TabsTrigger value="dinner">Dinner</TabsTrigger>
                  </TabsList>

                  <TabsContent value="breakfast" className="space-y-2">
                    {meals.breakfast ? (
                      <div
                        className="p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                        onClick={() => handleViewMeal(meals.breakfast!.id)}
                      >
                        {meals.breakfast.name}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-16 border-dashed flex flex-col items-center justify-center"
                        onClick={() => handleAddMeal(dateStr, "breakfast")}
                      >
                        <Plus className="h-5 w-5 mb-1" />
                        <span>Add Breakfast</span>
                      </Button>
                    )}
                  </TabsContent>

                  <TabsContent value="lunch" className="space-y-2">
                    {meals.lunch ? (
                      <div
                        className="p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                        onClick={() => handleViewMeal(meals.lunch!.id)}
                      >
                        {meals.lunch.name}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-16 border-dashed flex flex-col items-center justify-center"
                        onClick={() => handleAddMeal(dateStr, "lunch")}
                      >
                        <Plus className="h-5 w-5 mb-1" />
                        <span>Add Lunch</span>
                      </Button>
                    )}
                  </TabsContent>

                  <TabsContent value="dinner" className="space-y-2">
                    {meals.dinner ? (
                      <div
                        className="p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                        onClick={() => handleViewMeal(meals.dinner!.id)}
                      >
                        {meals.dinner.name}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-16 border-dashed flex flex-col items-center justify-center"
                        onClick={() => handleAddMeal(dateStr, "dinner")}
                      >
                        <Plus className="h-5 w-5 mb-1" />
                        <span>Add Dinner</span>
                      </Button>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog for adding a meal - in a real app this would be more complex */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {selectedMeal?.type} for {selectedMeal?.day}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              This is where you would add a form to select or create a recipe.
              <br />
              You could integrate with the RecipeForm and RecipeLibrary
              components here.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealCalendar;
