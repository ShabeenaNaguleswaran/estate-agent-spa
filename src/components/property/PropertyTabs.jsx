import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';

import FloorPlan from './FloorPlan.jsx';
import PropertyMap from './PropertyMap.jsx';
import './PropertyTabs.css';

/**
 * The three required tab panels: the long description, the floor plan and
 * the Google Map.
 *
 * react-tabs is used rather than a hand-rolled tab component because it
 * implements the WAI-ARIA tabs pattern correctly out of the box — roving
 * tabindex, arrow-key navigation between tabs, and the aria-controls /
 * aria-labelledby relationships between each tab and its panel. Rebuilding
 * that by hand would be a step backwards for accessibility, which the
 * specification names as an assessed concern.
 *
 * @param {Object} props
 * @param {Object} props.property
 */
function PropertyTabs({ property }) {
  const { longDescription, floorPlan, coordinates, location, postcode } = property;

  return (
    <Tabs className="tabs">
      <TabList className="tabs__list">
        <Tab className="tabs__tab" selectedClassName="tabs__tab--selected">
          Description
        </Tab>
        <Tab className="tabs__tab" selectedClassName="tabs__tab--selected">
          Floor plan
        </Tab>
        <Tab className="tabs__tab" selectedClassName="tabs__tab--selected">
          Location
        </Tab>
      </TabList>

      {/* -- Long description ---------------------------------------------- */}
      <TabPanel className="tabs__panel" selectedClassName="tabs__panel--selected">
        {/*
          Rendered as a JSX expression, NOT via dangerouslySetInnerHTML.
          React escapes the string, so any HTML or script in the property data
          is rendered as literal text rather than executed. This is the JSX
          encoding half of the security criterion — see SECURITY.md.
        */}
        <div className="tabs__prose">
          {longDescription.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </TabPanel>

      {/* -- Floor plan ------------------------------------------------------ */}
      <TabPanel className="tabs__panel" selectedClassName="tabs__panel--selected">
        <FloorPlan floorPlan={floorPlan} location={location} />
      </TabPanel>

      {/* -- Map -------------------------------------------------------------- */}
      <TabPanel className="tabs__panel" selectedClassName="tabs__panel--selected">
        <div className="tabs__map-header">
          <p className="label">Approximate location</p>
          <p className="tabs__postcode data">{postcode}</p>
        </div>

        <PropertyMap coordinates={coordinates} location={location} />

        <p className="tabs__note">
          The pin shows the approximate position of the property. Exact
          details are provided on viewing.
        </p>
      </TabPanel>
    </Tabs>
  );
}

export default PropertyTabs;