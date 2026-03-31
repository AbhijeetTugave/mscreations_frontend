import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Product } from '@/types';

type ImageType = {
  url: string;
  public_id: string;
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://mscreations-backend.onrender.com';

  // Get product image URL
  // const getImageUrl = (imagePath: string) => {
  //   if (imagePath.startsWith('http')) return imagePath;
  //   return `${apiUrl}/${imagePath}`;
  // };
const getImageUrl = (image: string | ImageType | undefined): string => {
  if (!image) return '/placeholder-product.png';

  // ✅ cloudinary object
  if (typeof image === 'object') {
    return image.url;
  }

  // ✅ string fallback (old data)
  if (typeof image === 'string') {
    if (image.startsWith('http')) return image;
    return image;
  }

  return '/placeholder-product.png';
};

  const mainImage = product.images?.[0]
    ? getImageUrl(product.images[0])
    : '/placeholder.svg';

  const hasDiscount = product.mrp > product.sellingPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
    : 0;

  return (
    <Link to={`/product/${product._id}`} className="card-product group">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary rounded-lg">
        <img
          src={mainImage}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />

        {/* Wishlist Button */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            // Handle wishlist
          }}
        >
          <Heart className="h-4 w-4" />
        </Button> */}

        {/* Sale Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-full">
            {discountPercent}% OFF
          </span>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium text-foreground">Quick View</span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {product.category}
        </span>
        <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product.productName}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">₹{product.sellingPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.mrp.toFixed(2)}
            </span>
          )}
        </div>

        {/* Color Options */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 pt-1">
            {product.colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-border"
                style={{
                  backgroundColor: getColorHex(color),
                }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

// Helper to convert color names to hex
const getColorHex = (color: string): string => {
  const colorMap: Record<string, string> = {
    'white': '#ffffff',
    'black': '#1a1a1a',
    'navy': '#1e3a5f',
    'charcoal': '#36454f',
    'ivory': '#fffff0',
    'blush': '#de5d83',
    'cream': '#fffdd0',
    'pink': '#ffc0cb',
    'yellow': '#ffeb3b',
    'lavender': '#e6e6fa',
    'terracotta': '#e2725b',
    'sage': '#9dc183',
    'grey': '#808080',
    'gray': '#808080',
    'camel': '#c19a6b',
    'dusty rose': '#dcae96',
    'sky blue': '#87ceeb',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#22c55e',
    'orange': '#f97316',
    'purple': '#a855f7',
    'brown': '#92400e',
    'beige': '#d4c4b5',
    'maroon': '#7f1d1d',
  };
  return colorMap[color.toLowerCase()] || '#ddd';
};

export default ProductCard;
