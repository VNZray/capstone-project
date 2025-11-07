import React from 'react';
import ResponsiveButton from '@/src/components/ResponsiveButton';
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
          <ResponsiveButton
            key={index}
            onClick={() => onCategorySelect(category)}
            variant={selectedCategory === category ? 'solid' : 'soft'}
            color="primary"
            size="sm"
            radius="20px"
            hoverEffect="lift"
            style={{ whiteSpace: 'nowrap' }}
          >
            {category}
          </ResponsiveButton>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
