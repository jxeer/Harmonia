import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface CulturalFiltersProps {
  onFiltersChange: (filters: {
    specialty?: string;
    culturalBackground?: string;
    language?: string;
    location?: string;
  }) => void;
  isLoading?: boolean;
}

const specialties = [
  "Primary Care",
  "Cardiology", 
  "Dermatology",
  "Endocrinology",
  "Family Medicine",
  "Internal Medicine",
  "Mental Health",
  "Neurology",
  "OB/GYN",
  "Pediatrics",
  "Psychiatry",
  "Psychology",
];

const culturalBackgrounds = [
  "African American",
  "Arab/Middle Eastern",
  "Asian American",
  "Caribbean",
  "East African",
  "Hispanic/Latino",
  "Indigenous/Native American",
  "Jewish",
  "Mediterranean",
  "Nigerian",
  "South Asian",
  "West African",
];

const languages = [
  "Arabic",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "English",
  "French",
  "German",
  "Hindi",
  "Italian",
  "Japanese",
  "Korean",
  "Portuguese",
  "Russian",
  "Spanish",
  "Tagalog",
  "Vietnamese",
  "Yoruba",
];

export default function CulturalFilters({ onFiltersChange, isLoading }: CulturalFiltersProps) {
  const [filters, setFilters] = useState({
    specialty: "",
    culturalBackground: "",
    language: "",
    location: "",
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update active filters display
    const newActiveFilters = Object.entries(newFilters)
      .filter(([_, val]) => val !== "")
      .map(([key, val]) => `${key}: ${val}`);
    setActiveFilters(newActiveFilters);
    
    onFiltersChange(newFilters);
  };

  const clearFilter = (filterKey: string) => {
    updateFilter(filterKey, "");
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      specialty: "",
      culturalBackground: "",
      language: "",
      location: "",
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card className="bg-white rounded-3xl shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-golden-dark flex items-center gap-2">
          <Filter className="w-6 h-6" />
          Find Your Perfect Provider
        </CardTitle>
        <p className="text-warm-brown">Search by specialty, cultural background, and more</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filter Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="specialty" className="block text-sm font-medium text-warm-brown mb-2">
              Specialty
            </Label>
            <Select onValueChange={(value) => updateFilter("specialty", value)} value={filters.specialty}>
              <SelectTrigger className="border-cream focus:ring-golden focus:border-golden">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="culturalBackground" className="block text-sm font-medium text-warm-brown mb-2">
              Cultural Background
            </Label>
            <Select onValueChange={(value) => updateFilter("culturalBackground", value)} value={filters.culturalBackground}>
              <SelectTrigger className="border-cream focus:ring-golden focus:border-golden">
                <SelectValue placeholder="All Backgrounds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Backgrounds</SelectItem>
                {culturalBackgrounds.map((background) => (
                  <SelectItem key={background} value={background}>
                    {background}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language" className="block text-sm font-medium text-warm-brown mb-2">
              Language
            </Label>
            <Select onValueChange={(value) => updateFilter("language", value)} value={filters.language}>
              <SelectTrigger className="border-cream focus:ring-golden focus:border-golden">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Languages</SelectItem>
                {languages.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" className="block text-sm font-medium text-warm-brown mb-2">
              Location
            </Label>
            <Input
              id="location"
              placeholder="City or ZIP code"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="border-cream focus:ring-golden focus:border-golden"
            />
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-warm-brown">Active Filters:</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-warm-brown hover:text-golden text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <Badge
                    key={key}
                    className="bg-golden/10 text-golden-dark border-0 flex items-center gap-1 px-3 py-1"
                  >
                    <span className="capitalize">{key}:</span>
                    <span>{value}</span>
                    <button
                      onClick={() => clearFilter(key)}
                      className="ml-1 hover:bg-golden/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => onFiltersChange(filters)}
            disabled={isLoading}
            className="bg-golden hover:bg-golden-dark text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
          >
            {isLoading ? "Searching..." : "Search Providers"}
          </Button>
        </div>

        {/* Cultural Competency Info */}
        <div className="bg-sunset-gradient/10 rounded-2xl p-4 mt-6">
          <h4 className="font-semibold text-golden-dark mb-2">Why Cultural Competency Matters</h4>
          <p className="text-warm-brown text-sm">
            Our providers understand that effective healthcare goes beyond medical expertise. 
            They honor your cultural background, speak your language, and respect your traditions 
            as part of your healing journey.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
