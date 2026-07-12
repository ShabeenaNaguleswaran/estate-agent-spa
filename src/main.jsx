import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fonts (self-hosted — see Commit 4)
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/500.css';
import '@fontsource/archivo/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';


import Localization from 'react-widgets/Localization';
import { DateLocalizer } from 'react-widgets/IntlLocalizer';

// react-widgets base stylesheet. Loaded BEFORE our own styles so that our
// token-based overrides in SearchForm.css take precedence.
import 'react-widgets/styles.css';

import './styles/variables.css';
import './styles/global.css';
// Imported last: these are corrections that must win over the component
// stylesheets they adjust.
import './styles/responsive.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Localization date={new DateLocalizer({ culture: 'en-GB', firstOfWeek: 1 })}>
      <App />
    </Localization>
  </StrictMode>
);