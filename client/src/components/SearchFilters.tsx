import { COMPONENT_CATEGORIES } from '@shared/schema';
import { Search, X, Filter } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  onClearFilters,
}: SearchFiltersProps) {
  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || sortBy !== 'relevance';

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border" data-testid="container-search-filters">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search parts (GPU, RTX 4080, ASUS...)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
          data-testid="input-search"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {COMPONENT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-asc">Price: Low → High</SelectItem>
            <SelectItem value="price-desc">Price: High → Low</SelectItem>
            <SelectItem value="name-asc">Name: A → Z</SelectItem>
            <SelectItem value="name-desc">Name: Z → A</SelectItem>
            <SelectItem value="brand">Brand</SelectItem>
          </SelectContent>
        </Select>

        {/* Price Range - Simplified for prototype */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex-shrink-0"
            data-testid="button-clear-filters"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {selectedCategory}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => onCategoryChange('all')}
              />
            </Badge>
          )}
          {sortBy !== 'relevance' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sort: {sortBy}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => onSortChange('relevance')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
