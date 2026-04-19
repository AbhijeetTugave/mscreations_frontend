import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { productService, Product } from '@/services/productService';

// Images
import heroBanner from '@/assets/hero-banner.jpg';
import categoryWomen from '@/assets/category-women.jpg';
import categoryMen from '@/assets/category-men.jpg';
import categoryKids from '@/assets/category-kids.jpg';

import ProductSkeleton from '@/components/products/ProductSkeleton';

const categories = [
  { id: 'women', name: 'Women', image: categoryWomen },
  { id: 'men', name: 'Men', image: categoryMen },
  { id: 'kids', name: 'Kids', image: categoryKids },
];

const benefits = [
  { id: 'shipping', icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹1000' },
  { id: 'payment', icon: Shield, title: 'Secure Payment', desc: '100% protected checkout' },
  { id: 'returns', icon: RefreshCw, title: 'Easy Returns', desc: '15-day return policy' },
  { id: 'support', icon: Headphones, title: '24/7 Support', desc: 'Dedicated assistance' },
];

const Index: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
const response = await productService.getProducts();
        // setProducts(response.data || []);
       setProducts(
  (response.data || []).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
  if (!loading && products.length > 4) {
    const timer = setTimeout(() => {
      setVisibleCount(Math.min(8, products.length));
    }, 800);

    return () => clearTimeout(timer);
  }
}, [loading, products]);
  // const featuredProducts = products.slice(0, 8);
  const featuredProducts = products.slice(0, visibleCount);

  /* ----------------------------------
     Featured Products Rendering Logic
  ---------------------------------- */
  let featuredContent: React.ReactNode;

 if (loading) {
  featuredContent = (
    <>
      {/* Mobile Skeleton (Slider style) */}
      <div className="sm:hidden flex gap-4 overflow-x-auto px-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-[75vw] flex-shrink-0">
            <ProductSkeleton />
          </div>
        ))}
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </>
  );
} else if (error) {
    featuredContent = (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  } else if (featuredProducts.length === 0) {
  featuredContent = (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <p className="text-lg font-medium">No products added</p>
      <p className="text-muted-foreground text-sm">
        Please check back later or add new products.
      </p>
    </div>
  );
} else {
    featuredContent = (
      <>
        {/* Mobile Swipe View */}
        <div className="sm:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-4 snap-x snap-mandatory">
            {featuredProducts.map((product) => (
              <div key={product._id} className="flex-shrink-0 w-[75vw] snap-center">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            ← Swipe to see more →
          </p>
        </div>

        {/* Desktop Grid View */}
        {/* <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div> */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
  {featuredProducts.map((product) => (
    <ProductCard key={product._id} product={product} />
  ))}

  {/* Skeleton for remaining */}
  {visibleCount < products.length &&
  [...Array(products.length - visibleCount)].map((_, i) => (
    <ProductSkeleton key={`skeleton-${i}`} />
  ))}
</div>
      </>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="container-custom relative z-10 px-4 sm:px-6 flex items-center h-full">
          <div className="max-w-2xl animate-slide-up text-white">
            <span className="inline-block px-4 py-2 bg-primary/20 rounded-full text-sm font-medium mb-6">
              New Season Arrivals
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Discover Your{' '}
              <span className="block text-rose-500 drop-shadow-lg">
                Perfect Style
              </span>
            </h1>


            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Explore our curated collection of elegant fashion for Women, Men, and Kids.
              Quality meets style at MSCreations.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button className="btn-hero">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products">
                <Button className="btn-outline-hero">
                  View Collections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-background">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Find the perfect outfit for everyone in your family
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/products?category=${category.id}`} className="group relative aspect-[4/5] rounded-2xl overflow-hidden">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-display text-2xl font-bold text-cream mb-2">
                    {category.name}
                  </h3>
                  <span className="inline-flex items-center text-cream/80 text-sm group-hover:text-rose-gold transition-colors">
                    Shop Collection
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Our most loved pieces this season
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {featuredContent}
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-background">
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-6 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="p-3 rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Index;
