"use client";

import Link from "next/link";
import Image from "next/image";
import { useHeader } from "../header/useHeader";
import { useEffect, useState } from "react";

export default function Header() {
  const { open, cartCount, close, toggle } = useHeader();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // следим за авторизацией
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("authToken"));
    checkAuth();

    window.addEventListener("auth:login", checkAuth);
    window.addEventListener("auth:logout", checkAuth);
    window.addEventListener("storage", (e) => {
      if (e.key === "authToken") checkAuth();
    });

    return () => {
      window.removeEventListener("auth:login", checkAuth);
      window.removeEventListener("auth:logout", checkAuth);
    };
  }, []);

  // логика видимости корзины:
  const shouldShowCart = isLoggedIn || cartCount > 0;

  const CartLink = shouldShowCart ? (
    <Link
      className="nav-link nav-link--cart"
      href="/cart"
      onClick={close}
      data-role="cart-link"
    >
      <span className="cart-badge" aria-live="polite">
        {cartCount}
      </span>
      <img
        className="nav-ico"
        src="/assets/shopping-bag.png"
        alt=""
        aria-hidden="true"
      />
    </Link>
  ) : null;

  return (
    <header className={`site-header ${open ? "is-open" : ""}`}>
      <div className="scrim" aria-hidden="true" onClick={close} />

      <div className="container header-row">
        <Link className="logo" href="/" aria-label="Coffee House">
          <Image src="/assets/logo.svg" alt="Logo" width={120} height={40} />
        </Link>

        <nav
          id="site-nav"
          className="site-nav nav-panel nav-panel--from-right"
          aria-label="Primary"
        >
          <Link
            className="nav-logo"
            href="/"
            aria-label="Coffee House"
            onClick={close}
          >
            <Image
              src="/assets/logo.svg"
              alt="Coffee House"
              width={120}
              height={80}
            />
          </Link>

          <a className="nav-link" href="/#favorites" onClick={close}>
            Favorite coffee
          </a>
          <a className="nav-link" href="/#about" onClick={close}>
            About
          </a>
          <a className="nav-link" href="/#app" onClick={close}>
            Mobile app
          </a>
          <a className="nav-link" href="/#footer" onClick={close}>
            Contact us
          </a>

          <Link
            className="nav-link nav-link--menu"
            href="/menu"
            onClick={close}
          >
            <span>Menu</span>
            <img
              className="cup"
              src="/assets/coffee-cup.svg"
              alt=""
              aria-hidden="true"
            />
          </Link>

          {/* Cart в мобильном меню */}
          {CartLink}
        </nav>

        <div className="header-actions">
          {/* Cart на десктопе */}
          {CartLink}

          <Link className="menu-link" href="/menu">
            <span className="menu-text">Menu</span>
            <img
              className="cup"
              src="/assets/coffee-cup.svg"
              alt=""
              aria-hidden="true"
            />
          </Link>
        </div>

        <button
          className="burger"
          aria-label="Open menu"
          aria-controls="site-nav"
          aria-expanded={open}
          onClick={toggle}
        >
          <span className="burger__bar"></span>
        </button>
      </div>
    </header>
  );
}
