'use client';
import { useEffect, useRef, useState } from 'react';

type Item = {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice: string | null;
  category: string;
  image?: string | null;
};

const AUTO_MS = 4500; // интервал автопрокрутки
const IMG = (i: number) => `/assets/coffee-${(i % 3) + 1}.svg`;

export default function FavoritesCarousel() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLOListElement | null>(null);
  const dotsRef = useRef<HTMLButtonElement[]>([]);
  const idxRef = useRef(0);
  const stepRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTsRef = useRef<number>(0);
  const remainRef = useRef<number>(AUTO_MS);
  const pausedRef = useRef<boolean>(false);
  const visibleRef = useRef<boolean>(true);

  // загрузка данных
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products/favorites', { headers: { accept: 'application/json' } });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        setItems((json.data ?? []) as Item[]);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load favorites');
      }
    })();
  }, []);

  // утилиты
  const setActive = (i: number) => {
    dotsRef.current.forEach((d, k) => d.classList.toggle('is-active', k === i));
  };

  const resetBars = () => {
    dotsRef.current.forEach((d) => {
      const bar = d.querySelector<HTMLSpanElement>('.bar');
      if (bar) bar.style.transform = 'scaleX(0)';
    });
  };

  const updateActiveBar = (remainMs: number) => {
    const total = AUTO_MS;
    const elapsed = total - remainMs;
    const ratio = Math.max(0, Math.min(1, elapsed / total));
    const bar = dotsRef.current[idxRef.current]?.querySelector<HTMLSpanElement>('.bar');
    if (!bar) return;

    // плавно продолжаем анимацию на оставшееся время
    bar.style.transition = pausedRef.current ? 'none' : `transform ${remainMs}ms linear`;
    bar.style.transform = `scaleX(${ratio})`;
    // чтобы «доехала» до 1 за оставшееся время — задаём второй кадр на следующий тик
    if (!pausedRef.current) {
      requestAnimationFrame(() => {
        bar.style.transition = `transform ${remainMs}ms linear`;
        bar.style.transform = 'scaleX(1)';
      });
    }
  };

  const computeStep = () => {
    const t = trackRef.current;
    if (!t) return 0;
    return t.clientWidth;
  };

  const goTo = (i: number, smooth = true) => {
    const t = trackRef.current;
    if (!t || !items?.length) return;
    const max = items.length - 1;
    const wrap = (k: number) => (k < 0 ? max : k > max ? 0 : k);
    idxRef.current = wrap(i);
    setActive(idxRef.current);
    resetBars();
    t.scrollTo({ left: idxRef.current * stepRef.current, behavior: smooth ? 'smooth' : 'auto' });
    // перезапуск прогресса у активной точки
    remainRef.current = AUTO_MS;
    startProgressTimer();
  };

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const startProgressTimer = () => {
    clearTimer();
    if (pausedRef.current || !visibleRef.current) return;
    startTsRef.current = performance.now();
    updateActiveBar(remainRef.current);
    timerRef.current = setTimeout(() => {
      // следующий слайд
      goTo(idxRef.current + 1);
    }, remainRef.current);
  };

  const pause = () => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    const now = performance.now();
    const elapsed = now - startTsRef.current;
    remainRef.current = Math.max(0, remainRef.current - elapsed);
    clearTimer();
    // зафризить бар
    updateActiveBar(remainRef.current);
  };

  const resume = () => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    startProgressTimer();
  };

  // инициализация поведения после монтирования DOM
  useEffect(() => {
    if (!items?.length) return;

    const root = rootRef.current!;
    const track = trackRef.current!;
    stepRef.current = computeStep();

    // активный индекс по текущему скроллу
    const onScroll = () => {
      const i = Math.round(track.scrollLeft / stepRef.current);
      if (i !== idxRef.current) {
        idxRef.current = i;
        setActive(i);
        // сбросить прогресс и таймер (ручной скролл = новый цикл)
        resetBars();
        remainRef.current = AUTO_MS;
        startProgressTimer();
      }
    };
    track.addEventListener('scroll', onScroll, { passive: true });

    // пауза при hover/focus внутри карусели
    const onEnter = () => pause();
    const onLeave = () => resume();
    root.addEventListener('mouseenter', onEnter);
    root.addEventListener('mouseleave', onLeave);
    root.addEventListener('focusin', onEnter);
    root.addEventListener('focusout', onLeave);

    // пауза, если секция вне вьюпорта
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries[0]?.isIntersecting ?? true;
        visibleRef.current = vis;
        if (!vis) pause();
        else resume();
      },
      { root: null, threshold: 0.2 }
    );
    io.observe(root);

    // ресайз/изменение шага
    const ro = new ResizeObserver(() => {
      stepRef.current = computeStep();
      // пересчитать позицию без анимации
      track.scrollTo({ left: idxRef.current * stepRef.current, behavior: 'auto' });
    });
    ro.observe(track);

    // старт
    setActive(0);
    resetBars();
    remainRef.current = AUTO_MS;
    startProgressTimer();

    return () => {
      clearTimer();
      track.removeEventListener('scroll', onScroll);
      root.removeEventListener('mouseenter', onEnter);
      root.removeEventListener('mouseleave', onLeave);
      root.removeEventListener('focusin', onEnter);
      root.removeEventListener('focusout', onLeave);
      io.disconnect();
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (err) {
    return (
      <div className="fav-error" role="alert">
        <svg className="fav-error__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 7h2v6h-2zm0 8h2v2h-2z"></path>
          <path d="M1 21h22L12 2 1 21z" fill="none" stroke="currentColor" strokeWidth="2"></path>
        </svg>
        <div className="fav-error__content">
          <div className="fav-error__title">Oops…</div>
          <div className="fav-error__msg">{err}</div>
        </div>
        <button className="fav-error__retry" onClick={() => { setErr(null); setItems(null); }}>
          Try again
        </button>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="fav-loader" aria-live="polite">
        <span className="fav-spinner" aria-hidden="true"></span>
        <span className="fav-loader__text">Loading favorites…</span>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="fav-carousel" data-carousel role="region" aria-label="Favorites slider">
      <button
        className="fav-arrow fav-arrow--prev"
        aria-label="Previous slide"
        onClick={() => goTo(idxRef.current - 1)}
      />
      <ol ref={trackRef} className="fav-track" aria-busy="false">
        {items.map((p, i) => (
          <li key={p.id} className="fav-slide">
            <img className="fav-media" src={IMG(i)} alt={p.name} />
            <div className="fav-caption">
              <h3 className="fav-name">{p.name}</h3>
              <p className="fav-desc">{p.description}</p>
              <div className="fav-price">
                ${Number(p.discountPrice ?? p.price).toFixed(2)}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="fav-pager" aria-label="Slides" role="tablist">
        {items.map((_, i) => (
          <button
            key={i}
            ref={(el) => {
              if (el) dotsRef.current[i] = el;
            }}
            type="button"
            className={`fav-dot${i === 0 ? ' is-active' : ''}`}
            role="tab"
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
          >
            <span className="bar" />
          </button>
        ))}
      </div>
      <button
        className="fav-arrow fav-arrow--next"
        aria-label="Next slide"
        onClick={() => goTo(idxRef.current + 1)}
      />
    </div>
  );
}
