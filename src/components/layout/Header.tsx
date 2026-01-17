import { ShoppingCart, Menu, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, NavLink } from "react-router-dom";
import { useI18n } from "@/i18n";
import { useCart } from "@/hooks/useCart";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onMenuClick?: () => void;
}

export function Header({ cartItemCount, onCartClick, onMenuClick }: HeaderProps) {
  const { language, setLanguage, t } = useI18n();
  const { itemCount } = useCart();
  const resolvedCartCount = cartItemCount ?? itemCount;
  const cartButtonClassName = "relative";
  const cartCount =
    resolvedCartCount > 0 && (
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground animate-scale-in">
        {resolvedCartCount > 99 ? "99+" : resolvedCartCount}
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
            {t("nav.home")}
          </NavLink>
          <NavLink
            to="/order"
            className={({ isActive }) =>
              cn("nav-link", isActive && "nav-link-active")
            }
          >
            {t("nav.placeOrder")}
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              cn("nav-link", isActive && "nav-link-active")
            }
          >
            {t("nav.contact")}
          </NavLink>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            aria-label={language === "en" ? t("nav.arabic") : t("nav.english")}
            title={language === "en" ? t("nav.arabic") : t("nav.english")}
          >
            {language === "en" ? t("nav.arabic") : t("nav.english")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            aria-label={t("nav.search")}
            title={t("nav.search")}
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            aria-label={t("nav.account")}
            title={t("nav.account")}
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
              aria-label={t("nav.cart")}
              title={t("nav.cart")}
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
              aria-label={t("nav.cart")}
              title={t("nav.cart")}
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
