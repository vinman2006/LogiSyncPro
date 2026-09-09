'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Bell,
  CheckCircle2,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLogistics } from '@/lib/context/LogisticsContext';

interface Phase2PlaceholderProps {
  title: string;
  moduleName: string;
  description: string;
  icon: LucideIcon;
  plannedFeatures: string[];
}

export function Phase2Placeholder({
  title,
  moduleName,
  description,
  icon: Icon,
  plannedFeatures,
}: Phase2PlaceholderProps) {
  const { showToast, user } = useLogistics();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [voteCount, setVoteCount] = useState(38);
  const [hasVoted, setHasVoted] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    if (!isSubscribed) {
      showToast(
        `Subscribed to ${moduleName} Updates`,
        `Notifications will be sent to ${user.email} upon Phase 2 rollout.`,
        'success'
      );
    } else {
      showToast('Unsubscribed', `Removed alerts for ${moduleName}.`, 'info');
    }
  };

  const handleVotePriority = () => {
    if (!hasVoted) {
      setVoteCount((prev) => prev + 1);
      setHasVoted(true);
      showToast(
        'Priority Vote Registered',
        `Thank you! Your vote helps prioritize ${moduleName} for the next release sprint.`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        breadcrumbs={[{ label: moduleName }]}
        showDemoBadge={true}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubscribe}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors shadow-xs ${
                isSubscribed
                  ? 'bg-success-50 text-success-600 border-success-600/30'
                  : 'bg-white text-neutral-700 border-border hover:bg-neutral-50'
              }`}
            >
              {isSubscribed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />
                  <span>Subscribed for Launch</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Notify When Live</span>
                </>
              )}
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-border rounded-lg hover:bg-neutral-50 shadow-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        }
      />

      <div className="bg-white rounded-xl border border-border p-8 shadow-sm max-w-3xl mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-500/20 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Icon className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 mb-3">
          <Clock className="w-3.5 h-3.5 text-neutral-500" />
          <span>Scheduled for Phase 2 Implementation</span>
        </div>

        <h2 className="text-xl font-heading font-bold text-neutral-900 mb-2">
          {title}
        </h2>

        <p className="text-sm text-neutral-600 max-w-xl mx-auto mb-6 leading-relaxed">
          {description}
        </p>

        {/* Voting & Notification Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={handleVotePriority}
            disabled={hasVoted}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border shadow-xs transition-colors ${
              hasVoted
                ? 'bg-neutral-100 text-neutral-500 border-neutral-300'
                : 'bg-white hover:bg-brand-50 text-neutral-800 hover:text-brand-600 border-border hover:border-brand-500/30'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'text-brand-600' : 'text-neutral-500'}`} />
            <span>{hasVoted ? `Voted (${voteCount})` : `Vote as Next Priority (${voteCount})`}</span>
          </button>

          <button
            type="button"
            onClick={handleSubscribe}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-xs transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{isSubscribed ? 'Alert Preferences Active' : 'Get Launch Notification'}</span>
          </button>
        </div>

        {/* Planned Capabilities Box */}
        <div className="bg-primary-subtle rounded-xl p-5 border border-border text-left">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Planned Capabilities for Indian MSMEs</span>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-600">
            {plannedFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
