import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  min?: string;
  max?: string;
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DatePicker({ value, onChange, label, min, max }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = useMemo(() => {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    return `${y}年${parseInt(m)}月${parseInt(d)}日`;
  }, [value]);

  const selectedDate = useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  const [viewMonth, setViewMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const days = useMemo(() => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startWeekday = first.getDay();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  const handleSelect = (d: Date) => {
    onChange(formatYMD(d));
    setIsOpen(false);
  };

  const isMinDisabled = (d: Date) => (min ? formatYMD(d) < min : false);
  const isMaxDisabled = (d: Date) => (max ? formatYMD(d) > max : false);

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthName = `${viewMonth.getFullYear()}年${viewMonth.getMonth() + 1}月`;

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-left text-gray-900 dark:text-white hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
      >
        {displayValue || <span className="text-gray-400">请选择日期</span>}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
          <div className="absolute z-[100] mt-2 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl w-[320px]">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-gray-900 dark:text-white">{monthName}</span>
              <button
                type="button"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map((w) => (
                <div
                  key={w}
                  className="h-8 flex items-center justify-center text-xs font-medium text-gray-400"
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((d, i) => {
                if (!d) return <div key={i} />;
                const dStr = formatYMD(d);
                const isSelected = dStr === value;
                const isDisabled = isMinDisabled(d) || isMaxDisabled(d);
                const isToday = dStr === formatYMD(new Date());
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelect(d)}
                    className={`
                      h-10 rounded-lg text-sm font-medium transition-all relative
                      ${isSelected
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                        : isDisabled
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-cyan-300 ring-inset' : ''}
                    `}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-sm rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                清空
              </button>
              <button
                type="button"
                onClick={() => handleSelect(new Date())}
                className="flex-1 py-2 text-sm rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
              >
                今天
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
