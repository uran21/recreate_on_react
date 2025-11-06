"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Hero() {
  const btnRef = useRef<HTMLAnchorElement | null>(null);
  const [canHover, setCanHover] = useState(false);
  const [showCup, setShowCup] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover:hover)").matches);
  }, []);

  const onEnter = () => { if (canHover) setShowCup(true); };
  const onLeave = () => { if (canHover) setShowCup(false); };

  return (
    <section id="enjoy" className="section enjoy">
      <div className="container">
        <div className="hero">
          <video
            className="hero__media"
            src="/assets/video.mp4"
            poster="/assets/container.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            Your browser does not support background video.
          </video>

          <div className="hero__content">
            <h1 className="heading-1 hero-title">
              <span className="accent-enjoy">Enjoy</span> premium<br />
              coffee at our<br />
              charming&nbsp;cafe
            </h1>

            <p className="text-medium hero__sub">
              With its inviting atmosphere and delicious coffee options, the
              Coffee House Resource is a popular destination for coffee lovers
              and those seeking a warm and inviting space to enjoy their
              favorite beverage.
            </p>

            <Link
              ref={btnRef}
              href="/menu"
              className={`btn btn--primary hero-btn ${showCup ? "cup-on" : ""}`}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
              onFocus={onEnter}
              onBlur={onLeave}
            >
              <span className="btn-label">Menu</span>
              {/* чашка; CSS уже есть (btn-cup + .show) */}
              <img
                className={`btn-cup ${showCup ? "show" : ""}`}
                src="/assets/coffee-cup.svg"
                alt=""
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
