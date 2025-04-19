import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, Award, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandOfTheDay } from "@shared/schema";
import { formatDistance } from "date-fns";

interface BrandOfTheDayCardProps {
  brand: BrandOfTheDay;
  onShare?: (brand: BrandOfTheDay) => void;
}

export function BrandOfTheDayCard({ brand, onShare }: BrandOfTheDayCardProps) {
  const formattedDate = brand.brandDate 
    ? formatDistance(new Date(brand.brandDate), new Date(), { addSuffix: true })
    : "";

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarImage src={brand.user?.photoURL || undefined} alt={brand.user?.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {brand.user?.name?.substring(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{brand.user?.name}</CardTitle>
            <CardDescription>{brand.user?.title}</CardDescription>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border-amber-200">
          <Award className="h-4 w-4" />
          <span>Brand of the Day</span>
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm text-muted-foreground">{brand.industry}</span>
            <span className="text-sm text-muted-foreground mx-2">•</span>
            <span className="text-sm text-muted-foreground">{brand.domain}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{brand.brandValueScore}</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Selected {formattedDate}</p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={() => onShare && onShare(brand)}
          disabled={brand.shared}
        >
          <Share2 className="h-4 w-4" />
          {brand.shared ? "Already Shared" : "Share this recognition"}
        </Button>
      </CardFooter>
    </Card>
  );
}