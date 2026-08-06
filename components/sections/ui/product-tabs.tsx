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
      {description && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full pt-3 pb-2 border-b border-stone-300 flex justify-between items-center cursor-pointer"
        >
          <span className="font-bembo text-lg font-normal text-stone-800 uppercase tracking-wide">
            Description
          </span>
          <IoChevronDownOutline className={`w-4 h-4 text-stone-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      <div
        className={`flex flex-col gap-6 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        {description && (
          <div className="flex flex-col gap-4">
            <div 
              className="font-bembo text-lg text-stone-850 leading-relaxed space-y-4 
                         [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:my-3
                         [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:my-3
                         [&_h1]:text-3xl [&_h1]:font-normal [&_h1]:font-bembo [&_h1]:text-stone-800 [&_h1]:mt-6 [&_h1]:mb-3
                         [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:font-bembo [&_h2]:text-stone-800 [&_h2]:mt-5 [&_h2]:mb-3
                         [&_h3]:text-xl [&_h3]:font-normal [&_h3]:font-bembo [&_h3]:text-stone-800 [&_h3]:mt-4 [&_h3]:mb-2
                         [&_strong]:font-medium [&_strong]:text-stone-900"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}

        {collections.length > 0 && (
          <>
            <div className="font-bembo text-3xl sm:text-4xl text-stone-800 font-normal">
              {collections.length} Collection:
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
          </>
        )}

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
