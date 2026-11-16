// Public Indonesian recipe API client.
const PUBLIC_RECIPE_API = 'https://food-api-v10.vercel.app/api';
const API_RECIPE_ID_OFFSET = 1000000000;

function mapPublicRecipe(item) {
  const categoryText = String(item.category || '').toLowerCase();
  const isDrink = /minum|drink|beverage/.test(categoryText);
  const isDessert = /dessert|penutup|kue/.test(categoryText);
  return {
    id: API_RECIPE_ID_OFFSET + Number(item.id),
    publicApiId: item.id,
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
    description: item.description || `Resep ${item.title || 'Indonesia'} dari Indonesia Food API.`,
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

async function requestPublicRecipes(path) {
  const response = await fetch(`${PUBLIC_RECIPE_API}${path}`);
  if (!response.ok) throw new Error(`API resep merespons ${response.status}`);
  return response.json();
}

async function getPublicRecipes() {
  const results = await Promise.allSettled([
    requestPublicRecipes('/recipes?page=1&size=50'),
    requestPublicRecipes('/recipes?category=Minuman&page=1&size=50')
  ]);
  const items = results.flatMap(result => {
    if (result.status !== 'fulfilled') return [];
    const payload = result.value;
    return Array.isArray(payload) ? payload : payload.data || [];
  });
  const unique = [...new Map(items.filter(item => item && item.id != null).map(item => [String(item.id), item])).values()];
  if (!unique.length && results.every(result => result.status === 'rejected')) {
    throw new Error('API resep sedang tidak dapat dijangkau');
  }
  return unique.map(mapPublicRecipe);
}

async function getPublicRecipe(id) {
  const result = await requestPublicRecipes(`/recipes/${encodeURIComponent(id)}`);
  const item = result.data || result.recipe || result;
  return mapPublicRecipe(item);
}
