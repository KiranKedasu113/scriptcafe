// Dish-specific image mapping - per item, exact name match
// Using verified Unsplash photo IDs that accurately match each dish

const SPECIFIC_ITEM_MAP = {
  // === IRANI CAFE (Teas & Drinks) ===
  // Irani Tea - classic chai in ridged glass
  'irani tea':                   'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=500&auto=format&fit=crop&q=80',
  // Irani Black Tea - dark black tea in glass
  'irani black tea':             'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
  // Irani Tea with Malai - tea with cream
  'irani tea with malai':        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
  // Lemon Tea - tea with lemon slice
  'lemon tea':                   'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
  // Green Tea - cup of green tea
  'green tea':                   'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=500&auto=format&fit=crop&q=80',
  // Badam Milk - warm almond milk in glass
  'badam milk':                  'https://images.unsplash.com/photo-1585670056709-4a6e7cc2c6f8?w=500&auto=format&fit=crop&q=80',
  // Rose Milk - pink colored rose flavored milk
  'rose milk':                   'https://images.unsplash.com/photo-1559181567-c3190bbed3f3?w=500&auto=format&fit=crop&q=80',
  // Coffee - hot coffee in cup
  'coffee':                      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
  // Boost, Horlicks, Bournvita - chocolate malt drinks
  'boost':                       'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop&q=80',
  'horlicks':                    'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop&q=80',
  'bournvita':                   'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop&q=80',
  'hot milk honey':              'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
  // Osmania biscuits - Hyderabad style round cookies
  'osmania biscuits':            'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=80',
  'kaju biscuits':               'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80',
  'fruit biscuits':              'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80',
  'chand biscuits':              'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80',
  'fine biscuits':               'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80',

  // === MOMO CORNER ===
  'veg momo':                    'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80',
  'veg schezwan momo':           'https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=500&auto=format&fit=crop&q=80',
  'mushroom momo':               'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80',
  'paneer momo':                 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80',
  'paneer tikka momo':           'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
  'chicken momo':                'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80',
  'butter chicken momo':         'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80',
  'chicken tikka momo':          'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
  'chicken peri peri momo':      'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80',
  'chicken schezwan momo':       'https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=500&auto=format&fit=crop&q=80',
  'chicken cheese momo':         'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80',

  // === SAMOSA & PUFFS ===
  'onion samosa':                'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  'corn samosa':                 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  'aloo masala samosa':          'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  'paneer samosa':               'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  'kachori':                     'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  'egg samosa':                  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  'chicken samosa':              'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  'veg puff':                    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
  'egg puff':                    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
  'chicken puff':                'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',

  // === BREAD & BUN ===
  'bun maska':                   'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  'bun jam maska':               'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  'malai bun':                   'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  'cream bun':                   'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  'garlic bread':                'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=80',
  'bread butter':                'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  'single omelette':             'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80',
  'double omelette':             'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80',
  'bread omelette':              'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=80',

  // === LASSI ===
  'sweet lassi':                 'https://images.unsplash.com/photo-1571006682858-a458b8a5793f?w=500&auto=format&fit=crop&q=80',
  'mango lassi':                 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=80',
  'pineapple lassi':             'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format&fit=crop&q=80',
  'banana lassi':                'https://images.unsplash.com/photo-1571006682858-a458b8a5793f?w=500&auto=format&fit=crop&q=80',
  'strawberry lassi':            'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80',
  'chocolate lassi':             'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
  'vanilla lassi':               'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80',
  'butterscotch lassi':          'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80',
  'kiwi lassi':                  'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format&fit=crop&q=80',
  'custard apple lassi':         'https://images.unsplash.com/photo-1571006682858-a458b8a5793f?w=500&auto=format&fit=crop&q=80',
  'orange lassi':                'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&auto=format&fit=crop&q=80',

  // === MAGGIE ===
  'plain maggie':                'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
  'veg maggie':                  'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
  'masala maggie':               'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
  'egg maggie':                  'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',

  // === MOCKTAILS ===
  'virgin mojito':               'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
  'blue sky mojito':             'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
  'red rose mojito':             'https://images.unsplash.com/photo-1562937174-dbb85a2765f8?w=500&auto=format&fit=crop&q=80',
  'mint cool mojito':            'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',

  // === BURGERS ===
  'veg burger':                  'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
  'paneer burger':               'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
  'chicken burger':              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
  'chicken crispy burger':       'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',

  // === PIZZAS ===
  'veg pizza':                   'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
  'paneer tikka pizza':          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
  'veg cheese pizza':            'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
  'corn cheese pizza':           'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
  'aalopena cheese pizza':       'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
  'chicken cheese pizza':        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
  'chicken tikka pizza':         'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
  'chicken aalopena cheese pizza':'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
  'chicken peri peri pizza':     'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',

  // === CHICKEN SNACKS ===
  'chicken wings':               'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&auto=format&fit=crop&q=80',
  'coated spicy chicken wings':  'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&auto=format&fit=crop&q=80',
  'chicken strips':              'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'supreme chicken nuggets':     'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'chicken pops':                'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'chicken popcorn':             'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'spicy chicken popcorn':       'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'chicken fingers':             'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'spicy chicken finger':        'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'chicken meat balls':          'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format&fit=crop&q=80',
  'chicken tikka':               'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
  'chicken chilli garlic finger':'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'chicken breaded lollipop':    'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500&auto=format&fit=crop&q=80',
  'chicken nuggets':             'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'chicken spring roll':         'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',

  // === VEG SNACKS ===
  'paneer pop bites':            'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=500&auto=format&fit=crop&q=80',
  'veg cheese nuggets':          'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'veg nuggets':                 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
  'tandoori paneer nuggets':     'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=500&auto=format&fit=crop&q=80',
  'veg finger':                  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
  'veg lollipop':                'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
  'veg spring roll':             'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
  'paneer spring roll':          'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
  'veg corn samosa':             'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  'veg smilies':                 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
  'potato shots':                'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',

  // === SIDES ===
  'french fries small':          'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
  'french fries large':          'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
  'salted french fries':         'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
  'masala french fries':         'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
  'peri peri french fries':      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
  'onion rings':                 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=500&auto=format&fit=crop&q=80',

  // === STARTERS ===
  'dragon chilli chicken':       'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=80',
  'chilly chicken':              'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=80',
  '65 chilli chicken':           'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
  'chicken manchuria':           'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=80',
  'veg manchuria':               'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=80',
  'paneer':                      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=500&auto=format&fit=crop&q=80',
  'mushroom':                    'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=500&auto=format&fit=crop&q=80',

  // === SANDWICH ===
  'veg sandwich with cheese':    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
  'veg club sandwich':           'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
  'paneer sandwich':             'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
  'chicken sandwich':            'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
  'chicken club sandwich':       'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',

  // === BEVERAGES (MILKSHAKES & THICKSHAKES) ===
  'vanilla milkshake':           'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80',
  'chocolate milkshake':         'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
  'strawberry milkshake':        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80',
  'butterscotch milkshake':      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80',
  'mango milkshake':             'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=80',
  'pineapple milkshake':         'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format&fit=crop&q=80',
  'kiwi milkshake':              'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format&fit=crop&q=80',
  'custard apple milkshake':     'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80',
  'orange milkshake':            'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&auto=format&fit=crop&q=80',
  'oreo milkshake':              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
  'cold coffee':                 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop&q=80',
  'kitkat milkshake':            'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
  'banana milkshake':            'https://images.unsplash.com/photo-1571006682858-a458b8a5793f?w=500&auto=format&fit=crop&q=80',
  'kaju banana milkshake':       'https://images.unsplash.com/photo-1571006682858-a458b8a5793f?w=500&auto=format&fit=crop&q=80',
  'oreo thickshake':             'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
  'chocolate thickshake':        'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
  'banana thickshake':           'https://images.unsplash.com/photo-1571006682858-a458b8a5793f?w=500&auto=format&fit=crop&q=80',
  'kitkat thickshake':           'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
  'strawberry thickshake':       'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80',

  // === FRIED RICE ===
  'schezwan fried rice':         'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  'mushroom fried rice':         'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  'paneer fried rice':           'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  'egg fried rice':              'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  'double egg fried rice':       'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  'chicken fried rice':          'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  'double egg chicken fried rice':'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  'chicken wings fried rice (half)':'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  'chicken wings fried rice (full)':'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  'chicken lollipop fried rice (half)':'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  'chicken lollipop fried rice (full)':'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
};

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

export function getFoodImageByName(name) {
  if (!name) return FALLBACK_FOOD_IMG;
  const lower = name.toLowerCase().trim();

  // Exact match first
  if (SPECIFIC_ITEM_MAP[lower]) return SPECIFIC_ITEM_MAP[lower];

  // Partial match — longest key wins so "chicken tikka momo" won't match just "chicken"
  let bestMatch = null;
  let bestLen = 0;
  for (const key of Object.keys(SPECIFIC_ITEM_MAP)) {
    if (lower.includes(key) && key.length > bestLen) {
      bestMatch = key;
      bestLen = key.length;
    }
  }
  if (bestMatch) return SPECIFIC_ITEM_MAP[bestMatch];

  return FALLBACK_FOOD_IMG;
}
