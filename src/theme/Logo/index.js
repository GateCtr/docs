import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';
import {useThemeConfig} from '@docusaurus/theme-common';

export default function Logo({imageClassName, titleClassName}) {
  const {navbar: {logo = {}, title: navbarTitle}} = useThemeConfig();

  const logoLink = useBaseUrl(logo.href ?? '/');
  const sources = {
    light: useBaseUrl(logo.src),
    dark: useBaseUrl(logo.srcDark ?? logo.src),
  };

  return (
    <Link to={logoLink} className="navbar__brand" aria-label="GateCtr home">
      {logo.src && (
        <div className={imageClassName ?? 'navbar__logo'}>
          <ThemedImage
            sources={sources}
            alt={logo.alt ?? navbarTitle ?? ''}
            width={logo.width}
            height={logo.height}
          />
        </div>
      )}
      {navbarTitle != null && (
        <b className={titleClassName ?? 'navbar__title text--truncate'}>
          Gate<span className="navbar-brand-c">C</span>tr
        </b>
      )}
    </Link>
  );
}
