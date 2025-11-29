import React from 'react';
type Feature = {
    icon: string;
    title: string;
    description: string;
};
type Testimonial = {
    avatar: string;
    quote: string;
    name: string;
    role: string;
};
export declare const TopNavBar: React.FC;
export declare const HeroSection: React.FC;
export declare const FeatureSection: React.FC<{
    features: Feature[];
}>;
export declare const VisualDemonstrationSection: React.FC;
export declare const TestimonialsSection: React.FC<{
    testimonials: Testimonial[];
}>;
export declare const CTABlock: React.FC;
export declare const Footer: React.FC;
declare const HomePage: React.FC;
export default HomePage;
//# sourceMappingURL=HomepageLandingPage.d.ts.map