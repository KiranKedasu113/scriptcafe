// High quality, dish-accurate Unsplash food image mapping
const SPECIFIC_FOOD_IMAGES = [
  // Teas & Hot Drinks
  { keys: ['irani tea', 'irani black', 'malai tea'], url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80' },
  { keys: ['green tea'], url: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=500&auto=format&fit=crop&q=80' },
  { keys: ['lemon tea'], url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80' },
  { keys: ['coffee', 'cold coffee'], url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80' },
  { keys: ['badam milk', 'rose milk', 'boost', 'horlicks', 'bournvita', 'hot milk'], url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop&q=80' },
  { keys: ['biscuit', 'osmania', 'kaju biscuit', 'fruit biscuit', 'chand biscuit'], url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80' },

  // Momos
  { keys: ['schezwan momo'], url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80' },
  { keys: ['tikka momo'], url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80' },
  { keys: ['momo'], url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80' },

  // Samosa & Puffs
  { keys: ['samosa'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80' },
  { keys: ['puff'], url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80' },
  { keys: ['kachori'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80' },

  // Breads & Buns & Omelettes
  { keys: ['garlic bread'], url: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=80' },
  { keys: ['bun maska', 'bun jam', 'malai bun', 'cream bun', 'bun'], url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80' },
  { keys: ['omelette'], url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80' },

  // Lassi & Smoothies
  { keys: ['mango lassi', 'mango milkshake'], url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=80' },
  { keys: ['strawberry lassi', 'strawberry milkshake', 'strawberry thickshake'], url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80' },
  { keys: ['chocolate lassi', 'chocolate milkshake', 'oreo', 'kitkat'], url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80' },
  { keys: ['lassi'], url: 'https://images.unsplash.com/photo-1571006682858-a458b8a5793f?w=500&auto=format&fit=crop&q=80' },

  // Maggie & Noodles
  { keys: ['maggie'], url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80' },

  // Mocktails
  { keys: ['blue sky mojito'], url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80' },
  { keys: ['mojito', 'mocktail'], url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80' },

  // Burgers
  { keys: ['burger', 'paneer burger', 'chicken burger'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80' },

  // Pizzas
  { keys: ['pizza', 'paneer tikka pizza', 'cheese pizza'], url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },

  // Chicken Snacks & Starters
  { keys: ['wings'], url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&auto=format&fit=crop&q=80' },
  { keys: ['popcorn', 'pops'], url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80' },
  { keys: ['strips', 'fingers'], url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80' },
  { keys: ['nuggets'], url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80' },
  { keys: ['lollipop'], url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500&auto=format&fit=crop&q=80' },
  { keys: ['spring roll'], url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
  { keys: ['manchuria', 'chilli chicken', '65 chilli', 'dragon chilli'], url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=80' },

  // French Fries & Sides
  { keys: ['french fries', 'fries', 'smilies', 'potato shots', 'onion rings'], url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80' },

  // Sandwiches
  { keys: ['sandwich', 'club sandwich'], url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80' },

  // Fried Rice
  { keys: ['fried rice', 'schezwan fried rice', 'chicken fried rice', 'egg fried rice'], url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80' },
];

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

export function getFoodImageByName(name) {
  if (!name) return FALLBACK_FOOD_IMG;
  const lower = name.toLowerCase();

  for (const mapping of SPECIFIC_FOOD_IMAGES) {
    if (mapping.keys.some(k => lower.includes(k))) {
      return mapping.url;
    }
  }
  return FALLBACK_FOOD_IMG;
}
