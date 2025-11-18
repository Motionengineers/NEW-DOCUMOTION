'use client';

import { Heart, PartyPopper, HandHeart, Lightbulb, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

const REACTION_CONFIG = {
  like: { icon: Heart, label: 'Like', color: 'rose' },
  celebrate: { icon: PartyPopper, label: 'Celebrate', color: 'yellow' },
  support: { icon: HandHeart, label: 'Support', color: 'green' },
  insightful: { icon: Lightbulb, label: 'Insightful', color: 'blue' },
  question: { icon: HelpCircle, label: 'Question', color: 'purple' },
};

export default function ReactionButton({ type, count = 0, active = false, onClick }) {
  const config = REACTION_CONFIG[type];
  if (!config) return null;

  const Icon = config.icon;
  const colorClass = config.color;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
        active
          ? `border-${colorClass}-400/50 bg-${colorClass}-500/20 text-${colorClass}-100`
          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
      )}
      title={config.label}
    >
      <Icon className={clsx('h-4 w-4', active && 'fill-current')} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

