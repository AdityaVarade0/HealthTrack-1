/**
 * Clinical reference calculations and formatting utilities for HealthTrack
 */

export interface BPEvaluation {
  stage: 'Normal' | 'Elevated' | 'Hypertension Stage 1' | 'Hypertension Stage 2' | 'Hypertensive Crisis';
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export function parseBloodPressure(bpStr?: string): { systolic: number; diastolic: number } | null {
  if (!bpStr) return null;
  const parts = bpStr.split(/[\/\-\s]+/).map((p) => parseInt(p.trim(), 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { systolic: parts[0], diastolic: parts[1] };
  }
  return null;
}

export function evaluateBloodPressure(systolic?: number, diastolic?: number): BPEvaluation | null {
  if (!systolic || !diastolic) return null;

  if (systolic > 180 || diastolic > 120) {
    return {
      stage: 'Hypertensive Crisis',
      color: '#dc2626',
      badgeBg: '#fee2e2',
      badgeText: '#991b1b',
      description: 'Consult healthcare provider urgently if symptomatic.',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      stage: 'Hypertension Stage 2',
      color: '#e11d48',
      badgeBg: '#ffe4e6',
      badgeText: '#9f1239',
      description: 'Above target range. Review with clinician.',
    };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      stage: 'Hypertension Stage 1',
      color: '#d97706',
      badgeBg: '#fef3c7',
      badgeText: '#92400e',
      description: 'Mildly elevated blood pressure reading.',
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      stage: 'Elevated',
      color: '#ca8a04',
      badgeBg: '#fef9c3',
      badgeText: '#854d0e',
      description: 'Slightly above normal baseline.',
    };
  }
  if (systolic < 120 && diastolic < 80) {
    return {
      stage: 'Normal',
      color: '#16a34a',
      badgeBg: '#dcfce7',
      badgeText: '#166534',
      description: 'Within ideal healthy range.',
    };
  }

  return null;
}

export interface SugarEvaluation {
  status: 'Low' | 'Normal' | 'Elevated' | 'High';
  badgeBg: string;
  badgeText: string;
  notes: string;
}

export function evaluateBloodSugar(value?: string | number, context: 'fasting' | 'post_meal' | 'random' = 'fasting'): SugarEvaluation | null {
  if (value === undefined || value === null || value === '') return null;
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return null;

  if (num < 70) {
    return {
      status: 'Low',
      badgeBg: '#fee2e2',
      badgeText: '#b91c1c',
      notes: 'Possible hypoglycemia. Take fast-acting carbs if symptomatic.',
    };
  }

  if (context === 'fasting') {
    if (num <= 99) {
      return { status: 'Normal', badgeBg: '#dcfce7', badgeText: '#166534', notes: 'Normal fasting blood glucose.' };
    }
    if (num <= 125) {
      return { status: 'Elevated', badgeBg: '#fef3c7', badgeText: '#92400e', notes: 'Impaired fasting glucose range.' };
    }
    return { status: 'High', badgeBg: '#fee2e2', badgeText: '#b91c1c', notes: 'Elevated fasting reading. Discuss with doctor.' };
  } else {
    // post-meal or random
    if (num < 140) {
      return { status: 'Normal', badgeBg: '#dcfce7', badgeText: '#166534', notes: 'Expected post-meal reading.' };
    }
    if (num < 200) {
      return { status: 'Elevated', badgeBg: '#fef3c7', badgeText: '#92400e', notes: 'Mildly elevated post-prandial level.' };
    }
    return { status: 'High', badgeBg: '#fee2e2', badgeText: '#b91c1c', notes: 'High post-meal glucose level.' };
  }
}

export function calculateBMI(weightKg?: number, heightCm?: number): { bmi: number; category: string } | null {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal weight';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obesity range';

  return { bmi, category };
}

export function formatTime12h(timeStr?: string): string {
  if (!timeStr) return 'Time not set';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h)) return timeStr;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  const minute = isNaN(m) ? '00' : String(m).padStart(2, '0');
  return `${hour12}:${minute} ${suffix}`;
}

export function formatDateLabel(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

export function formatRelativeTime(isoStr: string): string {
  try {
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return isoStr;
  }
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTimeSlot(timeStr: string): 'morning' | 'afternoon' | 'evening' | 'bedtime' {
  if (!timeStr) return 'morning';
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'bedtime';
}

export function exportHealthRecordsCSV(records: Array<{ date: string; bp?: string; sugar?: any; weight?: any; notes?: string }>): string {
  const headers = ['Date & Time', 'Blood Pressure (mmHg)', 'Blood Sugar (mg/dL)', 'Weight (kg)', 'Notes'];
  const rows = records.map((r) => [
    `"${formatDateLabel(r.date)}"`,
    `"${r.bp || ''}"`,
    `"${r.sugar || ''}"`,
    `"${r.weight || ''}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
