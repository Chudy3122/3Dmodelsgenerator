// src/services/ModelsService.ts
import { Model3D, ModelCategory } from '../types/models';
import { allModels, mechanicalModels, geometricModels, everydayModels } from '../models';

export class ModelsService {
  // Pobierz modele według kategorii
  static getModelsByCategory(category: ModelCategory): Model3D[] {
    switch (category) {
      case 'mechanical':
        return mechanicalModels;
      case 'geometric':
        return geometricModels;
      case 'everyday':
        return everydayModels;
      default:
        return [];
    }
  }

  static async searchModels(query: string, category?: ModelCategory | 'all'): Promise<Model3D[]> {
    // Wybierz odpowiednią kolekcję modeli
    let modelsToSearch = category === 'all' ? allModels : this.getModelsByCategory(category as ModelCategory);

    // Filtruj według zapytania
    if (query) {
      const searchQuery = query.toLowerCase();
      modelsToSearch = modelsToSearch.filter(model =>
        model.name.toLowerCase().includes(searchQuery)
      );
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(modelsToSearch);
      }, 100);
    });
  }

  static async getModelById(id: string): Promise<Model3D | null> {
    const model = allModels.find(model => model.id === id);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(model || null);
      }, 100);
    });
  }

  static async getAllModels(): Promise<Model3D[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...allModels]);
      }, 100);
    });
  }
}