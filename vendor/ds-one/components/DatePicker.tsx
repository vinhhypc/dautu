'use client';

import { useMemo, useState, type ComponentProps } from 'react';
import { ArrowDownSLine, ArrowLeftSLine, ArrowRightSLine } from '../icons/index';
import { cn } from '../utils/cn';

type DatePickerMode = 'Single' | 'Range';
type DatePickerView = 'Day' | 'Month' | 'Year';

/**
 * Date picker calendar panel. Figma property mapping: Mode → mode, Months → months,
 * View → view, Footer → footer, Preset → preset. Values retain Figma's exact option names.
 */
type DatePickerProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  'data-figma-node'?: string;
  mode?: DatePickerMode;
  months?: '1' | '2';
  view?: DatePickerView;
  footer?: boolean;
  preset?: boolean;
  value?: Date | { from: Date; to?: Date } | null;
  onChange?: (value: Date | { from: Date; to?: Date } | null) => void;
  /** Starting month used by the interactive panel. Defaults to the selected date or current date. */
  month?: Date;
  /** Figma node id used by the static matrix story. */
  figmaVariantId?: string;
  /** vnd-invest: BCP 47 locale for weekday/month names (default: Vietnamese labels from Figma). */
  locale?: string;
  /** vnd-invest: accessible labels for the previous/next arrows. */
  previousLabel?: string;
  nextLabel?: string;
};

const WEEKDAYS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS_VI = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const YEARS_PER_PAGE = 12;

type CalendarNames = { weekdays: string[]; months: string[]; monthTitle: (date: Date) => string };

/* vnd-invest: tên thứ/tháng theo locale của trang thay cho nhãn tiếng Việt cố định. */
function calendarNames(locale?: string): CalendarNames {
  if (!locale) return { weekdays: WEEKDAYS_VI, months: MONTHS_VI, monthTitle: (date) => `${MONTHS_VI[date.getMonth()]}, ${date.getFullYear()}` };
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const month = new Intl.DateTimeFormat(locale, { month: 'short' });
  const title = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  return {
    weekdays: Array.from({ length: 7 }, (_, index) => weekday.format(new Date(2024, 0, 1 + index))),
    months: Array.from({ length: 12 }, (_, index) => month.format(new Date(2024, index, 1))),
    monthTitle: (date) => title.format(date),
  };
}
const MONTH_INSTANCE_IDS = ['2523:11626', '2523:11628', '2523:11630', '2523:11633', '2523:11635', '2523:11637', '2523:11640', '2523:11642', '2523:11644', '2523:11647', '2523:11649', '2523:11651'];
const YEAR_INSTANCE_IDS = ['2523:11909', '2523:11911', '2523:11913', '2523:11916', '2523:11918', '2523:11920', '2523:11923', '2523:11925', '2523:11927', '2523:11930', '2523:11932', '2523:11934'];

function monthStart(date: Date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function calendarDates(date: Date) {
  const first = monthStart(date);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

function sameDay(a: Date | null | undefined, b: Date) {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function CalendarHeader({ date, onMove, onView, title, monthIndex, variantId, view, previousLabel = 'Tháng trước', nextLabel = 'Tháng sau' }: {
  date: Date; onMove: (months: number) => void; onView: () => void; title?: string; monthIndex: number; variantId?: string; view: DatePickerView; previousLabel?: string; nextLabel?: string;
}) {
  const titleWidth = view === 'Day' ? 172 : view === 'Month' ? 70 : 119;
  const titleTextWidth = view === 'Day' ? 136 : view === 'Month' ? 34 : 83;
  const headerId = variantId === '2523:10535' ? '2523:10787' : variantId === '2523:10957' ? '2523:11211'
    : variantId === '2529:11361' ? monthIndex === 0 ? '2529:11614' : '2529:11774'
      : variantId === '2529:11944' ? monthIndex === 0 ? '2529:12199' : '2529:12359'
        : variantId === '2523:11381' ? '2523:11613' : variantId === '2523:11664' ? '2523:11896' : undefined;
  return (
    <div data-figma-node={headerId} className="relative flex h-32 w-full shrink-0 items-center">
      <button data-figma-node={headerId ? `I${headerId};2521:10585` : undefined} type="button" aria-label={previousLabel} onClick={() => onMove(-1)} style={{ position: 'absolute', left: 0, top: 2, width: 28, height: 28 }} className="flex cursor-pointer items-center justify-center rounded-6 text-text-secondary hover:bg-background-surface active:bg-background-surface">
        <span data-figma-node={headerId ? `I${headerId};2521:10586` : undefined} className="flex size-20 items-center justify-center"><ArrowLeftSLine data-figma-node={headerId ? `I${headerId};2521:10586;356:4830` : undefined} className="block size-full" /></span>
      </button>
      <button data-figma-node={headerId ? `I${headerId};2521:10588` : undefined} type="button" onClick={onView} style={{ position: 'absolute', left: (252 - titleWidth) / 2, top: 3, width: titleWidth, height: 26 }} className="flex items-center rounded-6 px-8 text-webtrading-body-3-highlight text-text-primary hover:bg-background-surface">
        <span data-figma-node={headerId ? `I${headerId};2521:10589` : undefined} style={{ width: titleTextWidth, height: 18 }} className="block truncate text-left">{title ?? `${MONTHS_VI[date.getMonth()]}, ${date.getFullYear()}`}</span>
        <span data-figma-node={headerId ? `I${headerId};2521:10590` : undefined} style={{ marginLeft: 4 }} className="flex size-16 items-center justify-center"><ArrowDownSLine data-figma-node={headerId ? `I${headerId};2521:10590;356:4762` : undefined} className="block size-full text-text-secondary" /></span>
      </button>
      <button data-figma-node={headerId ? `I${headerId};2521:10592` : undefined} type="button" aria-label={nextLabel} onClick={() => onMove(1)} style={{ position: 'absolute', right: 0, top: 2, width: 28, height: 28 }} className="flex cursor-pointer items-center justify-center rounded-6 text-text-secondary hover:bg-background-surface active:bg-background-surface">
        <span data-figma-node={headerId ? `I${headerId};2521:10593` : undefined} className="flex size-20 items-center justify-center"><ArrowRightSLine data-figma-node={headerId ? `I${headerId};2521:10593;356:4888` : undefined} className="block size-full" /></span>
      </button>
    </div>
  );
}

function DateGrid({ date, selected, rangeStart, rangeEnd, onSelect, mode, variantId, monthIndex, weekdays = WEEKDAYS_VI }: {
  date: Date; selected: Date | null; rangeStart: Date | null; rangeEnd: Date | null;
  onSelect: (date: Date) => void; mode: DatePickerMode; variantId?: string; monthIndex: number; weekdays?: string[];
}) {
  const dates = useMemo(() => calendarDates(date), [date]);
  const weekdayId = variantId === '2523:10535' ? '2523:10798' : variantId === '2523:10957' ? '2523:11222'
    : variantId === '2529:11361' ? monthIndex === 0 ? '2529:11625' : '2529:11785'
      : variantId === '2529:11944' ? monthIndex === 0 ? '2529:12210' : '2529:12370' : undefined;
  const daysId = variantId === '2523:10535' ? '2523:10813' : variantId === '2523:10957' ? '2523:11237'
    : variantId === '2529:11361' ? monthIndex === 0 ? '2529:11640' : '2529:11800'
      : variantId === '2529:11944' ? monthIndex === 0 ? '2529:12225' : '2529:12385' : undefined;
  const firstWeekId = variantId === '2523:10535' ? 10814 : variantId === '2523:10957' ? 11238
    : variantId === '2529:11361' ? monthIndex === 0 ? 11641 : 11801
      : variantId === '2529:11944' ? monthIndex === 0 ? 12226 : 12386 : undefined;
  return (
    <div className="flex flex-col gap-8" style={{ width: 252 }}>
      <div data-figma-node={weekdayId} className="flex shrink-0" style={{ width: 252, height: 28 }}>
        {weekdays.map((day, index) => <div data-figma-node={weekdayId ? `I${weekdayId};2521:${10570 + index * 2}` : undefined} key={index} className="flex shrink-0 items-center justify-center" style={{ width: 36, height: 28 }}><span data-figma-node={weekdayId ? `I${weekdayId};2521:${10571 + index * 2}` : undefined} style={{ display: 'block', width: index === 6 ? 17 : 15, height: 14 }} className="text-webtrading-caption-medium text-text-tertiary">{day}</span></div>)}
      </div>
      <div data-figma-node={daysId} className="flex flex-col" style={{ width: 252, height: 216 }}>
        {Array.from({ length: 6 }, (_, rowIndex) => <div key={rowIndex} data-figma-node={firstWeekId === undefined ? undefined : `${variantId?.startsWith('2529:') ? '2529' : '2523'}:${firstWeekId + 22 * rowIndex}`} className="grid shrink-0" style={{ width: 252, height: 36, gridTemplateColumns: 'repeat(7, 36px)' }}>
        {dates.map((cellDate, index) => {
          if (Math.floor(index / 7) !== rowIndex) return null;
          const isCurrentMonth = cellDate.getMonth() === date.getMonth();
          const selectedHere = sameDay(selected, cellDate);
          const starts = sameDay(rangeStart, cellDate);
          const ends = sameDay(rangeEnd, cellDate);
          const inside = !!rangeStart && !!rangeEnd && cellDate > rangeStart && cellDate < rangeEnd;
          const today = variantId ? cellDate.getFullYear() === 2026 && cellDate.getMonth() === 9 && cellDate.getDate() === 19 : sameDay(new Date(), cellDate);
          const disabled = variantId === '2523:10957' && cellDate.getFullYear() === 2026 && cellDate.getMonth() === 9 && cellDate.getDate() >= 20;
          const stateId = !isCurrentMonth ? 8 : selectedHere ? 2 : today ? 3 : starts ? 4 : inside ? 5 : ends ? 6 : disabled ? 7 : 0;
          const textClass = stateId === 2 || stateId === 4 || stateId === 6 ? 'text-webtrading-body-3-highlight text-text-inverse' : stateId === 3 ? 'text-webtrading-body-3-highlight text-brand-primary' : stateId === 7 ? 'text-webtrading-body-3-normal text-text-disabled' : stateId === 8 ? 'text-webtrading-body-3-normal text-text-tertiary' : 'text-webtrading-body-3-normal text-text-primary';
          const rangeClass = stateId === 4 ? 'rounded-l-6 bg-brand-secondary' : stateId === 6 ? 'rounded-r-6 bg-brand-secondary' : stateId === 5 ? 'bg-brand-secondary' : '';
          const contentClass = stateId === 2 || stateId === 4 || stateId === 6 ? 'bg-brand-primary text-text-inverse' : stateId === 3 ? 'border border-brand-primary text-brand-primary' : stateId === 7 ? 'text-text-disabled' : stateId === 8 ? 'text-text-tertiary' : '';
          const matrixCellId = variantId === '2523:10535' ? `2523:${10815 + index * 3 + Math.floor(index / 7)}`
            : variantId === '2523:10957' ? `2523:${11239 + index * 3 + Math.floor(index / 7)}`
              : variantId === '2529:11361' ? `2529:${(monthIndex === 0 ? 11642 : 11802) + index * 3 + Math.floor(index / 7)}`
                : variantId === '2529:11944' ? `2529:${(monthIndex === 0 ? 12227 : 12387) + index * 3 + Math.floor(index / 7)}`
                  : undefined;
          const computedMatrixCellId = matrixCellId;
          const childStateId = stateId === 2 ? '2521:10539' : stateId === 3 ? '2521:10542' : stateId === 4 ? '2521:10545' : stateId === 5 ? '2521:10548' : stateId === 6 ? '2521:10551' : stateId === 7 ? '2521:10554' : stateId === 8 ? '2521:10557' : '2521:10533';
          const childTextId = stateId === 2 ? '2521:10540' : stateId === 3 ? '2521:10543' : stateId === 4 ? '2521:10546' : stateId === 5 ? '2521:10549' : stateId === 6 ? '2521:10552' : stateId === 7 ? '2521:10555' : stateId === 8 ? '2521:10558' : '2521:10534';
          return (
            <button
              key={cellDate.toISOString()}
              type="button"
              data-figma-node={computedMatrixCellId}
              disabled={disabled}
              aria-pressed={mode === 'Single' ? selectedHere : starts || ends}
              onClick={() => onSelect(cellDate)}
              style={{ width: 36, height: 36, padding: 2 }}
              className={cn('flex cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-brand-primary disabled:cursor-default', rangeClass)}
            >
              <span data-figma-node={computedMatrixCellId ? `I${computedMatrixCellId};${childStateId}` : undefined} style={{ width: 32, height: 32 }} className={cn('flex items-center justify-center rounded-6', contentClass, !selectedHere && !starts && !ends && !inside && !disabled && 'hover:bg-background-surface')}>
                <span data-figma-node={computedMatrixCellId ? `I${computedMatrixCellId};${childTextId}` : undefined} style={{ width: cellDate.getDate() >= 10 ? 17 : 9, height: 18 }} className={cn('block text-center leading-18', textClass)}>{cellDate.getDate()}</span>
              </span>
            </button>
          );
        })}
        </div>)}
      </div>
    </div>
  );
}

function DatePicker({ mode = 'Single', months = '1', view = 'Day', footer = false, preset = false, value, onChange, month, figmaVariantId, locale, previousLabel, nextLabel, className, style, 'data-figma-node': matrixRootId, ...props }: DatePickerProps) {
  const names = useMemo(() => calendarNames(locale), [locale]);
  const baseDate = month ?? (value instanceof Date ? value : new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(baseDate));
  const [selected, setSelected] = useState<Date | null>(value instanceof Date ? value : null);
  const [rangeStart, setRangeStart] = useState<Date | null>(value && !(value instanceof Date) ? value.from : null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(value && !(value instanceof Date) ? value.to ?? null : null);
  const [activeView, setActiveView] = useState<DatePickerView>(view);
  /* vnd-invest: đồng bộ prop view trong lúc render thay cho setState trong useEffect (react-hooks/set-state-in-effect). */
  const [syncedView, setSyncedView] = useState(view);
  if (view !== syncedView) {
    setSyncedView(view);
    setActiveView(view);
  }

  const selectDate = (next: Date) => {
    if (mode === 'Single') {
      setSelected(next);
      onChange?.(next);
    } else if (!rangeStart || rangeEnd) {
      setRangeStart(next); setRangeEnd(null); onChange?.({ from: next });
    } else {
      const from = next < rangeStart ? next : rangeStart;
      const to = next < rangeStart ? rangeStart : next;
      setRangeStart(from); setRangeEnd(to); onChange?.({ from, to });
    }
  };

  const id = figmaVariantId;
  /* vnd-invest: cửa sổ 12 năm theo năm đang xem (Figma cố định 2020 – 2031). */
  const yearStart = id ? 2020 : Math.floor(visibleMonth.getFullYear() / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  const moveStep = activeView === 'Day' ? 1 : activeView === 'Month' ? 12 : 12 * YEARS_PER_PAGE;
  const panelId = id === '2523:10535' ? '2523:10536' : id === '2523:10957' ? '2523:10958' : id === '2529:11361' ? '2529:11362' : id === '2529:11944' ? '2529:11945' : id === '2523:11381' ? '2523:11382' : id === '2523:11664' ? '2523:11665' : undefined;
  const bodyWidth = activeView === 'Day' && months === '2' ? 552 : 276;
  const bodyHeight = activeView === 'Day' ? 316 : 226;
  const calendarsId = id === '2529:11361' ? '2529:11612' : id === '2529:11944' ? '2529:12197' : undefined;
  const calendarIds = id === '2523:10535' ? ['2523:10786'] : id === '2523:10957' ? ['2523:11210']
    : id === '2529:11361' ? ['2529:11613', '2529:11773'] : id === '2529:11944' ? ['2529:12198', '2529:12358']
      : id === '2523:11381' ? ['2523:11612'] : id === '2523:11664' ? ['2523:11895'] : [];

  return (
    <div data-figma-node={matrixRootId} data-mode={mode} data-months={months} data-view={activeView} className={cn('relative rounded-8 bg-background-canvas', className)} style={{ width: bodyWidth, height: bodyHeight + (footer ? 53 : 0), ...style }} {...props}>
      <div data-figma-node={panelId} className="flex w-full flex-col" style={{ height: bodyHeight }}>
      <div data-figma-node={calendarsId} className="flex h-full w-full gap-0">
        {Array.from({ length: activeView === 'Day' ? Number(months) : 1 }, (_, index) => {
          const date = monthStart(visibleMonth, index);
          return (
            <section key={`${date.getFullYear()}-${date.getMonth()}`} data-figma-node={calendarIds[index]} className="flex shrink-0 flex-col gap-8 p-12" style={{ width: 276, height: bodyHeight }}>
              <CalendarHeader date={date} title={activeView === 'Month' ? String(date.getFullYear()) : activeView === 'Year' ? `${yearStart} – ${yearStart + YEARS_PER_PAGE - 1}` : names.monthTitle(date)} previousLabel={previousLabel} nextLabel={nextLabel} onMove={(amount) => setVisibleMonth((current) => monthStart(current, amount * moveStep))} onView={() => setActiveView(activeView === 'Day' ? 'Month' : activeView === 'Month' ? 'Year' : 'Day')} monthIndex={index} variantId={id} view={activeView} />
              {activeView === 'Day' ? <DateGrid date={date} selected={selected} rangeStart={rangeStart} rangeEnd={rangeEnd} onSelect={selectDate} mode={mode} variantId={id} monthIndex={index} weekdays={names.weekdays} /> : (
                <div data-figma-node={id === '2523:11381' ? '2523:11624' : id === '2523:11664' ? '2523:11907' : undefined} className="flex flex-col gap-6" style={{ width: 252, height: 162 }}>
                  {Array.from({ length: 4 }, (_, rowIndex) => <div key={rowIndex} data-figma-node={id === '2523:11381' ? `2523:${11625 + rowIndex * 7}` : id === '2523:11664' ? `2523:${11908 + rowIndex * 7}` : undefined} className="grid shrink-0" style={{ width: 252, height: 36, gridTemplateColumns: 'repeat(3, 80px)', gap: 6 }}>
                  {(activeView === 'Month' ? names.months : Array.from({ length: YEARS_PER_PAGE }, (_, i) => String(yearStart + i))).slice(rowIndex * 3, rowIndex * 3 + 3).map((label, columnIndex) => {
                    const cellIndex = rowIndex * 3 + columnIndex;
                    const chosen = activeView === 'Month' ? cellIndex === date.getMonth() : Number(label) === date.getFullYear();
                    const nodeId = activeView === 'Month' ? MONTH_INSTANCE_IDS[cellIndex] : YEAR_INSTANCE_IDS[cellIndex];
                    const textNodeId = activeView === 'Month' ? `I${nodeId};2521:${chosen ? '10565' : '10561'}` : `I${nodeId};2521:${chosen ? '10565' : cellIndex >= 7 ? '10567' : '10561'}`;
                    const textWidth = activeView === 'Month' ? [51, 51, 51, 51, 51, 51, 51, 51, 51, 61, 59, 59][cellIndex] : 34;
                    return <button key={label} type="button" data-figma-node={nodeId} onClick={() => { if (activeView === 'Month') { setVisibleMonth(new Date(date.getFullYear(), cellIndex, 1)); setActiveView('Day'); } else { setVisibleMonth(new Date(Number(label), date.getMonth(), 1)); setActiveView('Month'); } }} style={{ width: 80, height: 36 }} className={cn('flex items-center justify-center rounded-6 text-webtrading-body-3-normal text-text-primary hover:bg-background-surface', id && activeView === 'Year' && cellIndex >= 7 && 'text-text-disabled', chosen && 'bg-brand-primary text-webtrading-body-3-highlight text-text-inverse')}><span data-figma-node={textNodeId} style={{ display: 'block', width: textWidth, height: 18 }}>{label}</span></button>;
                  })}
                  </div>)}
                </div>
              )}
            </section>
          );
        })}
      </div>
      {preset && <aside data-figma-node="2523:10537" className="absolute left-0 top-0 flex w-153 flex-col gap-4 p-4" style={{ height: months === '2' ? 316 : 224 }}>{['Hôm nay', '7 ngày qua', '1 tháng', '3 tháng', '6 tháng', '12 tháng'].map((label) => <button key={label} type="button" onClick={() => { const next = new Date(); setVisibleMonth(monthStart(next)); selectDate(next); }} className="h-36 rounded-6 px-8 text-left text-webtrading-body-3-medium text-text-primary hover:bg-background-surface">{label}</button>)}</aside>}
      {footer && <div data-figma-node="2523:10946" className="absolute left-0 flex w-full items-center justify-end gap-8 px-12" style={{ top: 316, height: 53 }}><button type="button" className="rounded-6 px-12 py-6 text-webtrading-body-3-highlight text-text-secondary">Huỷ</button><button type="button" className="rounded-6 bg-brand-primary px-12 py-6 text-webtrading-body-3-highlight text-text-inverse">Áp dụng</button></div>}
      </div>
    </div>
  );
}

export { DatePicker };
export type { DatePickerMode, DatePickerProps, DatePickerView };
