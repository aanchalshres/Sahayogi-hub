"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, X, Check, ChevronDown } from "lucide-react";

interface Skill {
  id: number;
  name: string;
}

interface SkillSelectorProps {
  skills: Skill[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

export default function SkillSelector({
  skills,
  selectedIds,
  onChange,
  placeholder = "Search skills...",
  disabled = false,
  loading = false,
  label = "Required Skills",
}: SkillSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      skills.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [skills, search]
  );

  const selectedSkills = useMemo(
    () => skills.filter((s) => selectedIds.includes(s.id)),
    [skills, selectedIds]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSkill = useCallback(
    (id: number) => {
      onChange(
        selectedIds.includes(id)
          ? selectedIds.filter((sid) => sid !== id)
          : [...selectedIds, id]
      );
    },
    [selectedIds, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          setOpen(true);
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filtered.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filtered.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filtered.length) {
            toggleSkill(filtered[focusedIndex].id);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setSearch("");
          setFocusedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [open, filtered, focusedIndex, toggleSkill]
  );

  const focusSearchOnOpen = useCallback(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    focusSearchOnOpen();
  }, [focusSearchOnOpen]);

  useEffect(() => {
    if (listRef.current && focusedIndex >= 0) {
      const item = listRef.current.children[focusedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  return (
    <div>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <div
          className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm cursor-text transition
            ${open ? "border-[#4F46C8] ring-1 ring-[#4F46C8]/30" : "border-gray-200"}
            ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-[#4F46C8]"}
            bg-white`}
          onClick={() => {
            if (!disabled) {
              setOpen(!open);
              setFocusedIndex(-1);
            }
          }}
        >
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFocusedIndex(-1);
              if (!open) setOpen(true);
            }}
            onFocus={() => {
              if (!disabled) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
            disabled={disabled}
          />
          {loading ? (
            <div className="w-4 h-4 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          ) : (
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
        </div>

        {open && (
          <div
            ref={listRef}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
            onKeyDown={handleKeyDown}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                {search ? "No skills found." : "No skills available."}
              </div>
            ) : (
              filtered.map((skill, index) => {
                const selected = selectedIds.includes(skill.id);
                return (
                  <div
                    key={skill.id}
                    role="option"
                    aria-selected={selected}
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition
                      ${focusedIndex === index ? "bg-[#EEF0FF]" : "hover:bg-gray-50"}
                      ${selected ? "bg-[#EEF0FF]/60" : ""}`}
                    onClick={() => toggleSkill(skill.id)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition shrink-0
                        ${selected ? "bg-[#4F46C8] border-[#4F46C8]" : "border-gray-300"}`}
                    >
                      {selected && <Check size={12} className="text-white" />}
                    </div>
                    <span className={selected ? "font-medium text-gray-900" : "text-gray-700"}>
                      {skill.name}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedSkills.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">
            {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[#4F46C8] shadow-sm"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${skill.name}`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
