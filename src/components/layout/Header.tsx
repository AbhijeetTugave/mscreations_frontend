import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Men', path: '/products?category=men' },
    { name: 'Women', path: '/products?category=women' },
    { name: 'Kids', path: '/products?category=kids' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl sm:text-2xl font-bold text-primary">
              MS<span className="text-foreground"> Creations</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.name} to={link.path} className="nav-link">
                {link.name}
              </Link>
            ))}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
            </Button> */}

            {/* CART */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            )}

            {/* DESKTOP USER SECTION */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">

                {!isAdmin && (
                  <Link to="/orders">
                    <Button variant="ghost" size="sm">
                      <Package className="h-4 w-4 mr-1" />
                      My Orders
                    </Button>
                  </Link>
                )}

                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      Admin Panel
                    </Button>
                  </Link>
                )}

                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Hi, {user?.name?.split(' ')[0]}
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="btn-primary">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* MOBILE TOGGLE */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border animate-slide-up">
            <nav className="flex flex-col py-4 px-4 gap-2">

              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="py-3 px-4 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-border my-2" />

              {isAuthenticated ? (
                <>
                  {/* MOBILE USER INFO */}
                  <Link
                    to="/profile"
                    className="py-3 px-4 rounded-lg hover:bg-secondary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👤 Hi, {user?.name?.split(' ')[0]}
                  </Link>

                  {!isAdmin && (
                    <Link
                      to="/orders"
                      className="py-3 px-4 rounded-lg hover:bg-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="py-3 px-4 rounded-lg hover:bg-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      clearCart();
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="py-3 px-4 rounded-lg hover:bg-secondary transition-colors text-left text-destructive"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="py-3 px-4 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="py-3 px-4 rounded-lg bg-primary text-primary-foreground text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
