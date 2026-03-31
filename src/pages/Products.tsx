import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { productService, Product } from '@/services/productService';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('featured');

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          productService.getProducts(),
          productService.getCategories(),
        ]);
        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update selected categories when URL changes
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && !selectedCategories.includes(category)) {
      setSelectedCategories([category]);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.some(
          (cat) => p.category.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    // Filter by price
    result = result.filter(
      (p) => p.sellingPrice >= priceRange[0] && p.sellingPrice <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case 'price-high':
        result.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.createdAt || '').getTime() -
            new Date(a.createdAt || '').getTime()
        );
        break;
      default:
        // Featured - keep original order
        break;
    }

    return result;
  }, [products, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setSearchParams({});
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="bg-soft-pink py-12 sm:py-16">
        <div className="container-custom px-4 sm:px-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            {selectedCategories.length === 1
              ? `${selectedCategories[0]}'s Collection`
              : 'All Products'}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} products found
          </p>
        </div>
      </div>

      <div className="container-custom px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {selectedCategories.length > 0 && (
                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                  {selectedCategories.length}
                </span>
              )}
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Sidebar Filters */}
          <aside
            className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'
              }`}
          >
            <div className="sticky top-24 space-y-6 p-6 bg-card rounded-xl border border-border">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Filters</h3>
                {(selectedCategories.length > 0 ||
                  priceRange[0] > 0 ||
                  priceRange[1] < 10000) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Category
                </h4>
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedCategories.some(
                        (c) => c.toLowerCase() === category.toLowerCase()
                      )}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <span className="capitalize">{category}</span>
                  </label>
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Price Range
                </h4>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="w-20 px-3 py-2 border border-border rounded-lg text-sm"
                    min={0}
                  />
                  <span className="text-muted-foreground">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-20 px-3 py-2 border border-border rounded-lg text-sm"
                    max={10000}
                  />
                </div>
              </div>

              {/* Mobile Close */}
              <Button
                className="w-full lg:hidden"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Desktop Sort */}
            <div className="hidden lg:flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} products
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-background cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {cat}
                    <button onClick={() => toggleCategory(cat)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <>
                {/* Mobile Swipe View */}
                <div className="sm:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  <div
                    className="flex gap-4 snap-x snap-mandatory"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex-shrink-0 w-[75vw] snap-center"
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    ← Swipe to see more →
                  </p>
                </div>

                {/* Desktop Grid View */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No products found matching your filters.
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
