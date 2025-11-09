'use client';

/**
 * ================================================
 * JOB POSTING WIZARD - STEP 2: SKILLS & REQUIREMENTS
 * ================================================
 * Form for required skills, experience level, and requirements
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Production Ready
 * @created November 8, 2025
 *
 * Sprint: Job Posting Wizard Implementation
 * Task: T1.4 - Step 2 Form Implementation
 */

'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { z } from 'zod';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Badge,
} from '@/components/ui';

import type { StepTwoProps } from './types';
import { EXPERIENCE_LEVEL_OPTIONS } from './types';
import type { JobPostingFormData } from '@/lib/core/validations/jobs';

// ================================================
// VALIDATION SCHEMA FOR STEP 2
// ================================================

const stepTwoSchema = z.object({
  requiredSkills: z
    .array(z.string().min(2))
    .min(1, 'En az 1 beceri eklemelisiniz')
    .max(15, 'En fazla 15 beceri ekleyebilirsiniz'),

  experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']),

  requirements: z.array(z.string().min(5)).optional(),
});

type StepTwoFormData = z.infer<typeof stepTwoSchema>;

// ================================================
// COMPONENT
// ================================================

export function StepTwo({
  data,
  onNext,
  onBack,
  onSaveDraft,
  isSubmitting,
}: StepTwoProps) {
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<StepTwoFormData>({
    resolver: zodResolver(stepTwoSchema),
    mode: 'onChange',
    defaultValues: {
      requiredSkills: data.requiredSkills || [],
      experienceLevel: data.experienceLevel || 'INTERMEDIATE',
      requirements: data.requirements || [],
    },
  });

  const requiredSkills = watch('requiredSkills') || [];
  const requirements = watch('requirements') || [];

  // ==================== SKILL HANDLERS ====================

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    if (requiredSkills.length >= 15) {
      return; // Max limit
    }

    if (requiredSkills.includes(trimmed)) {
      setSkillInput('');
      return; // Duplicate
    }

    if (trimmed.length < 2) {
      return; // Too short
    }

    setValue('requiredSkills', [...requiredSkills, trimmed], {
      shouldValidate: true,
    });
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValue(
      'requiredSkills',
      requiredSkills.filter((skill) => skill !== skillToRemove),
      { shouldValidate: true }
    );
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // ==================== REQUIREMENT HANDLERS ====================

  const handleAddRequirement = () => {
    const trimmed = requirementInput.trim();
    if (!trimmed || trimmed.length < 5) return;

    if (requirements.length >= 10) {
      return; // Max limit
    }

    setValue('requirements', [...requirements, trimmed], {
      shouldValidate: true,
    });
    setRequirementInput('');
  };

  const handleRemoveRequirement = (index: number) => {
    setValue(
      'requirements',
      requirements.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleRequirementKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  // ==================== FORM HANDLERS ====================

  const onSubmit = (formData: StepTwoFormData) => {
    onNext(formData as Partial<JobPostingFormData>);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const currentValues = watch();
      await onSaveDraft(currentValues as Partial<JobPostingFormData>);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beceriler & Gereksinimler</CardTitle>
        <p className="text-muted-foreground text-sm">
          İşin gerektirdiği becerileri ve deneyim seviyesini belirtin
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Required Skills */}
          <div className="space-y-3">
            <Label htmlFor="skills" required>
              Gerekli Beceriler
            </Label>

            <div className="flex gap-2">
              <Input
                id="skills"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Beceri adı yazın (örn: React, TypeScript)"
                maxLength={50}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSkill}
                disabled={!skillInput.trim() || requiredSkills.length >= 15}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Skill Tags */}
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:bg-muted ml-1 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs">
              {errors.requiredSkills ? (
                <p className="text-destructive">
                  {errors.requiredSkills.message}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Enter tuşuna basarak veya ekle butonuna tıklayarak beceri
                  ekleyin
                </p>
              )}
              <p className="text-muted-foreground">
                {requiredSkills.length} / 15
              </p>
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <Label htmlFor="experienceLevel" required>
              Deneyim Seviyesi
            </Label>
            <Controller
              name="experienceLevel"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger placeholder="Deneyim seviyesi seçin" />
                  <SelectContent>
                    {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.experienceLevel && (
              <p className="text-destructive text-sm">
                {errors.experienceLevel.message}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Projeniz için ideal freelancer deneyim seviyesini seçin
            </p>
          </div>

          {/* Additional Requirements (Optional) */}
          <div className="space-y-3">
            <Label htmlFor="requirements">
              Ek Gereksinimler{' '}
              <span className="text-muted-foreground">(İsteğe bağlı)</span>
            </Label>

            <div className="flex gap-2">
              <Input
                id="requirements"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={handleRequirementKeyDown}
                placeholder="Örn: Portföyünde e-ticaret projesi olmalı"
                maxLength={200}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddRequirement}
                disabled={
                  !requirementInput.trim() ||
                  requirementInput.trim().length < 5 ||
                  requirements.length >= 10
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Requirements List */}
            {requirements.length > 0 && (
              <ul className="space-y-2">
                {requirements.map((req, index) => (
                  <li
                    key={index}
                    className="bg-muted flex items-start justify-between rounded-lg p-3"
                  >
                    <span className="text-sm">{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="hover:bg-muted-foreground/10 ml-2 rounded p-1 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-muted-foreground text-xs">
              {requirements.length} / 10 gereksinim eklendi
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Geri
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSavingDraft}
              >
                {isSavingDraft ? 'Kaydediliyor...' : 'Taslak Kaydet'}
              </Button>

              <Button type="submit" disabled={isSubmitting || !isValid}>
                İleri <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default StepTwo;
