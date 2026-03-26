import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './index.module.css';

const LightningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.featureSvg} aria-hidden="true">
    <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H13L13 2z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.featureSvg} aria-hidden="true">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
  </svg>
);

const RouteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.featureSvg} aria-hidden="true">
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.featureSvg} aria-hidden="true">
    <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.featureSvg} aria-hidden="true">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
  </svg>
);

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.featureSvg} aria-hidden="true">
    <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const features = [
  {
    icon: <LightningIcon />,
    titleKey: 'home.feature.optimizer.title',
    title: '-40% Tokens',
    descKey: 'home.feature.optimizer.desc',
    desc: 'Prompts compressed automatically. Same output. -40% token cost.',
  },
  {
    icon: <ShieldIcon />,
    titleKey: 'home.feature.budget.title',
    title: 'Budget Firewall',
    descKey: 'home.feature.budget.desc',
    desc: 'Hard caps per project. Requests blocked the moment a limit is hit.',
  },
  {
    icon: <RouteIcon />,
    titleKey: 'home.feature.router.title',
    title: 'Model Router',
    descKey: 'home.feature.router.desc',
    desc: 'GateCtr picks the right LLM for each request. You pay less.',
  },
  {
    icon: <BarChartIcon />,
    titleKey: 'home.feature.analytics.title',
    title: 'Analytics',
    descKey: 'home.feature.analytics.desc',
    desc: 'Every token. Every cost. Real-time.',
  },
  {
    icon: <BellIcon />,
    titleKey: 'home.feature.webhooks.title',
    title: 'Webhooks',
    descKey: 'home.feature.webhooks.desc',
    desc: 'Budget alerts sent to Slack, Teams, or any endpoint.',
  },
  {
    icon: <KeyIcon />,
    titleKey: 'home.feature.rbac.title',
    title: 'RBAC',
    descKey: 'home.feature.rbac.desc',
    desc: 'Team access control. Granular permissions per project.',
  },
];

function HeroSection() {
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <div className={styles.heroEyebrow}>
          <Translate id="home.hero.eyebrow">LLM Gateway · Cost Control · Smart Routing</Translate>
        </div>
        <h1 className={styles.heroTitle}>
          <Translate id="home.hero.title.line1">One gateway.</Translate>
          {' '}
          <span className={styles.heroAccent}>
            <Translate id="home.hero.title.line2">Every LLM.</Translate>
          </span>
        </h1>
        <p className={styles.heroSubtitle}>
          <Translate id="home.hero.subtitle">
            One endpoint swap. -40% token costs. No code changes.
          </Translate>
        </p>
        <div className={styles.heroCode}>
          <Translate id="home.hero.code">npm install @gatectr/sdk</Translate>
        </div>
        <div className={styles.buttons}>
          <Link className={styles.btnPrimary} to="/docs/getting-started/quickstart">
            <Translate id="home.hero.cta.primary">Start free</Translate>
          </Link>
          <Link className={styles.btnSecondary} to="/docs/api-reference/complete">
            <Translate id="home.hero.cta.secondary">View docs</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({ icon, titleKey, title, descKey, desc }) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <h3><Translate id={titleKey}>{title}</Translate></h3>
        <p><Translate id={descKey}>{desc}</Translate></p>
      </div>
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={translate({ id: 'home.meta.title', message: 'GateCtr — One gateway. Every LLM.' })}
      description={translate({
        id: 'home.meta.description',
        message:
          'One endpoint. Every LLM. -40% token costs with no code changes. Built-in budget control, smart routing, and real-time analytics.',
      })}
    >
      <HeroSection />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map((f) => (
                <FeatureCard key={f.titleKey} {...f} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
