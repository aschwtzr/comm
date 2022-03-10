// @flow

import * as React from 'react';

import { assetMetaData } from './asset-meta-data';
import HeroContent from './hero-content.react';
import InfoBlock from './info-block.react';
import css from './landing.css';
import Picture from './Picture.react';
import StarBackground from './star-background.react';
import usePreloadAssets from './use-pre-load-assets.react';

function AppLanding(): React.Node {
  usePreloadAssets(assetMetaData);
  const [
    hero,
    federated,
    customizable,
    encrypted,
    sovereign,
    openSource,
    lessNoisy,
  ] = assetMetaData;

  return (
    <main className={css.wrapper}>
      <StarBackground />
      <div className={hero.imageStyle}>
        <Picture url={hero.url} alt={hero.alt} />
      </div>
      <HeroContent />
      <InfoBlock {...federated} />
      <InfoBlock {...customizable} />
      <InfoBlock {...encrypted} />
      <InfoBlock {...sovereign} />
      <InfoBlock {...openSource} />
      <InfoBlock {...lessNoisy} />
    </main>
  );
}

export default AppLanding;
