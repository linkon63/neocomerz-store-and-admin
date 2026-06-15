'use client';

import { useState } from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';

interface BrewingTip {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface ProductTabsProps {
  description: string;
  collections: { title: string; text: string }[];
  ingredients: string[];
  brewingTips: BrewingTip[];
}

export default function ProductTabs({
  description,
  collections,
  ingredients,
  brewingTips,
}: ProductTabsProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full flex flex-col gap-6 pt-4 border-t border-stone-200">
      {/* Description Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pt-3 pb-2 border-b border-stone-300 flex justify-between items-center cursor-pointer"
      >
        <span className="font-bembo text-lg font-normal text-stone-800 uppercase tracking-wide">
          Description
        </span>
        <IoChevronDownOutline className={`w-4 h-4 text-stone-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Sequential Contents */}
      <div
        className={`flex flex-col gap-6 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Description Body */}
        <div className="flex flex-col gap-4">
          <p className="font-bembo text-lg text-stone-800 leading-relaxed">
            {description}
          </p>
          <div className="font-bembo text-3xl sm:text-4xl text-stone-800 font-normal">
            4 Collection:
          </div>
          <div className="flex flex-col gap-4">
            {collections.map((item, idx) => (
              <div key={idx} className="text-stone-800 leading-relaxed">
                <span className="font-gotham text-sm font-medium uppercase tracking-wider mr-1.5">
                  {idx + 1}. {item.title}
                </span>
                <span className="font-bembo text-lg font-normal leading-relaxed">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients Block */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bembo text-lg font-normal text-stone-800">
            Ingredients:
          </h4>
          <div className="font-bembo text-lg font-normal text-stone-600 leading-relaxed flex flex-col gap-1">
            {ingredients.map((ing, idx) => (
              <div key={idx}>{ing}</div>
            ))}
          </div>
        </div>

        {/* Brewing Tips Block */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bembo text-lg font-normal text-stone-800">
            Brewing Tips
          </h4>
          <div className="flex flex-wrap gap-8 items-start">
            {brewingTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="p-3 bg-neutral-100 rounded-full text-stone-800 flex items-center justify-center">
                  {tip.icon}
                </div>
                <div className="font-bembo text-lg font-normal text-stone-800 leading-relaxed">
                  {tip.label}:<br />
                  <span className="font-medium">{tip.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
