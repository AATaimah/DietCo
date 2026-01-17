import { ShoppingCart, Menu, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, NavLink } from "react-router-dom";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onMenuClick?: () => void;
}

export function Header({ cartItemCount = 0, onCartClick, onMenuClick }: HeaderProps) {
  const cartButtonClassName = "relative";
  const cartCount =
    cartItemCount > 0 && (
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground animate-scale-in">
        {cartItemCount > 99 ? "99+" : cartItemCount}
      </span>
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.ico" alt="DietCo" className="h-9 w-9 rounded-xl" />
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
            DietCo
          </span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn("nav-link", isActive && "nav-link-active")
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/order"
            className={({ isActive }) =>
              cn("nav-link", isActive && "nav-link-active")
            }
          >
            Place Order
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              cn("nav-link", isActive && "nav-link-active")
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <Search className="h-5 w-5" />
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
          >
            <Link to="/auth">
              <User className="h-5 w-5" />
            </Link>
          </Button>

          {/* Cart Button */}
          {onCartClick ? (
            <Button
              variant="ghost"
              size="icon"
              className={cartButtonClassName}
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount}
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className={cartButtonClassName}
            >
              <Link to="/order">
                <ShoppingCart className="h-5 w-5" />
                {cartCount}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
