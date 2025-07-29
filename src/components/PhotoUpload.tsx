"use client";

import { useState, useRef } from "react";
import { Recipe } from '@/types/recipe';
import { recipeAPI } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";

interface PhotoUploadProps {
  onPhotoAnalyzed: (recipe: Recipe) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  onBackToText?: () => void;
}

export default function PhotoUpload({ onPhotoAnalyzed, isAnalyzing, setIsAnalyzing, onBackToText }: PhotoUploadProps) {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setUploadedImage(imageUrl);
      analyzeImage(file);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    
    // Use real AI photo analysis API
    const response = await recipeAPI.generateFromPhoto(file);
    
    if (response.success && response.recipe) {
      // Add the uploaded image URL to the recipe
      const recipeWithImage = {
        ...response.recipe,
        imageUrl: URL.createObjectURL(file)
      };
      onPhotoAnalyzed(recipeWithImage);
    } else {
      throw new Error(response.message || 'Failed to analyze photo');
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12"></div>
            <h3 className="text-base sm:text-lg font-semibold px-2">Upload Photo for Recipe Suggestions</h3>
            {onBackToText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToText}
                className="flex items-center space-x-1 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Text</span>
                <span className="sm:hidden">Back</span>
              </Button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            Take a photo of <strong>ingredients</strong> (to get recipe ideas) or a <strong>finished dish</strong> (to recreate it)
          </p>
        </div>

        {!uploadedImage ? (
          <div
            className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-center space-x-3 sm:space-x-4">
                <Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-muted-foreground" />
                <Camera className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-muted-foreground" />
              </div>
              
              <div>
                <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Drop your photo here</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Upload ingredients or dishes • AI will suggest recipes
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3 justify-center">
                <Button onClick={openFileDialog} variant="outline" className="flex items-center justify-center space-x-2 w-full py-3">
                  <Upload className="h-4 w-4" />
                  <span>Upload Photo of Ingredients/Dish</span>
                </Button>
                
                <Button onClick={openCamera} variant="outline" className="flex items-center justify-center space-x-2 w-full py-3">
                  <Camera className="h-4 w-4" />
                  <span>Take Photo of Ingredients/Dish</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="relative">
              <div className="relative w-full h-48 sm:h-56 lg:h-64 rounded-lg overflow-hidden">
                <Image
                  src={uploadedImage}
                  alt="Uploaded food photo"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={clearImage}
                disabled={isAnalyzing}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            {isAnalyzing && (
              <div className="text-center py-3 sm:py-4">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-muted-foreground px-2">
                  Analyzing your photo and generating recipe suggestions...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
