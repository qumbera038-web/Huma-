import React, { useState } from "react";
import { products } from "../../data/inventory";

export function ProductCategoryView() {
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <h2 className="text-2xl font-bold mb-6">Product Catalog</h2>
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-emerald-400">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => p.category === category)
              .map((product) => (
                <div key={product.id} className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
                  <img
                    src={`/${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-bold text-sm">{product.name}</h4>
                  <div className="mt-2 text-xs text-slate-400 flex justify-between">
                    <span>Price: PKR {product.price}</span>
                    <span>Stock: {product.quantity}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
      
      {/* Price List Management Placeholder */}
      <div className="mt-12 p-6 bg-slate-800 rounded-2xl border border-slate-700">
        <h3 className="text-lg font-bold mb-4">Add New Price List</h3>
        <input type="file" className="text-sm text-slate-400 file:me-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500" />
      </div>
    </div>
  );
}
