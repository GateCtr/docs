import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './index.module.css';

const features = [
  {
    emoji: '⚡',
    titleKey: 'home.feature.optimizer.title',
    title: '-40% Tokens',
    descKey: 'home.feature.optimizer.desc',
    desc: 'Context Optimizer compresses prompts automatically — same output, lower cost.',
  },
  {
    emoji: '🛡️',
    titleKey: 'home.feature.budget.title',
    title: 'Budget Firewall',
    descKey: 'home.feature.budget.desc',
    desc: 'Hard caps per project. Requests are blocked the moment a limit is hit.',
  },
  {
    emoji: '🧭',
    titleKey: 'home.feature.router.title',
    title: 'Model Router',
    descKey: 'home.feature.router.desc',
    desc: 'GateCtr picks the right LLM for each request. You pay for the model you actually need.',
  },
  {
    emoji: '📊',
    titleKey: 'home.feature.analytics.title',
    title: 'Analytics',
    descKey: 'home.feature.analytics.desc',
    desc: 'Every token, every cost, real-time — across all projects and models.',
  },
  {
    emoji: '🔔',
    titleKey: 'home.feature.webhooks.title',
    title: 'Webhooks',
    descKey: 'home.feature.webhooks.desc',
    desc: 'Push budget alerts and events to Slack, Teams, or any endpoint.',
  },
  {
    emoji: '🔑',
    titleKey: 'home.feature.rbac.title',
    title: 'RBAC',
    descKey: 'home.feature.rbac.desc',
    desc: 'Role-based access control for teams. Granular permissions per project.',
  },
];

function HeroSection() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">
          <Translate id="home.hero.title">One gateway. Every LLM.</Translate>
        </h1>
        <p className="hero__subtitle">
          <Translate id="home.hero.subtitle">
            GateCtr sits between your app and any LLM provider. One endpoint swap. No code changes.
            Full control over costs, routing, and observability.
          </Translate>
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/getting-started/quickstart">
            <Translate id="home.hero.cta.quickstart">Quickstart — 5 min ⚡</Translate>
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/api-reference/complete"
          >
            <Translate id="home.hero.cta.api">API Reference</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({ emoji, title, desc }) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.featureEmoji}>{emoji}</div>
        <h3>{title}</h3>
        <p>{desc}</p>
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
          'GateCtr is an LLM gateway with built-in cost control, smart routing, prompt compression, and real-time analytics.',
      })}
    >
      <HeroSection />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
