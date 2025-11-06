/**
 * ================================================
 * SKILL SELECTOR COMPONENT
 * ================================================
 * Searchable multi-select for skills/tags
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 6, 2025
 * Sprint: Job Posting System - Story 1, Task 1.1
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// ================================================
// POPULAR SKILLS (Pre-defined suggestions)
// ================================================

const POPULAR_SKILLS = [
  // Web Development
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'NestJS',
  'PHP',
  'Laravel',
  'Python',
  'Django',

  // Mobile
  'React Native',
  'Flutter',
  'Swift',
  'Kotlin',
  'iOS',
  'Android',

  // Backend
  'Java',
  'Spring Boot',
  'C#',
  '.NET',
  'Ruby',
  'Go',
  'Rust',

  // Database
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',

  // DevOps
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'CI/CD',

  // Design
  'Figma',
  'Adobe XD',
  'Photoshop',
  'Illustrator',
  'UI/UX',

  // Other
  'Git',
  'REST API',
  'GraphQL',
  'Microservices',
  'TDD',
];

// ================================================
// TYPES
// ================================================

export interface SkillSelectorProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  placeholder?: string;
  error?: string;
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export function SkillSelector({
  skills,
  onChange,
  maxSkills = 15,
  placeholder = 'Beceri ara veya ekle...',
  error,
  className,
}: SkillSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ==================== EFFECTS ====================

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = POPULAR_SKILLS.filter(
        (skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !skills.includes(skill)
      ).slice(0, 10);
      setSuggestions(filtered);
    } else {
      // Show popular skills that aren't selected
      setSuggestions(
        POPULAR_SKILLS.filter((skill) => !skills.includes(skill)).slice(0, 10)
      );
    }
  }, [searchQuery, skills]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== HANDLERS ====================

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (!trimmedSkill) return;

    if (skills.length >= maxSkills) {
      return; // Max limit reached
    }

    if (!skills.includes(trimmedSkill)) {
      onChange([...skills, trimmedSkill]);
      setSearchQuery('');
      inputRef.current?.focus();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        addSkill(searchQuery);
      }
    } else if (e.key === 'Backspace' && !searchQuery && skills.length > 0) {
      // Remove last skill on backspace if input is empty
      removeSkill(skills[skills.length - 1]);
    }
  };

  const handleSuggestionClick = (skill: string) => {
    addSkill(skill);
    setIsOpen(false);
  };

  // ==================== RENDER ====================

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected Skills */}
      {skills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1.5"
            >
              <span className="text-sm">{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:bg-secondary-foreground/20 ml-1 rounded-sm"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={skills.length >= maxSkills}
            className={cn('pl-10', error && 'border-destructive')}
          />
        </div>

        {skills.length >= maxSkills && (
          <div className="text-muted-foreground mt-2 text-sm">
            Maksimum {maxSkills} beceri eklenebilir
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && skills.length < maxSkills && (
        <Card className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto">
          <div className="space-y-1 p-2">
            {suggestions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSuggestionClick(skill)}
                className="hover:bg-secondary w-full rounded-md px-3 py-2 text-left text-sm transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && <p className="text-destructive mt-2 text-sm">{error}</p>}

      {/* Helper Text */}
      <p className="text-muted-foreground mt-2 text-sm">
        {skills.length}/{maxSkills} beceri • Enter ile ekle
      </p>
    </div>
  );
}

export default SkillSelector;
