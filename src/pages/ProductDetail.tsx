import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingBag, ArrowLeft, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { productService, Product } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://mscreations-backend.onrender.com';

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await productService.getProduct(id);
        setProduct(response.data);

        // Fetch related products
        if (response.data?.category) {
          const relatedRes = await productService.getProducts({ category: response.data.category });
          setRelatedProducts(
            (relatedRes.data || []).filter((p) => p._id !== id).slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // const getImageUrl = (imagePath: string) => {
  //   if (imagePath.startsWith('http')) return imagePath;
  //   return `${apiUrl}/${imagePath}`;
  // };
  type ImageType = {
  url: string;
  public_id: string;
};

const getImageUrl = (image: string | ImageType | undefined): string => {
  if (!image) return '/placeholder.svg';

  // ✅ Cloudinary object
  if (typeof image === 'object') {
    return image.url;
  }

  // ✅ Old string (fallback)
  if (typeof image === 'string') {
    if (image.startsWith('http')) return image;
    return image;
  }

  return '/placeholder.svg';
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

  if (!product) {
    return (
      <Layout>
        <div className="container-custom px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = async () => { 
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product.size.length && !selectedSize) {
      toast({ title: 'Select size', variant: 'destructive' });
      return;
    }

    if (product.colors?.length && !selectedColor) {
      toast({ title: 'Select color', variant: 'destructive' });
      return;
    }

    const safeQuantity = quantity && quantity > 0 ? quantity : 1;

await addToCart(product, selectedSize, selectedColor, safeQuantity);

    toast({ title: 'Added to cart' });
    navigate('/cart');
  };


  const getColorHex = (color: string) => {
    const colorMap: Record<string, string> = {
      white: '#ffffff',
      black: '#1a1a1a',
      navy: '#1e3a5f',
      charcoal: '#36454f',
      ivory: '#fffff0',
      blush: '#de5d83',
      cream: '#fffdd0',
      pink: '#ffc0cb',
      yellow: '#ffeb3b',
      lavender: '#e6e6fa',
      terracotta: '#e2725b',
      sage: '#9dc183',
      grey: '#808080',
      gray: '#808080',
      camel: '#c19a6b',
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#22c55e',
      orange: '#f97316',
      purple: '#a855f7',
      brown: '#92400e',
      beige: '#d4c4b5',
      maroon: '#7f1d1d',
    };
    return colorMap[color.toLowerCase()] || '#ddd';
  };

  const hasDiscount = product.mrp > product.sellingPrice;
  const mainImage = product.images?.[selectedImage]
    ? getImageUrl(product.images[selectedImage])
    : '/placeholder.svg';

  return (
    <Layout>
      <div className="container-custom px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary">
              <img
                src={mainImage}
                alt={product.productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                  {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% OFF
                </span>
              )}
              {/* <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
              >
                <Heart className="h-5 w-5" /> 
              </Button> */}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.productName} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                {product.category} {product.subcategory && `/ ${product.subcategory}`}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-4">
                {product.productName}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">₹{product.sellingPrice.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.mrp.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {product.shortDesc && (
              <p className="text-muted-foreground leading-relaxed">{product.shortDesc}</p>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Color</span>
                  {selectedColor && <span className="text-muted-foreground">{selectedColor}</span>}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-muted-foreground'}`}
                      style={{ backgroundColor: getColorHex(color) }} title={color}
                    >
                      {selectedColor === color && (
                        <Check className={`h-4 w-4 mx-auto ${['white', 'ivory', 'cream', 'yellow', 'beige'].includes(color.toLowerCase()) ? 'text-foreground' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.size && product.size.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Size</span>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-sm text-primary underline"
                  >
                    Size Guide 
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.size.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 rounded-lg border transition-all ${selectedSize === size
                      ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
<div className="space-y-3">
  <span className="font-medium">Quantity</span>

  <div className="flex items-center gap-4">
    <div className="flex items-center border border-border rounded-lg">
      <button
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        className="p-3 hover:bg-secondary transition-colors"
        disabled={product.stock === 0}
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="w-12 text-center font-medium">
        {quantity}
      </span>

      <button
        onClick={() =>
          setQuantity(Math.min(product.stock, quantity + 1))
        }
        className="p-3 hover:bg-secondary transition-colors"
        disabled={product.stock === 0}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>

    {/* STOCK STATUS */}
    {product.stock === 0 ? (
      <span className="text-sm font-medium text-red-600">
        Out of Stock
      </span>
    ) : product.stock <= (product.lowStock || 0) ? (
      <span className="text-sm font-medium text-orange-600">
        Low Stock ({product.stock} left)
      </span>
    ) : (
      <span className="text-sm font-medium text-emerald-600">
        In Stock ({product.stock})
      </span>
    )}
  </div>
</div>

            {/* Add to Cart */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 btn-hero"
                disabled={product.stock <= 0}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              {/* <Button variant="outline" size="icon" className="flex-shrink-0">
                <Heart className="h-5 w-5" />
              </Button> */}
            </div>

            {/* ================= SIZE CHART MODAL ================= */}
            {/* {showSizeChart && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 max-w-lg w-full relative">
                  <button
                    onClick={() => setShowSizeChart(false)}
                    className="absolute right-4 top-4"
                  >
                    <X />
                  </button>

                  <h2 className="text-xl font-bold mb-4">Size Chart (Inches)</h2>

                  <table className="w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Size</th>
                        <th className="border p-2">Chest</th>
                        <th className="border p-2">Shoulder</th>
                        <th className="border p-2">Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['S', 36, 17, 26],
                        ['M', 38, 18, 27],
                        ['L', 40, 19, 28],
                        ['XL', 42, 20, 29],
                        ['XXL', 44, 21, 30],
                      ].map(row => (
                        <tr key={row[0]}>
                          {row.map(cell => (
                            <td key={cell.toString()} className="border p-2 text-center">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <Button
                    onClick={() => setShowSizeChart(false)}
                    className="btn-hero w-full mt-4"
                  >
                    Close
                  </Button>
                </div> 
              </div>
            )} */}

            {/* Product Details */}
            <div className="border-t border-border pt-6 space-y-4"> 
              <details className="group" open>
                <summary className="flex justify-between items-center cursor-pointer py-2">
                  <span className="font-medium">Product Details</span>
                </summary>
                <div className="text-sm text-muted-foreground pt-2 space-y-1">
                  {product.brand && <p>Brand: {product.brand}</p>}
                  {product.productType && <p>Type: {product.productType}</p>}
                  <p>High-quality materials, carefully crafted for comfort and style.</p>
                </div>
              </details>
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer py-2">
                  <span className="font-medium">Shipping & Returns</span>
                </summary>
                <p className="text-sm text-muted-foreground pt-2">
                  Free shipping on orders over ₹1000. Easy 15-day returns.
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
