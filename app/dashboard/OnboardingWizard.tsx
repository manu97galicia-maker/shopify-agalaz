'use client';

import { useEffect, useState } from 'react';
import { Check, Palette, Sparkles, Play, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  shop: string;
  hasSubscription: boolean;
  isInTrial: boolean;
  totalRenders: number;
  onStartTrial: () => void;
  isStartingTrial: boolean;
}

const LS_KEY_THEME_DONE = 'agalaz_onboarding_theme_added';
const LS_KEY_DISMISSED = 'agalaz_onboarding_dismissed';

export function OnboardingWizard({
  shop,
  hasSubscription,
  isInTrial,
  totalRenders,
  onStartTrial,
  isStartingTrial,
}: Props) {
  const [themeAdded, setThemeAdded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [celebrating, setCelebrating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setThemeAdded(localStorage.getItem(LS_KEY_THEME_DONE) === '1');
    setDismissed(localStorage.getItem(LS_KEY_DISMISSED) === '1');
  }, []);

  const step1Done = true;
  const step2Done = themeAdded;
  const step3Done = hasSubscription || isInTrial;
  const step4Done = totalRenders > 0;

  const completedCount = [step1Done, step2Done, step3Done, step4Done].filter(Boolean).length;
  const allDone = completedCount === 4;

  useEffect(() => {
    if (allDone && !dismissed && mounted) {
      setCelebrating(true);
      const t = setTimeout(() => {
        setCelebrating(false);
        localStorage.setItem(LS_KEY_DISMISSED, '1');
        setDismissed(true);
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [allDone, dismissed, mounted]);

  if (!mounted) return null;
  if (dismissed && !celebrating) return null;

  const themeEditorUrl = shop
    ? `https://${shop}/admin/themes/current/editor?context=apps&activateAppId=7523a3b92a09addee08857ff2f4e55f7/agalaz-tryon`
    : '#';
  const storefrontUrl = shop ? `https://${shop}` : '#';

  const markThemeAdded = () => {
    localStorage.setItem(LS_KEY_THEME_DONE, '1');
    setThemeAdded(true);
  };

  const percent = (completedCount / 4) * 100;

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {celebrating && (
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center animate-fade-in">
          <div className="text-center space-y-3 px-6">
            <div className="text-5xl">🎉</div>
            <h3 className="text-white text-2xl font-black">You're all set!</h3>
            <p className="text-white/80 text-sm">Agalaz is live on your store. Customers can now try on any product.</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-black text-slate-900">
              {allDone ? 'Setup complete' : 'Get started with Agalaz'}
            </h2>
            <p className="text-xs text-slate-500">
              {completedCount} of 4 steps complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          <Step
            n={1}
            done={step1Done}
            icon={<Check size={16} />}
            title="Install the app"
            desc="Your Agalaz account is ready."
          />

          <Step
            n={2}
            done={step2Done}
            icon={<Palette size={16} />}
            title="Add the Try-On button to your theme"
            desc="Opens the theme editor with the Agalaz block ready to drop on product pages."
            cta={
              !step2Done && (
                <div className="flex gap-2 flex-wrap">
                  <a
                    href={themeEditorUrl}
                    target="_blank"
                    rel="noopener"
                    onClick={markThemeAdded}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Open theme editor <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={markThemeAdded}
                    className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    I already added it
                  </button>
                </div>
              )
            }
          />

          <Step
            n={3}
            done={step3Done}
            icon={<Sparkles size={16} />}
            title="Start your 7-day free trial"
            desc="Unlocks 50 renders. Payment method required. Cancel before day 7 for no charge."
            cta={
              !step3Done && (
                <button
                  onClick={onStartTrial}
                  disabled={isStartingTrial}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isStartingTrial ? 'Opening checkout…' : 'Start free trial'}
                </button>
              )
            }
          />

          <Step
            n={4}
            done={step4Done}
            icon={<Play size={16} />}
            title="Run your first try-on"
            desc={
              step4Done
                ? `${totalRenders} render${totalRenders === 1 ? '' : 's'} done so far.`
                : 'Open your store, go to any product, and click the try-on button.'
            }
            cta={
              !step4Done && step3Done && (
                <a
                  href={storefrontUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Open my store <ExternalLink size={12} />
                </a>
              )
            }
          />
        </div>
      )}
    </div>
  );
}

function Step({
  n,
  done,
  icon,
  title,
  desc,
  cta,
}: {
  n: number;
  done: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className={`p-5 flex items-start gap-4 ${done ? 'opacity-60' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {done ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-black">{n}</span>}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <div>
          <h3 className={`text-sm font-bold ${done ? 'text-slate-600 line-through decoration-slate-300' : 'text-slate-900'}`}>
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
        </div>
        {cta}
      </div>
    </div>
  );
}
