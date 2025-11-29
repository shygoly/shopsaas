"use strict";
`` `tsx
import React from 'react';
import {
  Collapsible,
  DropdownMenu,
  NavigationMenu,
  Popover,
  Toggle,
  Select,
  Button,
  ToggleGroup,
  ToggleButton,
  SelectGroup,
  SelectTrigger,
  SelectOptions,
  SelectOption,
} from '@radix-ui/react-collapsible';
import { ChevronRight } from '@radix-ui/react-icons';
import { Check } from '@radix-ui/react-icons';

// Define types for props
interface SideNavProps {
  children: React.ReactNode;
}

interface NavbarProps {
  children: React.ReactNode;
}

interface CardProps {
  children: React.ReactNode;
}

interface ToggleProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SelectProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

// Define components
const SideNav: React.FC<SideNavProps> = ({ children }) => {
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418]">
      {children}
    </aside>
  );
};

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b border-gray-200 dark:border-gray-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm px-8">
      {children}
    </header>
  );
};

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
      {children}
    </div>
  );
};

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => {
  return (
    <ToggleGroup>
      <ToggleButton checked={checked} onChange={onChange}>
        <Check />
      </ToggleButton>
    </ToggleGroup>
  );
};

const Select: React.FC<SelectProps> = ({ options, value, onChange }) => {
  return (
    <SelectGroup>
      <SelectTrigger>
        {({ getTriggerProps }) => (
          <div {...getTriggerProps()}>Selected: {value}</div>
        )}
      </SelectTrigger>
      <SelectOptions>
        {options.map((option) => (
          <SelectOption key={option.value} value={option.value} {...{ onChange }}>
            {option.label}
          </SelectOption>
        ))}
      </SelectOptions>
    </SelectGroup>
  );
};

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <Button onClick={onClick}>
      {children}
    </Button>
  );
};

// Main component
const Dashboard: React.FC = () => {
  const [shopStatus, setShopStatus] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState('option1');

  return (
    <div className="flex h-screen">
      <SideNav>
        {/* Side navigation content */}
      </SideNav>
      <main className="flex-1 overflow-y-auto">
        <Navbar>
          {/* Top navigation content */}
        </Navbar>
        <div className="p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {/* Breadcrumbs content */}
          </div>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            {/* Page heading content */}
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              {/* Left column content */}
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                {/* Configuration card content */}
                <Card>
                  {/* Card content */}
                  <Toggle checked={shopStatus} onChange={() => setShopStatus(!shopStatus)} />
                  <Select
                    options={[{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }]}
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <Button onClick={() => console.log('Button clicked')}>Click me</Button>
                </Card>
              </div>
              <div className="rounded-xl border border-red-500/50 dark:border-red-500/30 bg-white dark:bg-gray-900/50">
                {/* Danger zone content */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
` ``;
//# sourceMappingURL=ShopDetails.js.map