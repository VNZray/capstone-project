import React from 'react';
import Button from '@/src/components/Button';
import "./CategoryFilter.css";

interface CategoryFilterProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  onCategorySelect,
  selectedCategory,
}) => {
  return (
    <div className="category-filter-container">
      <div className="categories-scroll">
        {categories.map((category, index) => (
          <Button
            key={index}
            onClick={() => onCategorySelect(category)}
            variant={selectedCategory === category ? 'solid' : 'soft'}
            colorScheme="primary"
            size="sm"
            sx={{ borderRadius: '20px' }}
            style={{ whiteSpace: 'nowrap' }}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
