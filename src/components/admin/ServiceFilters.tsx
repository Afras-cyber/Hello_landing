
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from 'lucide-react';

interface ServiceCategory {
  id: string;
  name: string;
}

interface ServiceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  featuredFilter: string;
  onFeaturedFilterChange: (value: string) => void;
  categories: ServiceCategory[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  featuredFilter,
  onFeaturedFilterChange,
  categories,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Hae palveluita..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Kaikki kategoriat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Kaikki kategoriat</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Featured Filter */}
        <Select value={featuredFilter} onValueChange={onFeaturedFilterChange}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Kaikki palvelut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Kaikki palvelut</SelectItem>
            <SelectItem value="featured">Vain suositellut</SelectItem>
            <SelectItem value="not-featured">Ei suositellut</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <X className="h-4 w-4" />
            Tyhjennä
          </Button>
        )}
      </div>
    </div>
  );
};

export default ServiceFilters;
