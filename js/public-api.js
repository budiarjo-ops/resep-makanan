// The static JSON file is a public, same-origin API endpoint served with the site.
const PUBLIC_RECIPE_API = new URL('api/recipes.json', document.baseURI).href;
const API_RECIPE_ID_OFFSET = 1000000000;

function mapPublicRecipe(item) {
  const categoryText = String(item.category || '').toLowerCase();
  const isDrink = /minum|drink|beverage/.test(categoryText);
  const isDessert = /dessert|penutup|kue/.test(categoryText);
  return {
    id: API_RECIPE_ID_OFFSET + Number(item.id),
    publicApiId: Number(item.id),
    source: 'public-api',
    name: item.title || 'Resep Indonesia',
    category: isDrink ? 'minuman' : isDessert ? 'dessert' : 'makan-siang',
    image: item.thumbnail || 'assets/hero_banner.jpg',
    time: Number(item.cookingTime) || 30,
    servings: Number(item.servings) || 2,
    calories: 0,
    difficulty: 'Mudah',
    rating: 4.8,
    reviews: 0,
    description: item.description || `Resep ${item.title || 'Indonesia'} dari API resep publik.`,
    tags: [isDrink ? 'minuman' : isDessert ? 'dessert' : 'nusantara', 'resep-api'],
    ingredients: (item.ingredients || []).map(ingredient => ({
      amount: ingredient.quantity || 'secukupnya',
      item: ingredient.name || ingredient.ingredient || 'Bahan'
    })),
    steps: (item.steps || []).map((step, index) => ({
      step: Number(step.stepNumber) || index + 1,
      instruction: step.intruction || step.instruction || step.description || String(step)
    })),
    nutrition: { carbs: 0, protein: 0, fat: 0, fiber: 0 }
  };
}

async function readPublicRecipeData() {
  const response = await fetch(PUBLIC_RECIPE_API, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`API resep merespons ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Format API resep tidak valid');
  return data;
}

async function getPublicRecipes() {
  return (await readPublicRecipeData())
    .filter(item => item && Number.isFinite(Number(item.id)))
    .map(mapPublicRecipe);
}

async function getPublicRecipe(id) {
  const item = (await readPublicRecipeData()).find(recipe => Number(recipe.id) === Number(id));
  return item ? mapPublicRecipe(item) : null;
}
