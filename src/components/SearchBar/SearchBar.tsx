// src/components/SearchBar/SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ModelCategory } from '../../types/models';

interface SearchBarProps {
  onSearch: (query: string, category?: ModelCategory | 'all') => void;
  initialQuery?: string;
  initialCategory?: ModelCategory | 'all';
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  initialQuery = '', 
  initialCategory = 'all' 
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | 'all'>(initialCategory);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'all', label: 'Wszystkie kategorie' },
    { value: 'mechanical', label: 'Części mechaniczne' },
    { value: 'geometric', label: 'Kształty geometryczne' },
    { value: 'everyday', label: 'Przedmioty codzienne' },
  ];

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Wyszukiwanie:', { query, selectedCategory }); // Debug log
    onSearch(query, selectedCategory);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSearch(tag, selectedCategory);
  };

  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Wyszukaj model..."
              className="input-field"
              aria-label="Wyszukaj model"
            />
          </div>
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => {
                const newCategory = e.target.value as ModelCategory | 'all';
                setSelectedCategory(newCategory);
                onSearch(query, newCategory);
              }}
              className="input-field"
              aria-label="Wybierz kategorię"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary md:w-auto">
            Szukaj
          </button>
        </div>
        
        {/* Popularne tagi */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-sm text-gray-500">Popularne:</span>
          {['Śruba', 'Nakrętka', 'Kostka', 'Sześcian', 'Kula'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};