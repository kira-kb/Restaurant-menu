'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { Language } from '@/lib/i18n/types';

interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

const LANGUAGES: Array<{
  code: Language;
  label: string;
  nativeLabel: string;
}> = [
  {
    code: 'am',
    label: 'አማርኛ',
    nativeLabel: 'Amharic',
  },
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
  },
];

export default function LanguageSwitcher({
  className = '',
  showIcon = true,
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentLanguage =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleSelectLanguage = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
        className="inline-flex items-center gap-1.5 bg-[#1E1A17] hover:bg-[#25201C] active:bg-[#2A2420] border border-[#2E2824] hover:border-[#3D342E] rounded-full px-2.5 py-1 text-xs text-[#F5F0EB] transition-colors cursor-pointer select-none shadow-xs"
      >
        {showIcon && <Languages className="w-3.5 h-3.5 text-[#10B981] shrink-0" />}
        <span className="font-semibold text-xs text-[#F5F0EB]">
          {currentLanguage.label}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-[#9E958C] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#10B981]' : ''
          }`}
        />
      </button>

      {/* Pop-up Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Available languages"
          className="absolute right-0 top-full mt-2 w-44 bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-semibold text-[#7E756C] uppercase tracking-wider border-b border-[#2A2420] mb-1">
            Language / ቋንቋ
          </div>

          <div className="space-y-0.5">
            {LANGUAGES.map((item) => {
              const isSelected = language === item.code;

              return (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#10B981]/15 text-[#10B981] font-semibold'
                      : 'text-[#F5F0EB] hover:bg-[#241F1C] hover:text-[#FFFFFF]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-xs leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-[#9E958C] leading-none mt-0.5">
                      {item.nativeLabel}
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
