import { Product } from "../types.ts";

export const products: Product[] = [
  // Faucets/Mixers
  { id: "p1", name: "Modern Chrome Faucet", category: "Faucets", price: 15760, salePrice: 15760, costPrice: 12000, quantity: 50, imageUrl: "IMG-20260907-WA0037.jpg" },
  { id: "p2", name: "Gold Short Faucet", category: "Faucets", price: 13650, salePrice: 13650, costPrice: 10500, quantity: 20, imageUrl: "IMG-20260907-WA0035.jpg" },
  { id: "p3", name: "Premium Gold Faucet", category: "Faucets", price: 14940, salePrice: 14940, costPrice: 11500, quantity: 15, imageUrl: "IMG-20260907-WA0038.jpg" },
  { id: "p4", name: "Black Mixer Set", category: "Faucets", price: 16380, salePrice: 16380, costPrice: 12500, quantity: 10, imageUrl: "IMG-20260907-WA0036.jpg" },
  
  // Drains
  { id: "p5", name: "Square Floor Drain", category: "Drains", price: 1560, salePrice: 1560, costPrice: 1100, quantity: 100, imageUrl: "IMG-20260907-WA0010.jpg" },
  { id: "p6", name: "Stainless Steel Floor Drain", category: "Drains", price: 4940, salePrice: 4940, costPrice: 3800, quantity: 80, imageUrl: "IMG-20260907-WA0017.jpg" },
  
  // Shower Accessories
  { id: "p7", name: "Shower System Kit", category: "Shower Accessories", price: 57740, salePrice: 57740, costPrice: 45000, quantity: 5, imageUrl: "IMG-20260907-WA0016.jpg" },
  { id: "p8", name: "Shower Set Selection", category: "Shower Accessories", price: 41780, salePrice: 41780, costPrice: 32000, quantity: 8, imageUrl: "IMG-20260907-WA0031.jpg" },
  
  // Misc
  { id: "p9", name: "Wall Mounted Shower Seat", category: "Bathroom Furniture", price: 12000, salePrice: 12000, costPrice: 9000, quantity: 10, imageUrl: "IMG-20260907-WA0027.jpg" },
  { id: "p10", name: "Electric Hand Dryer", category: "Bathroom Furniture", price: 8500, salePrice: 8500, costPrice: 6500, quantity: 15, imageUrl: "IMG-20260907-WA0026.jpg" },
  { id: "p11", name: "Double Kitchen Rack", category: "Kitchen Accessories", price: 4500, salePrice: 4500, costPrice: 3200, quantity: 12, imageUrl: "IMG-20260907-WA0024.jpg" },
];
