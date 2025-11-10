import type { StoreKey, Category, ProductDetail, ProductOptionGroup, ProductOption, Order, CartItem } from '../types/domain';

// Simple in-memory database used for local development and storybook-like flows.
// Not intended for production. Resets on refresh.

const rid = () => Math.random().toString(36).slice(2, 10);

export const SHOPS: { key: StoreKey; name: string }[] = [
  { key: 'flagship', name: 'Flora Tailor Flagship' },
  { key: 'weekend-market', name: 'Flora Tailor Weekend Market' }
];

export const CATEGORIES: Category[] = [
  { id: 'roses', name: 'Roses', description: 'Classic roses in various colors' },
  { id: 'tulips', name: 'Tulips', description: 'Seasonal tulips and mixes' },
  { id: 'orchids', name: 'Orchids', description: 'Premium orchids' },
  { id: 'lilies', name: 'Lilies', description: 'Elegant lilies and arrangements' }
];

// Standalone option groups (reusable across products)
export const OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'size-standard',
    name: 'Size',
    description: 'Choose bouquet size',
    isRequired: true,
    minSelect: 1,
    maxSelect: 1,
    options: []
  },
  {
    id: 'wrap-standard',
    name: 'Wrapping',
    description: 'Gift wrapping options',
    isRequired: false,
    minSelect: 0,
    maxSelect: 1,
    options: []
  },
  {
    id: 'ribbon-addon',
    name: 'Ribbon Add-on',
    description: 'Optional decorative ribbons',
    isRequired: false,
    minSelect: 0,
    maxSelect: 2,
    options: []
  }
];

// Standalone options
export const OPTIONS: ProductOption[] = [
  // Size options
  { id: 'size-s', name: 'Small (6 stems)', description: 'Perfect for desktop', priceModifier: 0 },
  { id: 'size-m', name: 'Medium (12 stems)', description: 'Classic gift size', priceModifier: 300 },
  { id: 'size-l', name: 'Large (24 stems)', description: 'Grand statement', priceModifier: 700 },
  // Wrap options
  { id: 'wrap-paper', name: 'Kraft Paper', description: 'Eco-friendly wrap', priceModifier: 50 },
  { id: 'wrap-fabric', name: 'Fabric Wrap', description: 'Reusable silk wrap', priceModifier: 120 },
  { id: 'wrap-cellophane', name: 'Clear Cellophane', description: 'Transparent wrap', priceModifier: 30 },
  // Ribbon options
  { id: 'ribbon-satin', name: 'Satin Ribbon', description: 'Soft satin finish', priceModifier: 40 },
  { id: 'ribbon-velvet', name: 'Velvet Ribbon', description: 'Luxurious velvet', priceModifier: 80 },
  { id: 'ribbon-jute', name: 'Jute Twine', description: 'Rustic natural fiber', priceModifier: 25 }
];

// Link options to their groups (in real DB this would be a junction table)
OPTION_GROUPS[0].options = OPTIONS.filter(o => o.id.startsWith('size-'));
OPTION_GROUPS[1].options = OPTIONS.filter(o => o.id.startsWith('wrap-'));
OPTION_GROUPS[2].options = OPTIONS.filter(o => o.id.startsWith('ribbon-'));

const sizeOptions = (prefix = 'size'): ProductOptionGroup => ({
  id: `${prefix}-group`,
  name: 'Size',
  description: 'Choose bouquet size',
  isRequired: true,
  minSelect: 1,
  maxSelect: 1,
  options: [
    { id: `${prefix}-s`, name: 'Small', priceModifier: 0 },
    { id: `${prefix}-m`, name: 'Medium', priceModifier: 300 },
    { id: `${prefix}-l`, name: 'Large', priceModifier: 700 }
  ] as ProductOption[]
});

const wrapOptions = (prefix = 'wrap'): ProductOptionGroup => ({
  id: `${prefix}-group`,
  name: 'Wrapping',
  isRequired: false,
  minSelect: 0,
  maxSelect: 1,
  options: [
    { id: `${prefix}-paper`, name: 'Kraft paper', priceModifier: 50 },
    { id: `${prefix}-fabric`, name: 'Fabric wrap', priceModifier: 120 }
  ]
});

export const PRODUCTS: ProductDetail[] = [
  {
    id: 'rose-red',
    name: 'Red Rose Bouquet',
    description: '12 premium red roses',
    basePrice: 990,
    imageUrl: 'https://picsum.photos/seed/rose/480/320',
    categoryId: 'roses',
    categoryName: 'Roses',
    storeKey: 'flagship',
    optionGroups: [sizeOptions('rose-size'), wrapOptions('rose-wrap')]
  },
  {
    id: 'tulip-mix',
    name: 'Tulip Mix',
    description: 'Colorful tulip arrangement',
    basePrice: 790,
    imageUrl: 'https://picsum.photos/seed/tulip/480/320',
    categoryId: 'tulips',
    categoryName: 'Tulips',
    storeKey: 'weekend-market',
    optionGroups: [sizeOptions('tulip-size'), wrapOptions('tulip-wrap')]
  },
  {
    id: 'orchid-white',
    name: 'White Orchid Plant',
    description: 'Elegant white phalaenopsis orchid',
    basePrice: 1290,
    imageUrl: 'https://picsum.photos/seed/orchid/480/320',
    categoryId: 'orchids',
    categoryName: 'Orchids',
    storeKey: 'flagship',
    optionGroups: [
      {
        id: 'orchid-pot',
        name: 'Pot Style',
        isRequired: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'pot-ceramic', name: 'Ceramic Pot', priceModifier: 0 },
          { id: 'pot-glass', name: 'Glass Vase', priceModifier: 200 }
        ]
      }
    ]
  }
];

export const CART: { items: CartItem[] } = { items: [] };

export const mockCartItems = [
    {
      id: '1',
      name: 'Premium Red Roses Bouquet',
      price: 45.99,
      quantity: 1,
      image: '🌹',
      color: '#FFB3BA'
    },
    {
      id: '2',
      name: 'Mixed Tulips Arrangement',
      price: 32.50,
      quantity: 2,
      image: '🌷',
      color: '#B5EAD7'
    },
    {
      id: '3',
      name: 'Sunflower Centerpiece',
      price: 28.75,
      quantity: 1,
      image: '🌻',
      color: '#FFD9A0'
    }
  ];

export const ORDERS: Order[] = [
  {
    id: 'ord-001',
    items: [
      {
        productId: 'rose-red',
        productName: 'Red Rose Bouquet',
        quantity: 1,
        selectedOptionIds: ['rose-size-m', 'rose-wrap-paper'],
        unitPrice: 1340
      }
    ],
    totalAmount: 1340,
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    storeKey: 'flagship',
    customerEmail: 'flora.customer@example.com',
    notes: 'Please include a card with "Happy Birthday!"'
  },
  {
    id: 'ord-002',
    items: [
      {
        productId: 'tulip-mix',
        productName: 'Tulip Mix',
        quantity: 2,
        selectedOptionIds: ['tulip-size-s'],
        unitPrice: 790
      }
    ],
    totalAmount: 1580,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    storeKey: 'weekend-market',
    customerEmail: 'flora.customer.guest@example.com'
  },
  {
    id: 'ord-003',
    items: [
      {
        productId: 'orchid-premium',
        productName: 'Premium Orchid',
        quantity: 1,
        selectedOptionIds: ['orchid-size-l', 'orchid-wrap-luxury'],
        unitPrice: 2450
      },
      {
        productId: 'rose-white',
        productName: 'White Rose Bouquet',
        quantity: 3,
        selectedOptionIds: ['rose-size-s'],
        unitPrice: 890
      }
    ],
    totalAmount: 5120,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    storeKey: 'flagship',
    customerEmail: 'flora.customer@example.com',
    notes: 'Anniversary gift - please ensure premium packaging'
  },
  {
    id: 'ord-004',
    items: [
      {
        productId: 'lily-elegant',
        productName: 'Elegant Lily Arrangement',
        quantity: 1,
        selectedOptionIds: ['lily-size-m', 'lily-wrap-silk'],
        unitPrice: 1680
      }
    ],
    totalAmount: 1680,
    status: 'OUT_FOR_DELIVERY',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    storeKey: 'flagship',
    customerEmail: 'john.doe@example.com',
    notes: 'Deliver between 2-4 PM'
  },
  {
    id: 'ord-005',
    items: [
      {
        productId: 'tulip-spring',
        productName: 'Spring Tulip Mix',
        quantity: 4,
        selectedOptionIds: ['tulip-size-m'],
        unitPrice: 1190
      }
    ],
    totalAmount: 4760,
    status: 'READY_FOR_PICKUP',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    storeKey: 'weekend-market',
    customerEmail: 'sarah.wilson@example.com',
    notes: 'Will pick up before 5 PM'
  },
  {
    id: 'ord-006',
    items: [
      {
        productId: 'rose-pink',
        productName: 'Pink Rose Bouquet',
        quantity: 2,
        selectedOptionIds: ['rose-size-l', 'rose-wrap-premium'],
        unitPrice: 1890
      }
    ],
    totalAmount: 3780,
    status: 'CANCELLED',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    storeKey: 'flagship',
    customerEmail: 'mike.johnson@example.com',
    notes: 'Customer requested cancellation - full refund processed'
  },
  {
    id: 'ord-007',
    items: [
      {
        productId: 'orchid-classic',
        productName: 'Classic Orchid',
        quantity: 1,
        selectedOptionIds: ['orchid-size-m'],
        unitPrice: 1950
      },
      {
        productId: 'lily-white',
        productName: 'White Lily Bouquet',
        quantity: 1,
        selectedOptionIds: ['lily-size-s', 'lily-wrap-simple'],
        unitPrice: 1340
      }
    ],
    totalAmount: 3290,
    status: 'PLACED',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    storeKey: 'flagship',
    customerEmail: 'flora.customer.guest@example.com',
    notes: 'Gift for office event'
  },
  {
    id: 'ord-008',
    items: [
      {
        productId: 'rose-mixed',
        productName: 'Mixed Rose Collection',
        quantity: 1,
        selectedOptionIds: ['rose-size-xl', 'rose-wrap-luxury', 'ribbon-gold'],
        unitPrice: 3450
      }
    ],
    totalAmount: 3450,
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    storeKey: 'flagship',
    customerEmail: 'emily.davis@example.com',
    notes: 'Wedding bouquet - handle with extra care'
  }
];

export const resetDb = () => {
  CART.items = [];
  ORDERS.length = 0;
  ORDERS.push(
    {
      id: 'ord-001',
      items: [
        {
          productId: 'rose-red',
          productName: 'Red Rose Bouquet',
          quantity: 1,
          selectedOptionIds: ['rose-size-m', 'rose-wrap-paper'],
          unitPrice: 1340
        }
      ],
      totalAmount: 1340,
      status: 'PREPARING',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      storeKey: 'flagship',
      customerEmail: 'flora.customer@example.com',
      notes: 'Please include a card with "Happy Birthday!"'
    },
    {
      id: 'ord-002',
      items: [
        {
          productId: 'tulip-mix',
          productName: 'Tulip Mix',
          quantity: 2,
          selectedOptionIds: ['tulip-size-s'],
          unitPrice: 790
        }
      ],
      totalAmount: 1580,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      storeKey: 'weekend-market',
      customerEmail: 'flora.customer.guest@example.com'
    },
    {
      id: 'ord-003',
      items: [
        {
          productId: 'orchid-premium',
          productName: 'Premium Orchid',
          quantity: 1,
          selectedOptionIds: ['orchid-size-l', 'orchid-wrap-luxury'],
          unitPrice: 2450
        },
        {
          productId: 'rose-white',
          productName: 'White Rose Bouquet',
          quantity: 3,
          selectedOptionIds: ['rose-size-s'],
          unitPrice: 890
        }
      ],
      totalAmount: 5120,
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      storeKey: 'flagship',
      customerEmail: 'flora.customer@example.com',
      notes: 'Anniversary gift - please ensure premium packaging'
    },
    {
      id: 'ord-004',
      items: [
        {
          productId: 'lily-elegant',
          productName: 'Elegant Lily Arrangement',
          quantity: 1,
          selectedOptionIds: ['lily-size-m', 'lily-wrap-silk'],
          unitPrice: 1680
        }
      ],
      totalAmount: 1680,
      status: 'OUT_FOR_DELIVERY',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      storeKey: 'flagship',
      customerEmail: 'john.doe@example.com',
      notes: 'Deliver between 2-4 PM'
    },
    {
      id: 'ord-005',
      items: [
        {
          productId: 'tulip-spring',
          productName: 'Spring Tulip Mix',
          quantity: 4,
          selectedOptionIds: ['tulip-size-m'],
          unitPrice: 1190
        }
      ],
      totalAmount: 4760,
      status: 'READY_FOR_PICKUP',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      storeKey: 'weekend-market',
      customerEmail: 'sarah.wilson@example.com',
      notes: 'Will pick up before 5 PM'
    },
    {
      id: 'ord-006',
      items: [
        {
          productId: 'rose-pink',
          productName: 'Pink Rose Bouquet',
          quantity: 2,
          selectedOptionIds: ['rose-size-l', 'rose-wrap-premium'],
          unitPrice: 1890
        }
      ],
      totalAmount: 3780,
      status: 'CANCELLED',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      storeKey: 'flagship',
      customerEmail: 'mike.johnson@example.com',
      notes: 'Customer requested cancellation - full refund processed'
    },
    {
      id: 'ord-007',
      items: [
        {
          productId: 'orchid-classic',
          productName: 'Classic Orchid',
          quantity: 1,
          selectedOptionIds: ['orchid-size-m'],
          unitPrice: 1950
        },
        {
          productId: 'lily-white',
          productName: 'White Lily Bouquet',
          quantity: 1,
          selectedOptionIds: ['lily-size-s', 'lily-wrap-simple'],
          unitPrice: 1340
        }
      ],
      totalAmount: 3290,
      status: 'PLACED',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      storeKey: 'flagship',
      customerEmail: 'flora.customer.guest@example.com',
      notes: 'Gift for office event'
    },
    {
      id: 'ord-008',
      items: [
        {
          productId: 'rose-mixed',
          productName: 'Mixed Rose Collection',
          quantity: 1,
          selectedOptionIds: ['rose-size-xl', 'rose-wrap-luxury', 'ribbon-gold'],
          unitPrice: 3450
        }
      ],
      totalAmount: 3450,
      status: 'PREPARING',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      storeKey: 'flagship',
      customerEmail: 'emily.davis@example.com',
      notes: 'Wedding bouquet - handle with extra care'
    }
  );
};
