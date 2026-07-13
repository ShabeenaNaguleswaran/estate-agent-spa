import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import properties from '../../data/properties.json';
import { assetUrl } from '../../utils/assets.js';
import { formatPrice, formatPriceCompact, formatDate } from '../../utils/format.js';
import './Hero.css';

/**
 * The hero.
 *
 * Rather than a stock photograph with a headline over it, the hero is the
 * dataset summarising itself — a register entry for the register. Every figure
 * in the summary strip is DERIVED from properties.json rather than written in,
 * so adding a property updates the hero without anyone touching this file.
 *
 * The featured property is the most recently added one, which gives the
 * dateAdded field a job beyond being a search criterion.
 */
function Hero() {
  /**
   * The market summary. Computed once — the dataset is static, so recomputing
   * it on every render would be wasted work.
   */
  const summary = useMemo(() => {
    const prices = properties.map((p) => p.price);
    const bedrooms = properties.map((p) => p.bedrooms);
    const areas = new Set(properties.map((p) => p.postcodeArea));

    return {
      count: properties.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      minBedrooms: Math.min(...bedrooms),
      maxBedrooms: Math.max(...bedrooms),
      areaCount: areas.size,
    };
  }, []);

  /** The most recently listed property. Sorted on a copy — sort() mutates. */
  const featured = useMemo(
    () =>
      [...properties].sort(
        (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
      )[0],
    []
  );

  return (
    <section className="hero">
      <div className="container hero__inner">
        {/* -- Statement ---------------------------------------------------- */}
        <div className="hero__statement">
          <p className="hero__eyebrow data">Meridian · Property register</p>

          <h1 className="hero__title">
            Seven properties.
            <br />
            Five ways to find yours.
          </h1>

          <p className="hero__lede">
            Search by type, price, bedrooms, date added or postcode area — in any
            combination. Shortlist what you like as you go.
          </p>

          {/*
            The register's own spec strip. Same typographic grammar as the
            cards, one level up: uppercase mono label, tabular figure beneath.
            Every value is computed from the dataset.
          */}
          <dl className="hero__summary">
            <div className="hero__stat">
              <dt className="label">Properties</dt>
              <dd className="hero__figure data">
                {String(summary.count).padStart(2, '0')}
              </dd>
            </div>

            <div className="hero__stat">
              <dt className="label">Price</dt>
              <dd className="hero__figure data">
                {formatPriceCompact(summary.minPrice)}
                <span className="hero__dash">–</span>
                {formatPriceCompact(summary.maxPrice)}
              </dd>
            </div>

            <div className="hero__stat">
              <dt className="label">Bedrooms</dt>
              <dd className="hero__figure data">
                {summary.minBedrooms}
                <span className="hero__dash">–</span>
                {summary.maxBedrooms}
              </dd>
            </div>

            <div className="hero__stat">
              <dt className="label">Areas</dt>
              <dd className="hero__figure data">
                {String(summary.areaCount).padStart(2, '0')}
              </dd>
            </div>
          </dl>
        </div>

        {/* -- Featured property --------------------------------------------- */}
        {/*
          Not a decorative stock image: the most recently listed property, with
          its own details. It uses a photograph to communicate something true
          about the register rather than to fill space.
        */}
        <Link
          to={`/property/${featured.id}`}
          className="hero__featured"
          aria-label={`New to the market: ${featured.type} at ${featured.location}, ${formatPrice(featured.price)}`}
        >
          <img
            className="hero__image"
            src={assetUrl(featured.mainImage)}
            alt={`${featured.type} at ${featured.location}`}
            /* Above the fold and the largest image on the page — load it
               eagerly and give it priority, so it is not queued behind the
               lazy-loaded card images below. */
            loading="eager"
            fetchPriority="high"
            draggable={false}
          />

          <div className="hero__plaque">
            <p className="hero__plaque-label label">New to the market</p>
            <p className="hero__plaque-title">{featured.location}</p>
            <p className="hero__plaque-price data">{formatPrice(featured.price)}</p>
            <p className="hero__plaque-meta data">
              {featured.bedrooms} BED · {featured.postcodeArea} ·{' '}
              {formatDate(featured.dateAdded)}
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default Hero;