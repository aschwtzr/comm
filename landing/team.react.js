// @flow

import * as React from 'react';

import { assetsCacheURLPrefix } from './asset-meta-data';
import TeamProfile from './team-profile.react.js';
import css from './team.css';

function Team(): React.Node {
  return (
    <div className={css.wrapper}>
      <h2 className={css.header}>Team</h2>

      <section className={css.teamWrapper}>
        <TeamProfile
          name="Ashoat Tevosyan"
          role="Founder"
          githubHandle="ashoat"
          twitterHandle="ashoat"
          imageURL={`${assetsCacheURLPrefix}/ashoat.png`}
        />
        <TeamProfile
          name="atul"
          role="Software Engineer"
          githubHandle="atulsmadhugiri"
          twitterHandle="atuli0"
          imageURL={`${assetsCacheURLPrefix}/atul.jpeg`}
        />
        <TeamProfile
          name="Benjamin Schachter"
          role="Software Engineer"
          githubHandle="benschac"
          twitterHandle="benschac"
          imageURL={`${assetsCacheURLPrefix}/ben.png`}
        />
        <TeamProfile
          name="Varun Dhananjaya"
          role="Software Engineer"
          githubHandle="vdhanan"
          twitterHandle="_va_run"
          imageURL={`${assetsCacheURLPrefix}/varun.jpeg`}
        />
        <TeamProfile
          name="Max Kalashnikoff"
          role="Software Engineer"
          githubHandle="geekbrother"
          twitterHandle="GeekMaks"
          imageURL={`${assetsCacheURLPrefix}/max.jpeg`}
        />
      </section>

      <h2 className={css.header}>Team at Software Mansion</h2>
      <section className={css.teamWrapper}>
        <TeamProfile
          name="Tomasz Pałys"
          role="software engineer"
          githubHandle="palys-swm"
          imageURL={`${assetsCacheURLPrefix}/tomek.png`}
        />
        <TeamProfile
          name="Karol Bisztyga"
          role="Software Engineer"
          githubHandle="karol-bisztyga"
          twitterHandle="KBisztyga"
          imageURL={`${assetsCacheURLPrefix}/karol.jpeg`}
        />
        <TeamProfile
          name="Jacek Nitychoruk"
          role="Software Engineer"
          githubHandle="def-au1t"
          imageURL={`${assetsCacheURLPrefix}/jacek.jpeg`}
        />
        <TeamProfile
          name="Marcin Wasowicz"
          role="Software Engineer"
          githubHandle="marcinwasowicz"
          imageURL={`${assetsCacheURLPrefix}/marcin.jpeg`}
        />
      </section>
    </div>
  );
}

export default Team;
