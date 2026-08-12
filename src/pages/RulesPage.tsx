import { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { RULES, getRuleFullText } from '../data/rulesData';
import { statusLabel, daysUntilUnlock } from '../utils/rules';
import type { RuleStatus } from '../types';
import MarkdownContent from '../components/MarkdownContent';
import PageHeader from '../components/PageHeader';
import { IconClose } from '../components/Icons';

export default function RulesPage() {
  const { ruleStatuses, activateRuleByNumber, integrateRuleByNumber } = useApp();
  const [selected, setSelected] = useState<number | null>(null);

  const selectedRule = selected ? RULES.find((r) => r.number === selected) : null;
  const selectedStatus = selected ? ruleStatuses[selected] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="17 правил"
        subtitle="Одно правило за две недели. Регулярность важнее объёма."
      />

      <div className="space-y-2">
        {RULES.map((rule) => {
          const status = ruleStatuses[rule.number]?.status ?? 'locked';
          const daysLeft = daysUntilUnlock(ruleStatuses, rule.number);

          return (
            <button
              key={rule.number}
              onClick={() => setSelected(rule.number)}
              className="card w-full text-left !p-4 hover:shadow-float active:scale-[0.99] transition-all duration-150"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 ${
                  status === 'integrated' ? 'bg-olive-soft text-olive'
                    : status === 'active' ? 'bg-terracotta-soft text-terracotta'
                    : 'bg-cream dark:bg-cream-dark text-faint'
                }`}>
                  {rule.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-[15px] leading-snug">{rule.title}</p>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-[13px] text-muted mt-1 line-clamp-2">
                    {rule.shortDescription}
                  </p>
                  {status === 'locked' && daysLeft !== null && (
                    <p className="text-[12px] text-faint mt-2">
                      Откроется через {daysLeft} дн.
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedRule && selectedStatus && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-graphite/20 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full md:max-w-2xl max-h-[92vh] overflow-y-auto bg-surface dark:bg-surface-dark rounded-t-4xl md:rounded-4xl shadow-float dark:shadow-float-dark animate-slide-up">
            <div className="sticky top-0 bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-xl z-10 px-5 pt-3 pb-4 border-b border-paper/50 dark:border-paper-dark/50 flex items-start justify-between gap-3">
              <div className="w-10 h-1 bg-paper rounded-full mx-auto mb-0 absolute top-3 left-0 right-0 md:hidden" />
              <div className="pt-4 md:pt-0 flex-1">
                <StatusBadge status={selectedStatus.status} />
                <h2 className="text-[20px] font-semibold tracking-tight mt-2">
                  {selectedRule.title}
                </h2>
                <p className="text-[13px] text-muted">{selectedRule.tradition}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream dark:bg-cream-dark shrink-0 mt-4 md:mt-0 text-graphite dark:text-graphite-dark"
              >
                <IconClose />
              </button>
            </div>
            <div className="px-5 pb-5">
              <div className="flex gap-2 mb-5 mt-4">
                {selectedStatus.status === 'available' && (
                  <button
                    className="btn-primary text-sm"
                    onClick={() => {
                      activateRuleByNumber(selectedRule.number);
                      setSelected(null);
                    }}
                  >
                    Активировать
                  </button>
                )}
                {selectedStatus.status === 'active' && (
                  <button
                    className="btn-secondary text-sm"
                    onClick={() => {
                      integrateRuleByNumber(selectedRule.number);
                      setSelected(null);
                    }}
                  >
                    Отметить как внедрено
                  </button>
                )}
              </div>

              <MarkdownContent content={getRuleFullText(selectedRule.bookSectionId)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RuleStatus }) {
  const styles: Record<RuleStatus, string> = {
    locked: 'bg-cream dark:bg-cream-dark text-faint',
    available: 'bg-terracotta-soft text-terracotta',
    active: 'bg-terracotta-soft text-terracotta font-medium',
    integrated: 'bg-olive-soft text-olive',
  };

  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 font-medium ${styles[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
