"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  ChevronDown,
  Crosshair,
  Flag,
  Home,
  Keyboard,
  Map,
  Sparkles,
  Sword,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";
import type { LucideIcon } from "lucide-react";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// 模块标题区（eyebrow + 标题 + 引言），各 section 独立调用，不做模块级 .map 复用
function ModuleHeader({
  eyebrow,
  icon: Icon,
  title,
  intro,
}: {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  intro?: string;
}) {
  return (
    <div className="mb-8 text-center md:mb-12 scroll-reveal">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1.5 md:mb-4">
        <Icon className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
        <span className="text-xs font-medium tracking-wide uppercase md:text-sm">
          {eyebrow}
        </span>
      </div>
      <h2 className="mb-3 text-3xl font-bold md:mb-4 md:text-5xl">{title}</h2>
      {intro && (
        <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
          {intro}
        </p>
      )}
    </div>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  // moduleLinkMap 仍由 page.tsx 传入，但首页模块不再渲染内部文章链接，故不使用
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.urbanstrife.online";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Urban Strife Wiki",
        description:
          "Urban Strife Wiki covers beginner guides, mission walkthroughs, survivor builds, weapons, shelter upgrades, factions, maps, crafting, and tactical combat tips for the post-apocalyptic survival RPG on Steam.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Urban Strife - Post-Apocalyptic Tactical Survival RPG",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Urban Strife Wiki",
        alternateName: "Urban Strife",
        url: siteUrl,
        description:
          "Urban Strife Wiki resource hub for beginner guides, walkthroughs, builds, weapons, shelter, factions, and maps",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Urban Strife Wiki - Post-Apocalyptic Tactical Survival RPG",
        },
        sameAs: [
          "https://store.steampowered.com/app/710230/Urban_Strife/",
          "https://www.urbanstrifegame.com/",
          "https://discord.gg/2zguXAa",
          "https://x.com/UrbanStrifeGame",
          "https://www.youtube.com/urbanstrifegame/",
          "https://www.reddit.com/r/UrbanStrifeGame/",
          "https://steamcommunity.com/app/710230",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Urban Strife",
        gamePlatform: ["PC", "Steam"],
        applicationCategory: "Game",
        genre: ["Turn-Based Strategy", "Survival", "RPG", "Tactical"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 1,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://store.steampowered.com/app/710230/Urban_Strife/",
        },
      },
      {
        "@type": "VideoObject",
        name: "Urban Strife | 1.0 Launch Trailer",
        description:
          "Official Urban Strife 1.0 launch trailer from MicroProse, showcasing turn-based tactical survival RPG gameplay.",
        uploadDate: "2026-07-14",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/h-pppAfuk9w",
        url: "https://www.youtube.com/watch?v=h-pppAfuk9w",
      },
    ],
  };

  // Story walkthrough accordion state
  const [storyExpanded, setStoryExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Tools Grid 卡片 → 模块 section 锚点映射（8 张卡片对应 8 个模块）
  const sectionIds = [
    "release-info",
    "beginner-guide",
    "combat-controls",
    "best-weapons",
    "character-builds",
    "shelter-upgrades",
    "factions",
    "story-walkthrough",
  ];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center scroll-reveal">
            {/* Badge */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nav-theme)/0.3)]
                            bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1.5 md:mb-6 md:px-4 md:py-2"
            >
              <Sparkles className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs font-medium md:text-sm">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold leading-[1.05] sm:text-5xl md:mb-6 md:text-7xl">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("beginner-guide")}
                className="inline-flex items-center justify-center gap-2 bg-[hsl(var(--nav-theme))] px-6 py-3.5
                           font-semibold text-base text-white rounded-lg transition-colors
                           hover:bg-[hsl(var(--nav-theme)/0.9)] md:px-8 md:py-4 md:text-lg"
              >
                <BookOpen className="h-5 w-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://store.steampowered.com/app/710230/Urban_Strife/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-border px-6 py-3.5
                           font-semibold text-base rounded-lg transition-colors hover:bg-white/10
                           md:px-8 md:py-4 md:text-lg"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section（容器上限 max-w-5xl，避免挤压广告展示空间） */}
      <section className="px-4 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl scroll-reveal">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="h-pppAfuk9w"
              title="Urban Strife | 1.0 Launch Trailer"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（前半屏：视频区之后的模块导航区） */}
      <section className="bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 text-center md:mb-12 scroll-reveal">
            <h2 className="mb-3 text-3xl font-bold md:mb-4 md:text-5xl">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = sectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="group rounded-xl border border-border bg-card p-4 text-left
                             transition-all duration-300 cursor-pointer
                             hover:border-[hsl(var(--nav-theme)/0.5)]
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)] scroll-reveal"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg
                                  bg-[hsl(var(--nav-theme)/0.1)] transition-colors
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  md:mb-4 md:h-12 md:w-12"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))] md:h-6 md:w-6"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold md:text-base">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Latest Updates Section（位于 Tools Grid 之后） */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* Module 1: Release Date, Price and Platforms（规格表） */}
      <section id="release-info" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.urbanStrifeReleaseInfo.eyebrow}
            icon={CalendarCheck}
            title={t.modules.urbanStrifeReleaseInfo.title}
            intro={t.modules.urbanStrifeReleaseInfo.subtitle}
          />
          <p className="mx-auto -mt-4 mb-8 max-w-3xl text-center text-sm text-muted-foreground md:mb-12">
            {t.modules.urbanStrifeReleaseInfo.intro}
          </p>
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2">
            {t.modules.urbanStrifeReleaseInfo.specs.map((spec: any, index: number) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
              >
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {spec.category}
                </p>
                <p className="mb-2 font-bold text-[hsl(var(--nav-theme-light))]">
                  {spec.value}
                </p>
                <p className="text-sm text-muted-foreground">{spec.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Beginner Guide（步骤 + 贴士） */}
      <section
        id="beginner-guide"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.urbanStrifeBeginnerGuide.eyebrow}
            icon={BookOpen}
            title={t.modules.urbanStrifeBeginnerGuide.title}
            intro={t.modules.urbanStrifeBeginnerGuide.intro}
          />
          <div className="mb-8 space-y-3 scroll-reveal md:mb-10 md:space-y-4">
            {t.modules.urbanStrifeBeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:gap-4 md:p-6"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)] md:h-12 md:w-12">
                    <span className="text-base font-bold text-[hsl(var(--nav-theme-light))] md:text-xl">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1.5 text-lg font-bold md:mb-2 md:text-xl">
                      {step.title}
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground md:text-base">
                      {step.description}
                    </p>
                    {step.tips && step.tips.length > 0 && (
                      <ul className="space-y-1.5">
                        {step.tips.map((tip: string, ti: number) => (
                          <li key={ti} className="flex items-start gap-2">
                            <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                            <span className="text-sm text-muted-foreground">
                              {tip}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 3: Combat and Controls（步骤 + 示例 + 快捷键） */}
      <section id="combat-controls" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.urbanStrifeCombatControls.eyebrow}
            icon={Crosshair}
            title={t.modules.urbanStrifeCombatControls.title}
            intro={t.modules.urbanStrifeCombatControls.intro}
          />
          <div className="mb-8 space-y-3 scroll-reveal md:space-y-4">
            {t.modules.urbanStrifeCombatControls.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:gap-4 md:p-6"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)] md:h-12 md:w-12">
                    <span className="text-base font-bold text-[hsl(var(--nav-theme-light))] md:text-xl">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1.5 text-lg font-bold md:mb-2 md:text-xl">
                      {step.title}
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground md:text-base">
                      {step.description}
                    </p>
                    {step.example && (
                      <div className="rounded-lg border-l-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.05)] px-4 py-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                            Example:{" "}
                          </span>
                          {step.example}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="rounded-xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.05)] p-5 scroll-reveal md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-base font-bold md:text-lg">
                Main Combat Shortcuts
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {t.modules.urbanStrifeCombatControls.shortcuts.map(
                (s: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-white/5 p-3"
                  >
                    <kbd className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-border bg-white/10 font-mono text-sm font-bold text-[hsl(var(--nav-theme-light))]">
                      {s.key}
                    </kbd>
                    <span className="text-sm text-muted-foreground">
                      {s.action}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Module 4: Best Weapons and Gear（分级网格） */}
      <section
        id="best-weapons"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.urbanStrifeBestWeapons.eyebrow}
            icon={Sword}
            title={t.modules.urbanStrifeBestWeapons.title}
            intro={t.modules.urbanStrifeBestWeapons.intro}
          />
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2">
            {t.modules.urbanStrifeBestWeapons.tiers.map(
              (tier: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--nav-theme)/0.4)] bg-[hsl(var(--nav-theme)/0.15)] font-bold text-[hsl(var(--nav-theme-light))]">
                      {tier.tier}
                    </span>
                    <h3 className="font-bold">{tier.role}</h3>
                  </div>
                  <p className="mb-3 text-sm font-medium">{tier.weapons}</p>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-semibold text-[hsl(var(--nav-theme-light))]">
                        Best For
                      </dt>
                      <dd className="text-muted-foreground">{tier.bestFor}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[hsl(var(--nav-theme-light))]">
                        Strengths
                      </dt>
                      <dd className="text-muted-foreground">
                        {tier.strengths}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[hsl(var(--nav-theme-light))]">
                        Limitations
                      </dt>
                      <dd className="text-muted-foreground">
                        {tier.limitations}
                      </dd>
                    </div>
                  </dl>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅（模块阅读停顿） */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 5: Character Builds, Skills and Perks（角色卡片） */}
      <section
        id="character-builds"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.urbanStrifeCharacterBuilds.eyebrow}
            icon={Users}
            title={t.modules.urbanStrifeCharacterBuilds.title}
            intro={t.modules.urbanStrifeCharacterBuilds.intro}
          />
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2 lg:grid-cols-3">
            {t.modules.urbanStrifeCharacterBuilds.roles.map(
              (role: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
                >
                  <h3 className="mb-1 text-lg font-bold text-[hsl(var(--nav-theme-light))]">
                    {role.role}
                  </h3>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {role.bestFor}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {role.attributes.map((attr: string, ai: number) => (
                      <span
                        key={ai}
                        className="rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2 py-0.5 text-xs"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                  <p className="mb-4 flex-1 text-sm text-muted-foreground">
                    {role.focus}
                  </p>
                  <div className="rounded-lg border-l-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.05)] px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                        Field Plan:{" "}
                      </span>
                      {role.plan}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 6: Shelter Upgrades and Crafting（阶段时间线） */}
      <section
        id="shelter-upgrades"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.urbanStrifeShelterUpgrades.eyebrow}
            icon={Home}
            title={t.modules.urbanStrifeShelterUpgrades.title}
            intro={t.modules.urbanStrifeShelterUpgrades.intro}
          />
          <div className="relative space-y-4 border-l-2 border-[hsl(var(--nav-theme)/0.3)] pl-6 scroll-reveal">
            {t.modules.urbanStrifeShelterUpgrades.phases.map(
              (phase: any, index: number) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[1.65rem] top-1 h-4 w-4 rounded-full border-2 border-background bg-[hsl(var(--nav-theme))]" />
                  <div className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold">{phase.phase}</h3>
                      <span className="rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-0.5 text-xs font-medium">
                        {phase.priority}
                      </span>
                    </div>
                    <p className="mb-3 text-sm font-medium">{phase.focus}</p>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {phase.facilities.map((f: string, fi: number) => (
                        <span
                          key={fi}
                          className="rounded-md border border-border bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                        Goal:{" "}
                      </span>
                      {phase.goal}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 7: Factions, Reputation and Recruits（阵营卡片） */}
      <section
        id="factions"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.urbanStrifeFactions.eyebrow}
            icon={Flag}
            title={t.modules.urbanStrifeFactions.title}
            intro={t.modules.urbanStrifeFactions.intro}
          />
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2">
            {t.modules.urbanStrifeFactions.factions.map(
              (faction: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <Flag className="h-5 w-5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                    <h3 className="font-bold text-[hsl(var(--nav-theme-light))]">
                      {faction.faction}
                    </h3>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground italic">
                    {faction.alias}
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {faction.identity}
                  </p>
                  <div className="mb-4">
                    <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Perks and Equipment
                    </p>
                    <ul className="space-y-1.5">
                      {faction.perks.map((perk: string, pi: number) => (
                        <li key={pi} className="flex items-start gap-2">
                          <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                          <span className="text-sm text-muted-foreground">
                            {perk}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border-l-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.05)] px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                        Alliance Effect:{" "}
                      </span>
                      {faction.alliance}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 8: Story Walkthrough and Horde Endgame（剧透手风琴） */}
      <section
        id="story-walkthrough"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.urbanStrifeStoryWalkthrough.eyebrow}
            icon={Map}
            title={t.modules.urbanStrifeStoryWalkthrough.title}
            intro={t.modules.urbanStrifeStoryWalkthrough.intro}
          />
          <div className="space-y-3 scroll-reveal">
            {t.modules.urbanStrifeStoryWalkthrough.stages.map(
              (stage: any, index: number) => {
                const isOpen = storyExpanded === index;
                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-border"
                  >
                    <button
                      onClick={() =>
                        setStoryExpanded(isOpen ? null : index)
                      }
                      className="hover:bg-white/5 transition-colors"
                    >
                      <div className="flex w-full items-center gap-3 p-5 text-left">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[hsl(var(--nav-theme)/0.4)] bg-[hsl(var(--nav-theme)/0.15)] text-sm font-bold text-[hsl(var(--nav-theme-light))]">
                          {index + 1}
                        </span>
                        <span className="flex-1 font-semibold">
                          {stage.heading}
                        </span>
                        <span className="hidden rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-0.5 text-xs sm:inline">
                          Spoiler: {stage.spoiler}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t border-border px-5 py-4 md:px-6">
                        <div className="mb-4">
                          <p className="mb-2 text-xs font-semibold tracking-wide text-[hsl(var(--nav-theme-light))] uppercase">
                            Objectives
                          </p>
                          <ul className="space-y-1.5">
                            {stage.objectives.map((o: string, oi: number) => (
                              <li
                                key={oi}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                                <span>{o}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mb-4">
                          <p className="mb-2 text-xs font-semibold tracking-wide text-[hsl(var(--nav-theme-light))] uppercase">
                            Key Decisions
                          </p>
                          <ul className="space-y-1.5">
                            {stage.decisions.map((d: string, di: number) => (
                              <li
                                key={di}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg border-l-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.05)] px-3 py-2">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                              Readiness Check:{" "}
                            </span>
                            {stage.readiness}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="border-t border-border bg-white/[0.02]">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.gg/2zguXAa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/UrbanStrifeGame"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://steamcommunity.com/app/710230"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/710230/Urban_Strife/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
