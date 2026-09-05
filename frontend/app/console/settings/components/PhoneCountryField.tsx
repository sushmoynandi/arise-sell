"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cx } from "@/lib/format";
import {
  IconCheck,
  IconSearch,
  IconChevronsUpDown,
} from "@/components/ui/icons";

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

export const COUNTRIES: Country[] = [
  {
    code: "BD",
    name: "Bangladesh",
    dialCode: "+880",
    flag: "🇧🇩",
    placeholder: "1711-234567",
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    placeholder: "(555) 000-0000",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
    placeholder: "7911 123456",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
    placeholder: "(555) 000-0000",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "🇦🇪",
    placeholder: "50 123 4567",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    flag: "🇸🇦",
    placeholder: "50 123 4567",
  },
  {
    code: "QA",
    name: "Qatar",
    dialCode: "+974",
    flag: "🇶🇦",
    placeholder: "3312 3456",
  },
  {
    code: "KW",
    name: "Kuwait",
    dialCode: "+965",
    flag: "🇰🇼",
    placeholder: "5123 4567",
  },
  {
    code: "OM",
    name: "Oman",
    dialCode: "+968",
    flag: "🇴🇲",
    placeholder: "9123 4567",
  },
  {
    code: "BH",
    name: "Bahrain",
    dialCode: "+973",
    flag: "🇧🇭",
    placeholder: "3600 1234",
  },
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
    placeholder: "98765 43210",
  },
  {
    code: "PK",
    name: "Pakistan",
    dialCode: "+92",
    flag: "🇵🇰",
    placeholder: "300 1234567",
  },
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "+60",
    flag: "🇲🇾",
    placeholder: "12-345 6789",
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "🇸🇬",
    placeholder: "8123 4567",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
    placeholder: "412 345 678",
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "🇩🇪",
    placeholder: "151 23456789",
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "🇫🇷",
    placeholder: "6 12 34 56 78",
  },
  {
    code: "IT",
    name: "Italy",
    dialCode: "+39",
    flag: "🇮🇹",
    placeholder: "312 345 6789",
  },
  {
    code: "NL",
    name: "Netherlands",
    dialCode: "+31",
    flag: "🇳🇱",
    placeholder: "6 12345678",
  },
  {
    code: "TR",
    name: "Turkey",
    dialCode: "+90",
    flag: "🇹🇷",
    placeholder: "532 123 4567",
  },
  {
    code: "CN",
    name: "China",
    dialCode: "+86",
    flag: "🇨🇳",
    placeholder: "138 0013 8000",
  },
  {
    code: "JP",
    name: "Japan",
    dialCode: "+81",
    flag: "🇯🇵",
    placeholder: "90-1234-5678",
  },
  {
    code: "KR",
    name: "South Korea",
    dialCode: "+82",
    flag: "🇰🇷",
    placeholder: "10-1234-5678",
  },
];

export function parsePhoneNumber(raw: string): {
  country: Country;
  number: string;
} {
  const clean = (raw || "").trim();
  if (!clean) {
    return { country: COUNTRIES[0], number: "" };
  }

  // Sort dialCodes descending by length so +880 matches before +8
  const sorted = [...COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length,
  );

  for (const c of sorted) {
    if (clean.startsWith(c.dialCode)) {
      const rest = clean.slice(c.dialCode.length).trim();
      return { country: c, number: rest };
    }
  }

  // Handle local BD formats starting with 01
  if (clean.startsWith("01")) {
    return { country: COUNTRIES[0], number: clean };
  }

  return { country: COUNTRIES[0], number: clean };
}

export interface PhoneCountryFieldProps {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (val: string) => void;
  helper?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

export function PhoneCountryField({
  id,
  name,
  label = "Mobile Phone",
  value,
  onChange,
  helper,
  disabled = false,
  required = false,
  autoComplete,
  className,
}: PhoneCountryFieldProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    () => parsePhoneNumber(value).country,
  );
  const [numberPart, setNumberPart] = useState(
    () => parsePhoneNumber(value).number,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id || generatedId;

  // Sync with incoming value if it changes externally
  if (value !== prevValue) {
    setPrevValue(value);
    const p = parsePhoneNumber(value);
    if (value && value.startsWith("+")) {
      setSelectedCountry(p.country);
    }
    setNumberPart(p.number);
  }

  // Click outside & Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    // Focus search input when dropdown opens
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredCountries = COUNTRIES.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch("");
    const combined = numberPart.trim()
      ? `${country.dialCode} ${numberPart.trim()}`
      : country.dialCode;
    onChange(combined);
    phoneInputRef.current?.focus();
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Detect if pasted full international number with +
    if (raw.startsWith("+")) {
      const p = parsePhoneNumber(raw);
      setSelectedCountry(p.country);
      setNumberPart(p.number);
      onChange(
        p.number ? `${p.country.dialCode} ${p.number}` : p.country.dialCode,
      );
      return;
    }

    // Only allow phone characters (digits, spaces, hyphens, parentheses)
    const cleanNumber = raw.replace(/[^\d\s\-()]/g, "");
    setNumberPart(cleanNumber);
    const combined = cleanNumber.trim()
      ? `${selectedCountry.dialCode} ${cleanNumber.trim()}`
      : selectedCountry.dialCode;
    onChange(combined);
  };

  return (
    <div className={cx("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-bold text-text flex items-center gap-1.5 select-none"
        >
          <span>{label}</span>
          {required && (
            <span className="text-signal font-mono text-[11px]">*</span>
          )}
        </label>
        <span className="text-[10px] font-mono text-text-3/80 font-medium">
          {selectedCountry.name} ({selectedCountry.code})
        </span>
      </div>

      {/* Unified Input Container */}
      <div
        className={cx(
          "relative flex items-stretch rounded-xl border transition-all shadow-2xs",
          disabled
            ? "bg-surface-2/60 border-line/70 cursor-not-allowed opacity-80"
            : "bg-white border-line/80 focus-within:border-signal focus-within:ring-2 focus-within:ring-signal/15",
        )}
      >
        {/* Country Code Trigger Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            className={cx(
              "h-full flex items-center gap-2 px-3 py-2.5 bg-surface-2/40 hover:bg-surface-2 text-text text-[13px] font-medium rounded-l-xl transition-colors select-none cursor-pointer border-r border-line/80 shrink-0 outline-none focus:outline-none",
              isOpen && "bg-surface-2 text-signal border-signal/30",
              disabled && "cursor-not-allowed pointer-events-none",
            )}
            title="Select Country & Dial Code"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="text-base leading-none select-none">
              {selectedCountry.flag}
            </span>
            <span className="font-mono text-xs font-semibold text-text">
              {selectedCountry.dialCode}
            </span>
            <IconChevronsUpDown
              width={13}
              height={13}
              className="text-text-3 shrink-0"
            />
          </button>

          {/* Popover Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-xl border border-line bg-white shadow-xl overflow-hidden"
              >
                {/* Search Bar */}
                <div className="p-2.5 border-b border-line bg-surface-2/30">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-text-3 pointer-events-none">
                      <IconSearch width={13} height={13} />
                    </span>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search country or code..."
                      className="w-full bg-white pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-3/60 rounded-lg border border-line focus:border-signal outline-none focus:outline-none focus:ring-1 focus:ring-signal/20 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Country List */}
                <div
                  className="max-h-56 overflow-y-auto divide-y divide-line/40 p-1"
                  role="listbox"
                >
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((c) => {
                      const isSelected = c.code === selectedCountry.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleSelectCountry(c)}
                          className={cx(
                            "w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-lg text-xs transition-colors cursor-pointer",
                            isSelected
                              ? "bg-signal-wash text-signal font-semibold"
                              : "hover:bg-surface-2 text-text",
                          )}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <span className="text-base shrink-0 leading-none select-none">
                            {c.flag}
                          </span>
                          <span className="truncate font-medium flex-1">
                            {c.name}
                          </span>
                          <span className="font-mono text-[10px] text-text-3/80 px-1 py-0.5 rounded bg-surface-2 shrink-0">
                            {c.code}
                          </span>
                          <span className="font-mono text-xs font-semibold text-text shrink-0">
                            {c.dialCode}
                          </span>
                          {isSelected && (
                            <IconCheck
                              width={14}
                              height={14}
                              className="text-signal shrink-0 stroke-[2.5]"
                            />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-text-3">
                      No country found for &ldquo;{search}&rdquo;
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Number Input Field */}
        <input
          ref={phoneInputRef}
          id={inputId}
          name={name || "phone"}
          type="tel"
          value={numberPart}
          onChange={handleNumberChange}
          disabled={disabled}
          placeholder={selectedCountry.placeholder}
          autoComplete={autoComplete || "tel-national"}
          className={cx(
            "w-full bg-transparent px-3 py-2.5 text-[13px] font-mono text-text placeholder:text-text-3/50 font-normal outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none shadow-none",
            disabled && "cursor-not-allowed text-text-3",
          )}
        />
      </div>

      {helper && (
        <p className="text-[11px] text-text-3 leading-snug">{helper}</p>
      )}
    </div>
  );
}
