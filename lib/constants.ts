export const NAV_ITEMS = [
  { icon: 'LayoutDashboard', path: '/dashboard', label: 'Dashboard' },
  { icon: 'FileText', path: '/dashboard/applications', label: 'Applications' },
  { icon: 'Crown', path: '/dashboard/rank-center', label: 'Rank Center' },
  { icon: 'Key', path: '/dashboard/api-keys', label: 'API Keys' },
  { icon: 'Settings', path: '/dashboard/settings', label: 'Settings' },
] as const;

export const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'true_false', label: 'True / False' },
] as const;

export const API_KEY_SCOPES = [
  { value: 'applications:read', label: 'Read Applications' },
  { value: 'applications:write', label: 'Write Applications' },
  { value: 'submissions:read', label: 'Read Submissions' },
  { value: 'rank-center:read', label: 'Read Rank Center' },
  { value: 'rank-center:write', label: 'Write Rank Center' },
] as const;

export const COLORS = [
  { name: 'Red', value: '#ff4b6e' },
  { name: 'Blue', value: '#4b83ff' },
  { name: 'Green', value: '#4bff83' },
  { name: 'Purple', value: '#9b4bff' },
  { name: 'Orange', value: '#ff9b4b' },
  { name: 'Teal', value: '#4bffd5' },
  { name: 'Pink', value: '#ff4bd5' },
  { name: 'Yellow', value: '#ffd54b' },
] as const;

export const MAX_SHORT_ANSWER_QUESTIONS = 3;
