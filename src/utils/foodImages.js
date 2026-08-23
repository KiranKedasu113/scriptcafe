const FOOD_IMAGE_MAP = [
  { keys: ['tea', 'chai'], url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80' },
  { keys: ['coffee'], url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80' },
  { keys: ['badam milk', 'rose milk', 'milkshake', 'thickshake', 'lassi', 'boost', 'horlicks', 'bournvita', 'milk'], url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=80' },
  { keys: ['biscuit', 'cookie'], url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=80' },
  { keys: ['momo'], url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=300&auto=format&fit=crop&q=80' },
  { keys: ['samosa', 'kachori'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80' },
  { keys: ['puff'], url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300&auto=format&fit=crop&q=80' },
  { keys: ['bun', 'bread'], url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80' },
  { keys: ['omelette'], url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&auto=format&fit=crop&q=80' },
  { keys: ['mojito', 'mocktail'], url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80' },
  { keys: ['burger'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80' },
  { keys: ['pizza'], url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80' },
  { keys: ['wings', 'strips', 'nuggets', 'popcorn', 'pops', 'meat balls', 'lollipop', 'chicken'], url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&auto=format&fit=crop&q=80' },
  { keys: ['fries', 'finger', 'shots', 'onion rings'], url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=80' },
  { keys: ['manchuria'], url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&auto=format&fit=crop&q=80' },
  { keys: ['sandwich'], url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&auto=format&fit=crop&q=80' },
  { keys: ['rice', 'noodle', 'maggie'], url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&auto=format&fit=crop&q=80' },
];

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80';

export function getFoodImageByName(name) {
  if (!name) return FALLBACK_FOOD_IMG;
  const lower = name.toLowerCase();
  
  // Find matching Unsplash image by keyword
  for (const mapping of FOOD_IMAGE_MAP) {
    if (mapping.keys.some(k => lower.includes(k))) {
      return mapping.url;
    }
  }
  return FALLBACK_FOOD_IMG;
}
