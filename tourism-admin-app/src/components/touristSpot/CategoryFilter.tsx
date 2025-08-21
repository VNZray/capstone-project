import React from 'react';
import Text from '../Text';
import '../styles/touristspots/CategoryFilter.css';

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
          <button
            key={index}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategorySelect(category)}
          >
            <Text 
              variant="normal" 
              color={selectedCategory === category ? 'white' : 'text-color'}
            >
              {category}
            </Text>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
