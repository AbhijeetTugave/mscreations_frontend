import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  const year = new Date().getFullYear()
  return (
    < footer className="bg-charcoal text-cream" >
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold">
              MS<span className="text-rose-gold"> Creations</span>
            </h2>
            <p className="text-cream/70 text-sm leading-relaxed">
              Craft Your Style. Discover elegant, modern fashion for Women, Men, and Kids. Premium quality clothing designed for comfort and style.
            </p>
            <div className="flex gap-4">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/ms_creation_official_2025?igsh=MTdnb245ZDE5dGo2cg=="
                target="_blank"
                rel="noopener noreferrer"
                className="relative group text-cream/60 hover:text-rose-gold transition-colors"
              >
                <FaInstagram className="h-5 w-5" />
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">
                  Instagram
                </span>
              </a>

              {/* Facebook */}
              {/* <a
                href="https://www.facebook.com/MSCreations"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group text-cream/60 hover:text-rose-gold transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">
                  Facebook
                </span>
              </a> */}

              {/* WhatsApp */}
              <a
                href="https://wa.me/918433807557"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group text-cream/60 hover:text-rose-gold transition-colors"
              >
                <FaWhatsapp className="h-5 w-5" />
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">
                  WhatsApp
                </span>
              </a>
            </div>
          </div>

          {/* Quick Links
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/products?category=women" className="text-cream/70 hover:text-rose-gold transition-colors text-sm">
                Women's Collection
              </Link>
              <Link to="/products?category=men" className="text-cream/70 hover:text-rose-gold transition-colors text-sm">
                Men's Collection
              </Link>
              <Link to="/products?category=kids" className="text-cream/70 hover:text-rose-gold transition-colors text-sm">
                Kids' Collection
              </Link>
              <Link to="/products" className="text-cream/70 hover:text-rose-gold transition-colors text-sm">
                New Arrivals
              </Link>
            </nav>
          </div> */}

          {/* Customer Service
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Customer Service</h4>
            <nav className="flex flex-col gap-2">
              <a href="#" className="text-cream/70 hover:text-rose-gold transition-colors text-sm">
                Track Order
              </a>
              <a href="#" className="text-cream/70 hover:text-rose-gold transition-colors text-sm">
                Shipping & Returns
              </a>
              <a href="#" className="text-cream/70 hover:text-rose-gold transition-colors text-sm">
                Size Guide
              </a>
              <a href="#" className="text-cream/70 hover:text-rose-gold transition-colors text-sm">
                FAQs
              </a>
            </nav>
          </div> */}

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <div className="space-y-3">
              <a href="tel:+918433807557" className="flex items-center gap-3 text-cream/70 hover:text-rose-gold transition-colors text-sm">
                <Phone className="h-4 w-4" />
                8433807557
              </a>
              <a href="mailto:MSCreations3010@gmail.com" className="flex items-center gap-3 text-cream/70 hover:text-rose-gold transition-colors text-sm">
                <Mail className="h-4 w-4" />
                info@mscreations.in
              </a>
              <div className="flex items-start gap-3 text-cream/70 text-sm">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Mazgaon,Mumbai,Maharashtra,India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-cream/70 hover:text-rose-gold transition-colors text-sm"
                >
                  <MapPin className="h-4 w-4 mt-0.5" />
                  Get Directions to Mazgaon, Mumbai
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-sm">
            © {year} MS Creations. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-cream/50 hover:text-cream text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-cream/50 hover:text-cream text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
