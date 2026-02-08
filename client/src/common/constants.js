import { BarChart3, Plus, Users, Settings, Bell, FileText, Activity, Briefcase, TrendingUp } from 'lucide-react'

export const ICONS = {
  dashboard: BarChart3,
  funds: Briefcase,
  create: Plus,
  investments: TrendingUp,
  workflows: Activity,
  beneficiaries: Users,
  reports: FileText,
  settings: Settings,
  notifications: Bell,
}

export const COLORS = {
  primary: 'blue',
  success: 'green',
  warning: 'orange',
  danger: 'red',
  info: 'blue',
}

export const RISK_LEVELS = {
  LOW: { bg: 'bg-green-100', text: 'text-green-700' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  HIGH: { bg: 'bg-red-100', text: 'text-red-700' },
}

export const STATUS_STYLES = {
  Active: { bg: 'bg-green-100', text: 'text-green-700' },
  Matured: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Running: { color: 'text-blue-600' },
  Success: { color: 'text-green-600' },
  Failed: { color: 'text-red-600' },
}
