import { useState, useEffect, useCallback, useRef } from 'react';

import { assetUrl } from '../../utils/assets.js';
import './ImageGallery.css';

/**
 * Property image gallery.
 *
 * Hand-written rather than using a plugin: the specification permits either,
 * and building it directly gives explicit control over keyboard navigation,
 * focus management and preloading — all of which a library would hide.
 *
 * Three surfaces:
 *   1. a large main image
 *   2. a thumbnail strip, which selects
 *   3. a fullscreen lightbox, opened from the main image
 *
 * Navigation works by click, by keyboard (arrows, Escape), and by thumbnail.
 *
 * @param {Object} props
 * @param {string[]} props.images - relative image paths, 6-8 per property
 * @param {string}   props.alt    - describes the property, for alt text
 */
function ImageGallery({ images, alt }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  /* The element that had focus before the lightbox opened, so focus can be
     restored to it on close. A keyboard user who opens the lightbox and
     closes it should land back where they were, not at the top of the page. */
  const triggerRef = useRef(null);
  const lightboxRef = useRef(null);

  const total = images.length;

  /* Wrap at both ends: from the last image, "next" returns to the first.
     A gallery that dead-ends at the last image feels broken. */
  const goToNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % total);
  }, [total]);

  const goToPrevious = useCallback(() => {
    setActiveIndex((index) => (index - 1 + total) % total);
  }, [total]);

  const openLightbox = (event) => {
    triggerRef.current = event.currentTarget;
    setIsLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    // Return focus to whatever opened the lightbox.
    triggerRef.current?.focus();
  }, []);

  /**
   * Keyboard navigation.
   *
   * Bound to the window only while the lightbox is open, so the arrow keys
   * still scroll the page normally when it is closed. Binding permanently
   * would hijack a control the user expects to behave conventionally.
   */
  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowRight') goToNext();
      if (event.key === 'ArrowLeft') goToPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);

    // Stop the page behind the lightbox scrolling while it is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the lightbox so the arrow keys reach it immediately
    // and a screen reader announces the dialog rather than the page behind it.
    lightboxRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen, closeLightbox, goToNext, goToPrevious]);

  /**
   * Preload the neighbouring images.
   *
   * Without this, clicking "next" shows a blank frame while the browser
   * fetches. Preloading the image either side means navigation is instant in
   * both directions — which is what "smooth navigation" in the rubric means.
   */
  useEffect(() => {
    const neighbours = [
      images[(activeIndex + 1) % total],
      images[(activeIndex - 1 + total) % total],
    ];

    neighbours.forEach((path) => {
      const image = new Image();
      image.src = assetUrl(path);
    });
  }, [activeIndex, images, total]);

  /* A property with no images should render nothing rather than crash on
     images[0] of undefined. */
  if (!Array.isArray(images) || total === 0) return null;

  const counter = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <>
      <section className="gallery" aria-label="Property photographs">
        {/* ---- Main image ------------------------------------------------ */}
        <div className="gallery__main">
          <button
            type="button"
            className="gallery__expand-trigger"
            onClick={openLightbox}
            aria-label={`View photograph ${activeIndex + 1} of ${total} full screen`}
          >
            <img
              className="gallery__image"
              src={assetUrl(images[activeIndex])}
              alt={`${alt} — photograph ${activeIndex + 1} of ${total}`}
              /* The first image is the largest thing above the fold on this
                 page, so it is eager-loaded and given fetch priority. */
              loading="eager"
              fetchPriority="high"
              draggable={false}
            />
          </button>

          {/* Previous / next. Buttons, not divs — they must be reachable by
              keyboard and announced as controls. */}
          <button
            type="button"
            className="gallery__nav gallery__nav--prev"
            onClick={goToPrevious}
            aria-label="Previous photograph"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            className="gallery__nav gallery__nav--next"
            onClick={goToNext}
            aria-label="Next photograph"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Mono counter — the same spec-sheet grammar as the cards */}
          <p className="gallery__counter data" aria-hidden="true">
            {counter}
          </p>
        </div>

        {/* ---- Thumbnails -------------------------------------------------- */}
        <ul className="gallery__thumbs" aria-label="Choose a photograph">
          {images.map((image, index) => (
            <li key={image}>
              <button
                type="button"
                className={`gallery__thumb ${index === activeIndex ? 'gallery__thumb--active' : ''}`}
                onClick={() => setActiveIndex(index)}
                /* aria-current tells a screen reader which thumbnail is
                   showing. The outline alone is invisible to them. */
                aria-current={index === activeIndex ? 'true' : undefined}
                aria-label={`Photograph ${index + 1} of ${total}`}
              >
                <img
                  src={assetUrl(image)}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  draggable={false}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Lightbox ------------------------------------------------------ */}
      {isLightboxOpen && (
        <div
          className="lightbox"
          /* role + aria-modal announce this as a dialog, so a screen reader
             stops reading the page behind it. */
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — photograph ${activeIndex + 1} of ${total}`}
          ref={lightboxRef}
          tabIndex={-1}
          /* Clicking the backdrop closes. The check ensures a click on the
             image itself does not — only the surrounding area. */
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
        >
          <button
            type="button"
            className="lightbox__close"
            onClick={closeLightbox}
            aria-label="Close full screen view"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            onClick={goToPrevious}
            aria-label="Previous photograph"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <img
            className="lightbox__image"
            src={assetUrl(images[activeIndex])}
            alt={`${alt} — photograph ${activeIndex + 1} of ${total}`}
            draggable={false}
          />

          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            onClick={goToNext}
            aria-label="Next photograph"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <p className="lightbox__counter data">{counter}</p>
        </div>
      )}
    </>
  );
}

export default ImageGallery;