"use client";

import Image from "next/image";
import type { InfluencerCreator, InfluencerStat } from "@/lib/services";

type Props = {
  creators: InfluencerCreator[];
  stats: InfluencerStat[];
  label?: string;
};

function creatorInitial(handle: string) {
  const clean = handle.replace(/^@/, "");
  return clean.charAt(0).toUpperCase() || "?";
}

function CreatorAvatar({ creator }: { creator: InfluencerCreator }) {
  const initial = creatorInitial(creator.handle);

  return (
    <div className="influencer-avatar-ring">
      <div className="influencer-avatar">
        {creator.avatar ? (
          <Image
            src={creator.avatar}
            alt=""
            width={88}
            height={88}
            className="influencer-avatar-img"
          />
        ) : (
          <span className="influencer-avatar-fallback" aria-hidden>
            {initial}
          </span>
        )}
      </div>
    </div>
  );
}

export default function InfluencersShowcase({ creators, stats, label }: Props) {
  if (creators.length === 0) return null;

  return (
    <section className="influencers-showcase" aria-label={label ?? "Creadores"}>
      {label ? (
        <div className="project-carousel-header-bar">
          <div className="content-width project-reels-header">
            <p className="ui-label" style={{ color: "var(--accent)" }}>
              {label}
            </p>
          </div>
        </div>
      ) : null}

      <div className="content-width influencers-track-shell">
        <div className="influencers-track">
          {creators.map((creator) => (
            <article key={creator.handle} className="influencer-card">
              <CreatorAvatar creator={creator} />
              <p className="influencer-handle">{creator.handle}</p>
              <p className="influencer-followers">{creator.followers}</p>
            </article>
          ))}
        </div>
      </div>

      {stats.length > 0 ? (
        <div className="influencers-metrics content-width">
          <div className="service-metrics-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="service-metric-card">
                <p className="service-metric-value">{stat.value}</p>
                <p className="service-metric-copy">
                  <span className="service-metric-label">{stat.label}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
