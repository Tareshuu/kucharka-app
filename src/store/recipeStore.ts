import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Recipe, RecipeMeta, Ingredient, ProcessStep, RecipePhoto, CustomCategory, IngredientDBEntry } from '../types/recipe'
import { getSeedRecipes } from '../data/seedRecipes'

interface RecipeState {
  recipes: Recipe[]
  customCategories: CustomCategory[]
  customIngredients: IngredientDBEntry[]

  // Recipe CRUD
  createRecipe: (meta: Partial<RecipeMeta>) => Recipe
  updateRecipe: (id: string, partial: Partial<Recipe>) => void
  updateRecipeMeta: (id: string, partial: Partial<RecipeMeta>) => void
  deleteRecipe: (id: string) => void
  toggleStarred: (id: string) => void

  // Ingredients
  addIngredient: (recipeId: string, ingredient: Omit<Ingredient, 'id'>) => void
  updateIngredient: (recipeId: string, ingredientId: string, partial: Partial<Ingredient>) => void
  deleteIngredient: (recipeId: string, ingredientId: string) => void
  reorderIngredients: (recipeId: string, newOrder: Ingredient[]) => void

  // Process steps
  addStep: (recipeId: string, step: Omit<ProcessStep, 'id' | 'order'>) => void
  updateStep: (recipeId: string, stepId: string, partial: Partial<ProcessStep>) => void
  deleteStep: (recipeId: string, stepId: string) => void
  reorderSteps: (recipeId: string, newOrder: ProcessStep[]) => void

  // Photos
  addPhoto: (recipeId: string, photo: Omit<RecipePhoto, 'id'>) => void
  updatePhoto: (recipeId: string, photoId: string, partial: Partial<RecipePhoto>) => void
  deletePhoto: (recipeId: string, photoId: string) => void
  setPrimaryPhoto: (recipeId: string, photoId: string) => void

  // Notes
  updateNotes: (recipeId: string, notes: string) => void

  // Categories
  addCustomCategory: (name: string, icon: string) => void
  deleteCustomCategory: (id: string) => void

  // Custom ingredients
  addCustomIngredient: (entry: Omit<IngredientDBEntry, 'id'>) => void
  deleteCustomIngredient: (id: string) => void

  // Category order (manual drag & drop order per category)
  categoryOrder: Record<string, string[]>
  setCategoryOrder: (categoryId: string, recipeIds: string[]) => void

  // Selectors
  getRecipeById: (id: string) => Recipe | undefined
  getRecipesByCategory: (category: string) => Recipe[]
  searchRecipes: (query: string) => Recipe[]
}

const DEFAULT_META: RecipeMeta = {
  title: '',
  category: 'klobasy',
  description: '',
  baseWeight: 1000,
  tags: [],
  starred: false,
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: getSeedRecipes(),
      customCategories: [],
      customIngredients: [],
      categoryOrder: {},

      createRecipe: (meta) => {
        const recipe: Recipe = {
          id: uuidv4(),
          meta: { ...DEFAULT_META, ...meta },
          ingredients: [],
          process: [],
          notes: '',
          photos: [],
          sourceType: 'manual',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((s) => ({ recipes: [...s.recipes, recipe] }))
        return recipe
      },

      updateRecipe: (id, partial) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === id ? { ...r, ...partial, updatedAt: new Date().toISOString() } : r
          ),
        })),

      updateRecipeMeta: (id, partial) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === id
              ? { ...r, meta: { ...r.meta, ...partial }, updatedAt: new Date().toISOString() }
              : r
          ),
        })),

      deleteRecipe: (id) =>
        set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),

      toggleStarred: (id) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === id
              ? { ...r, meta: { ...r.meta, starred: !r.meta.starred }, updatedAt: new Date().toISOString() }
              : r
          ),
        })),

      addIngredient: (recipeId, ingredient) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  ingredients: [...r.ingredients, { ...ingredient, id: uuidv4() }],
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      updateIngredient: (recipeId, ingredientId, partial) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  ingredients: r.ingredients.map((i) =>
                    i.id === ingredientId ? { ...i, ...partial } : i
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      deleteIngredient: (recipeId, ingredientId) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  ingredients: r.ingredients.filter((i) => i.id !== ingredientId),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      reorderIngredients: (recipeId, newOrder) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? { ...r, ingredients: newOrder, updatedAt: new Date().toISOString() }
              : r
          ),
        })),

      addStep: (recipeId, step) =>
        set((s) => ({
          recipes: s.recipes.map((r) => {
            if (r.id !== recipeId) return r
            const newStep: ProcessStep = {
              ...step,
              id: uuidv4(),
              order: r.process.length,
            }
            return {
              ...r,
              process: [...r.process, newStep],
              updatedAt: new Date().toISOString(),
            }
          }),
        })),

      updateStep: (recipeId, stepId, partial) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  process: r.process.map((p) => (p.id === stepId ? { ...p, ...partial } : p)),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      deleteStep: (recipeId, stepId) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  process: r.process
                    .filter((p) => p.id !== stepId)
                    .map((p, i) => ({ ...p, order: i })),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      reorderSteps: (recipeId, newOrder) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  process: newOrder.map((p, i) => ({ ...p, order: i })),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      addPhoto: (recipeId, photo) =>
        set((s) => ({
          recipes: s.recipes.map((r) => {
            if (r.id !== recipeId) return r
            const newPhoto: RecipePhoto = { ...photo, id: uuidv4() }
            const photos = r.photos.length === 0
              ? [{ ...newPhoto, isPrimary: true }]
              : [...r.photos, newPhoto]
            return { ...r, photos, updatedAt: new Date().toISOString() }
          }),
        })),

      updatePhoto: (recipeId, photoId, partial) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  photos: r.photos.map((p) => (p.id === photoId ? { ...p, ...partial } : p)),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      deletePhoto: (recipeId, photoId) =>
        set((s) => ({
          recipes: s.recipes.map((r) => {
            if (r.id !== recipeId) return r
            const filtered = r.photos.filter((p) => p.id !== photoId)
            // Pokud se smazala primární, nastavit první jako primární
            if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
              filtered[0].isPrimary = true
            }
            return { ...r, photos: filtered, updatedAt: new Date().toISOString() }
          }),
        })),

      setPrimaryPhoto: (recipeId, photoId) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  photos: r.photos.map((p) => ({ ...p, isPrimary: p.id === photoId })),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      updateNotes: (recipeId, notes) =>
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? { ...r, notes, updatedAt: new Date().toISOString() }
              : r
          ),
        })),

      addCustomCategory: (name, icon) =>
        set((s) => ({
          customCategories: [...s.customCategories, { id: uuidv4(), name, icon }],
        })),

      deleteCustomCategory: (id) =>
        set((s) => ({
          customCategories: s.customCategories.filter((c) => c.id !== id),
        })),

      addCustomIngredient: (entry) =>
        set((s) => ({
          customIngredients: [...s.customIngredients, { ...entry, id: uuidv4() }],
        })),

      deleteCustomIngredient: (id) =>
        set((s) => ({
          customIngredients: s.customIngredients.filter((i) => i.id !== id),
        })),

      setCategoryOrder: (categoryId, recipeIds) =>
        set((s) => ({
          categoryOrder: { ...s.categoryOrder, [categoryId]: recipeIds },
        })),

      getRecipeById: (id) => get().recipes.find((r) => r.id === id),

      getRecipesByCategory: (category) =>
        get().recipes.filter((r) => r.meta.category === category),

      searchRecipes: (query) => {
        if (!query.trim()) return get().recipes
        const q = query.toLowerCase()
        return get().recipes.filter(
          (r) =>
            r.meta.title.toLowerCase().includes(q) ||
            r.meta.description.toLowerCase().includes(q) ||
            r.meta.tags.some((t) => t.toLowerCase().includes(q)) ||
            r.ingredients.some((i) => i.name.toLowerCase().includes(q))
        )
      },
    }),
    {
      name: 'kucharka-recipes',
    }
  )
)
