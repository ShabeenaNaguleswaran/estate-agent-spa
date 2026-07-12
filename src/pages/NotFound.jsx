import { Link } from 'react-router-dom';
import './pages.css';

/**
 * 404 view. Rendered for unmatched routes and for property ids that
 * do not exist in the dataset.
 */
function NotFound() {
  return (
    <div className="container page page--centered">
      <p className="label">404</p>
      <h1 className="page__title">That property isn&rsquo;t on our books</h1>
      <p className="page__body">
        The listing may have been withdrawn, or the link may be incorrect.
      </p>
      <Link to="/" className="page__cta">Back to search</Link>
    </div>
  );
}

export default NotFound;