"use strict";
`` `tsx
import React from 'react';
import { styled } from '@radix-ui/core';
import { CheckIcon } from '@radix-ui/icons';
import { greyA } from '@radix-ui/colors';

// Styled components for Radix UI
const StyledHeader = styled('header');
const StyledCard = styled('div');
const StyledGrid = styled('div');
const StyledVideoCard = styled('div');
const StyledFooter = styled('footer');

// Component interfaces
interface LogoProps {
  src: string;
  alt: string;
}

interface TitleProps {
  children: React.ReactNode;
}

interface NavigationLinkProps {
  to: string;
  children: React.ReactNode;
}

interface AuthButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TestimonialItemProps {
  text: string;
  author: string;
  authorTitle: string;
  authorImageSrc: string;
}

interface CTAInputProps {
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface CTAButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

// Components
const Logo: React.FC<LogoProps> = ({ src, alt }) => <img src={src} alt={alt} />;

const Title: React.FC<TitleProps> = ({ children }) => <h1>{children}</h1>;

const NavigationLink: React.FC<NavigationLinkProps> = ({ to, children }) => (
  <a href={to}>{children}</a>
);

const AuthButton: React.FC<AuthButtonProps> = ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
);

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <div>
    {icon}
    <Title>{title}</Title>
    <p>{description}</p>
  </div>
);

const TestimonialItem: React.FC<TestimonialItemProps> = ({ text, author, authorTitle, authorImageSrc }) => (
  <div>
    <p>{text}</p>
    <div>
      <Logo src={authorImageSrc} alt={author} />
      <div>
        <Title>{author}</Title>
        <p>{authorTitle}</p>
      </div>
    </div>
  </div>
);

const CTAInput: React.FC<CTAInputProps> = ({ placeholder, onChange }) => (
  <input type="email" placeholder={placeholder} onChange={onChange} />
);

const CTAButton: React.FC<CTAButtonProps> = ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
);

// Main components
const TopNavBar: React.FC = () => (
  <StyledHeader>
    <Logo src="/logo.png" alt="Logo" />
    <Title>Website Title</Title>
    <nav>
      <NavigationLink to="/features">Features</NavigationLink>
      <NavigationLink to="/pricing">Pricing</NavigationLink>
      <NavigationLink to="/about">About</NavigationLink>
    </nav>
    <div>
      <AuthButton onClick={() => {}}>Login</AuthButton>
      <AuthButton onClick={() => {}}>SignUp</AuthButton>
    </div>
  </StyledHeader>
);

const HeroSection: React.FC = () => (
  <StyledCard>
    <Title>Hero Section Title</Title>
    <p>Hero Section Subtitle</p>
    <AuthButton onClick={() => {}}>CTAButton</AuthButton>
    <Logo src="/hero-image.png" alt="Hero Image" />
  </StyledCard>
);

const FeatureSection: React.FC = () => (
  <StyledGrid>
    <Title>FeatureSection Title</Title>
    <p>FeatureSection Description</p>
    <StyledGrid>
      <FeatureItem
        icon={<CheckIcon />}
        title="Feature 1"
        description="Description for feature 1"
      />
      {/* More FeatureItems here */}
    </StyledGrid>
  </StyledGrid>
);

const VisualDemonstrationSection: React.FC = () => (
  <StyledVideoCard>
    <Title>Visual Demonstration Title</Title>
    <video controls>
      <source src="/video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </StyledVideoCard>
);

const TestimonialsSection: React.FC = () => (
  <StyledGrid>
    <Title>Testimonials Title</Title>
    <StyledGrid>
      <TestimonialItem
        text="Testimonial text here"
        author="Author Name"
        authorTitle="Author Title"
        authorImageSrc="/avatar.png"
      />
      {/* More TestimonialItems here */}
    </StyledGrid>
  </StyledGrid>
);

const CTABlock: React.FC = () => (
  <StyledCard>
    <Title>CTABlock Title</Title>
    <p>CTABlock Description</p>
    <CTAInput placeholder="Enter your email" onChange={() => {}} />
    <CTAButton onClick={() => {}}>SignUpButton</CTAButton>
  </StyledCard>
);

const Footer: React.FC = () => (
  <StyledFooter>
    <Logo src="/logo.png" alt="Footer Logo" />
    <Title>Copyright</Title>
    <nav>
      <NavigationLink to="/terms">Terms of Service</NavigationLink>
      <NavigationLink to="/privacy">Privacy Policy</NavigationLink>
      <NavigationLink to="/contact">Contact</NavigationLink>
    </nav>
  </StyledFooter>
);

// Main App component
const App: React.FC = () => {
  return (
    <div>
      <TopNavBar />
      <HeroSection />
      <FeatureSection />
      <VisualDemonstrationSection />
      <TestimonialsSection />
      <CTABlock />
      <Footer />
    </div>
  );
};

export default App;
` ``;
//# sourceMappingURL=LandingPage.js.map