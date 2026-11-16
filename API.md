# API Resep Publik

Situs menyediakan data resep publik dalam format JSON di:

`/api/recipes.json`

Contoh: `https://resep-makanan-gamma.vercel.app/api/recipes.json`

Endpoint mengembalikan array resep Indonesia, termasuk makanan Nusantara dan minuman tradisional. Halaman utama mengambil data ini langsung dari domain situs, sehingga tidak memerlukan API key, server API pihak ketiga, atau konfigurasi CORS. Bentuk data memuat `id`, `title`, `category`, `description`, `cookingTime`, `servings`, `thumbnail`, `ingredients`, dan `steps`.
