import React, { useMemo } from 'react';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import YouTubeHero from './YouTubeHero';
import StatsBarWrapper from './StatsBarWrapper';
import FeaturedServicesWrapper from './FeaturedServicesWrapper';
import ConsultationBanner from './ConsultationBanner';
import ProjectListWrapper from './ProjectListWrapper';
import ClientsShowcaseWrapper from './ClientsShowcaseWrapper';
import ShadesTesterWrapper from './ShadesTesterWrapper';
import ReviewsShowcaseWrapper from './ReviewsShowcaseWrapper';
import ArticlesSectionWrapper from './ArticlesSectionWrapper';
import BrandPartnersWrapper from './BrandPartnersWrapper';
import CampaignBanner from './CampaignBanner';

interface DynamicHomepageSectionProps {
  sectionName: string;
  content?: any;
  className?: string;
}

// Optionally wrap heavy components with React.memo in their own files for best results

const sectionComponentMap: Record<string, React.ComponentType<{ content?: any }>> = {
  campaign_banner: CampaignBanner,
  hero: YouTubeHero,
  stats_bar: StatsBarWrapper,
  featured_services: FeaturedServicesWrapper,
  consultation_banner: ConsultationBanner,
  project_list: ProjectListWrapper,
  clients_showcase: ClientsShowcaseWrapper,
  shades_tester: ShadesTesterWrapper,
  reviews_showcase: ReviewsShowcaseWrapper,
  articles_section: ArticlesSectionWrapper,
  brand_partners: BrandPartnersWrapper,
};

const DynamicHomepageSection: React.FC<DynamicHomepageSectionProps> = ({
  sectionName,
  content,
  className = '',
}) => {
  const SectionComponent = useMemo(() => sectionComponentMap[sectionName], [sectionName]);

  if (!SectionComponent) {
    console.warn(`Unknown homepage section: ${sectionName}. This section will not be rendered.`);
    return null;
  }

  return (
    <div className={className}>
      <SectionComponent content={content} />
    </div>
  );
};

export default DynamicHomepageSection;