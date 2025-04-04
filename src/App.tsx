// src/App.tsx
import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar/SearchBar';
import { ModelViewer } from './components/ModelViewer/ModelViewer';
import { EditPanel } from './components/EditPanel/EditPanel';
import { Model3D, ModelCategory } from './types/models';
import { ModelsService } from './services/ModelsService';

const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<ModelCategory | 'all'>('all');
  const [searchResults, setSearchResults] = useState<Model3D[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Wczytaj wszystkie modele przy pierwszym renderowaniu
  useEffect(() => {
    loadModels('', 'all');
  }, []);

  const loadModels = async (query: string, category: ModelCategory | 'all') => {
    setIsLoading(true);
    try {
      console.log('Szukam modeli:', { query, category }); // Debug log
      const foundModels = await ModelsService.searchModels(query, category);
      console.log('Znalezione modele:', foundModels); // Debug log
      setSearchResults(foundModels);
      
      // Jeśli znaleziono tylko jeden model, wybierz go automatycznie
      if (foundModels.length === 1) {
        setSelectedModel(foundModels[0]);
      }
    } catch (error) {
      console.error('Błąd podczas wyszukiwania modeli:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string, category?: ModelCategory | 'all') => {
    console.log('Rozpoczynam wyszukiwanie:', { query, category }); // Debug log
    setSearchQuery(query);
    const searchCategory = category || currentCategory;
    setCurrentCategory(searchCategory);
    await loadModels(query, searchCategory);
  };

  const handleModelSelect = (model: Model3D) => {
    setSelectedModel(model);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Generator Modeli 3D</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Panel wyszukiwania */}
          <div className="col-span-12">
            <SearchBar 
              onSearch={handleSearch}
              initialCategory={currentCategory}
              initialQuery={searchQuery}
            />
          </div>

          {/* Lista wyników wyszukiwania */}
          {searchResults.length > 0 && (
            <div className="col-span-12 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`p-4 rounded-lg transition-all ${
                      selectedModel?.id === model.id
                        ? 'bg-primary-100 border-2 border-primary-500'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-full h-24 flex items-center justify-center mb-2">
                        {/* Tutaj możemy dodać miniaturkę modelu */}
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500">{model.name[0]}</span>
                        </div>
                      </div>
                      <p className="font-medium text-gray-800">{model.name}</p>
                      <p className="text-sm text-gray-500">{model.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Panel edycji */}
          <div className="col-span-3">
            <EditPanel
              model={selectedModel}
              onModelUpdate={(updatedModel) => setSelectedModel(updatedModel)}
            />
          </div>

          {/* Panel podglądu */}
          <div className="col-span-9">
            <div className="relative">
              <ModelViewer model={selectedModel} />
              {!selectedModel && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                  <p className="text-lg text-gray-600">
                    {isLoading ? 'Ładowanie...' : 'Wybierz model, aby rozpocząć'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;