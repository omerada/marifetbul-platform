'use client';

import { useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Password Strength Calculator
 * Scores: 0 = Very Weak, 1 = Weak, 2 = Fair, 3 = Strong, 4 = Very Strong
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[@$!%*?&#^()_+\-=[\]{};:'",.<>/\\|`~]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;

  let score = 0;
  let label = 'Çok Zayıf';
  let color = 'text-red-600';
  let bgColor = 'bg-red-500';

  if (password.length === 0) {
    score = 0;
    label = 'Çok Zayıf';
    color = 'text-gray-400';
    bgColor = 'bg-gray-300';
  } else if (metRequirements <= 2) {
    score = 1;
    label = 'Zayıf';
    color = 'text-red-600';
    bgColor = 'bg-red-500';
  } else if (metRequirements === 3) {
    score = 2;
    label = 'Orta';
    color = 'text-orange-600';
    bgColor = 'bg-orange-500';
  } else if (metRequirements === 4) {
    score = 3;
    label = 'Güçlü';
    color = 'text-yellow-600';
    bgColor = 'bg-yellow-500';
  } else if (metRequirements === 5) {
    score = 4;
    label = 'Çok Güçlü';
    color = 'text-green-600';
    bgColor = 'bg-green-500';
  }

  return { score, label, color, bgColor, requirements };
}

/**
 * Password Strength Indicator Component
 * Shows visual strength meter and optional requirements checklist
 */
export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  if (!password && !showRequirements) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      {password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Şifre Gücü:
            </span>
            <span className={`text-sm font-semibold ${strength.color}`}>
              {strength.label}
            </span>
          </div>

          {/* Strength Bar */}
          <div className="flex gap-1">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  index < strength.score ? strength.bgColor : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Şifre gereksinimleri:
          </p>
          <ul className="space-y-1.5">
            <RequirementItem
              met={strength.requirements.minLength}
              text="En az 8 karakter uzunluğunda"
            />
            <RequirementItem
              met={strength.requirements.hasUppercase}
              text="En az bir büyük harf içermeli (A-Z)"
            />
            <RequirementItem
              met={strength.requirements.hasLowercase}
              text="En az bir küçük harf içermeli (a-z)"
            />
            <RequirementItem
              met={strength.requirements.hasNumber}
              text="En az bir rakam içermeli (0-9)"
            />
            <RequirementItem
              met={strength.requirements.hasSpecialChar}
              text="En az bir özel karakter içermeli (@$!%*?&)"
            />
          </ul>
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-600'}>{text}</span>
    </li>
  );
}
