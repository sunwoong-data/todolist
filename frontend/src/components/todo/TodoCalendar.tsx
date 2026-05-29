import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Todo } from '../../types/todo'
import { calcTodoStatus, STATUS_COLOR } from '../../utils/todoStatus'
import { useGetHolidays } from '../../hooks/useHolidays'
import { useGetAnniversaries } from '../../hooks/useAnniversaries'

interface TodoCalendarProps {
  todos: Todo[]
  selectedDate?: string | null
  onSelectDate?: (date: string) => void
  year?: number
  month?: number
  onPrevMonth?: () => void
  onNextMonth?: () => void
}

interface BarInfo {
  todo: Todo
  isStart: boolean
  isEnd: boolean
  isWeekStart: boolean
  isWeekEnd: boolean
}

const DAY_KEYS = [
  'calendar.sun', 'calendar.mon', 'calendar.tue', 'calendar.wed',
  'calendar.thu', 'calendar.fri', 'calendar.sat',
]

const pad = (n: number) => String(n).padStart(2, '0')

function TodoCalendar({ todos, selectedDate, onSelectDate, year: yearProp, month: monthProp, onPrevMonth, onNextMonth }: TodoCalendarProps) {
  const { t } = useTranslation()
  const today = new Date()
  const [yearState, setYearState] = useState(today.getFullYear())
  const [monthState, setMonthState] = useState(today.getMonth())

  const year = yearProp ?? yearState
  const month = monthProp ?? monthState

  function prevMonth() {
    if (onPrevMonth) { onPrevMonth(); return }
    if (monthState === 0) { setMonthState(11); setYearState(y => y - 1) }
    else setMonthState(m => m - 1)
  }
  function nextMonth() {
    if (onNextMonth) { onNextMonth(); return }
    if (monthState === 11) { setMonthState(0); setYearState(y => y + 1) }
    else setMonthState(m => m + 1)
  }

  const { data: holidays = [] } = useGetHolidays(year, month + 1)
  const { data: rawAnniversaries = [] } = useGetAnniversaries()
  const anniversaries = Array.isArray(rawAnniversaries) ? rawAnniversaries : []
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthStr = pad(month + 1)
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const holidayMap: Record<string, string> = {}
  for (const h of holidays) {
    const d = h.date
    holidayMap[`${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`] = h.name
  }

  // ── 각 날짜에 걸친 바 정보 구축 ────────────────────────────────
  const barsByDate: Record<string, BarInfo[]> = {}
  const monthStartStr = `${year}-${monthStr}-01`
  const monthEndStr = `${year}-${monthStr}-${pad(daysInMonth)}`

  for (const todo of todos) {
    if (!todo.startDate) continue
    const start = todo.startDate
    const end = todo.endDate ?? todo.startDate
    const rangeStart = start < monthStartStr ? monthStartStr : start
    const rangeEnd = end > monthEndStr ? monthEndStr : end
    if (rangeStart > rangeEnd) continue

    const cur = new Date(`${rangeStart}T00:00:00`)
    const endD = new Date(`${rangeEnd}T00:00:00`)
    while (cur <= endD) {
      const dateStr = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`
      if (!barsByDate[dateStr]) barsByDate[dateStr] = []
      barsByDate[dateStr].push({
        todo,
        isStart: dateStr === start,
        isEnd: dateStr === end,
        isWeekStart: cur.getDay() === 0,
        isWeekEnd: cur.getDay() === 6,
      })
      cur.setDate(cur.getDate() + 1)
    }
  }

  // ── 전역 투두 정렬 순서 (시작일 빠른 순, 동일하면 기간 긴 순) ──
  // 이 순서를 기준으로 주(week) 내 슬롯을 배정하여 바 수직 위치를 고정
  const todoOrder: Record<string, number> = {}
  ;[...todos]
    .filter(t => t.startDate)
    .sort((a, b) => {
      const d = (a.startDate ?? '').localeCompare(b.startDate ?? '')
      if (d !== 0) return d
      const dur = (t: Todo) =>
        t.endDate && t.startDate ? +new Date(t.endDate) - +new Date(t.startDate) : 0
      return dur(b) - dur(a)
    })
    .forEach((t, i) => { todoOrder[t.id] = i })

  // ── 셀 배열 ────────────────────────────────────────────────────
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  // ── 주(week) 단위 슬롯 맵 계산 ─────────────────────────────────
  // 각 주에 등장하는 투두를 전역 순서대로 0, 1, 2... 슬롯에 배정.
  // 렌더링 시 빈 슬롯에 스페이서를 삽입하여 모든 셀의 바 높이를 일치시킴.
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const weekInfo = weeks.map(week => {
    const seen = new Map<string, number>() // todoId → globalOrder
    week.forEach(day => {
      if (!day) return
      ;(barsByDate[`${year}-${monthStr}-${pad(day)}`] ?? []).forEach(bar => {
        if (!seen.has(bar.todo.id)) seen.set(bar.todo.id, todoOrder[bar.todo.id] ?? 999)
      })
    })
    const sortedIds = [...seen.entries()].sort(([, a], [, b]) => a - b).map(([id]) => id)
    const slotMap: Record<string, number> = {}
    sortedIds.forEach((id, i) => { slotMap[id] = i })
    return { slotMap, maxSlot: sortedIds.length - 1 }
  })

  // ── 렌더 ───────────────────────────────────────────────────────
  return (
    <div style={{
      backgroundColor: 'var(--color-bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border-default)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      {/* 월 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid var(--color-border-default)',
      }}>
        <button data-testid="calendar-prev" onClick={prevMonth} aria-label={t('calendar.prev_month')} style={navBtnStyle}>‹</button>
        <h2 data-testid="calendar-header" style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {year}년 {month + 1}월
        </h2>
        <button data-testid="calendar-next" onClick={nextMonth} aria-label={t('calendar.next_month')} style={navBtnStyle}>›</button>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--color-border-default)', backgroundColor: '#fafafa' }}>
        {DAY_KEYS.map((key, i) => (
          <div key={key} style={{
            fontFamily: 'var(--font-body)', fontSize: '0.6875rem', fontWeight: 500,
            textAlign: 'center', padding: '5px 0',
            color: i === 0 ? 'var(--color-error)' : i === 6 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          }}>
            {t(key)}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, idx) => {
          const weekIdx = Math.floor(idx / 7)
          const { slotMap, maxSlot } = weekInfo[weekIdx]
          const isSun = idx % 7 === 0
          const isSat = idx % 7 === 6

          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                style={{ padding: '3px', backgroundColor: '#fafafa', borderRight: '1px solid var(--color-border-default)', borderBottom: '1px solid var(--color-border-default)', minHeight: 68, overflow: 'hidden' }}
              />
            )
          }

          const dateStr = `${year}-${monthStr}-${pad(day)}`
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const bars = barsByDate[dateStr] ?? []
          const holidayName = holidayMap[dateStr]
          const isHoliday = !!holidayName
          const anniversaryName = anniversaries
            .filter(a => a.month === month + 1 && a.day === day)
            .map(a => a.name)
            .join(', ')

          const dayNumColor = isToday ? '#ffffff'
            : (isHoliday || isSun) ? 'var(--color-error)'
            : isSat ? 'var(--color-accent)'
            : 'var(--color-text-primary)'

          // 이 셀에서 slotIndex → barInfo 매핑
          const barBySlot: Record<number, BarInfo> = {}
          bars.forEach(bar => {
            const slot = slotMap[bar.todo.id]
            if (slot !== undefined) barBySlot[slot] = bar
          })

          return (
            <div
              key={dateStr}
              data-testid={isToday ? 'calendar-today' : `calendar-day-${dateStr}`}
              onClick={() => onSelectDate?.(dateStr)}
              style={{
                padding: '3px', minHeight: 68, overflow: 'hidden',
                backgroundColor: isSelected ? '#fff3e0' : isToday ? '#e8f0fe' : 'var(--color-bg-surface)',
                borderRight: '1px solid var(--color-border-default)',
                borderBottom: isSelected ? '2px solid #f57c00' : '1px solid var(--color-border-default)',
                cursor: onSelectDate ? 'pointer' : 'default',
              }}
            >
              {/* 날짜 숫자 (Google Calendar 스타일 원형) */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 1 }}>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                  fontWeight: isToday ? 600 : 400,
                  width: 22, height: 22, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', borderRadius: '50%',
                  backgroundColor: isToday ? 'var(--color-accent)' : 'transparent',
                  color: dayNumColor, flexShrink: 0,
                }}>
                  {day}
                </span>
              </div>

              {/* 기념일 — 없는 셀도 동일 높이 확보 (바 정렬 유지) */}
              <div style={{ height: 12, marginBottom: 1, overflow: 'hidden' }}>
                {anniversaryName && (
                  <span
                    data-testid={`anniversary-${dateStr}`} title={anniversaryName}
                    style={{
                      display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.5rem',
                      color: '#e91e63', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {anniversaryName}
                  </span>
                )}
              </div>

              {/* 공휴일 — 없는 셀도 동일 높이 확보 (바 정렬 유지) */}
              <div style={{ height: 12, marginBottom: 1, overflow: 'hidden' }}>
                {isHoliday && (
                  <span
                    data-testid={`holiday-${dateStr}`} title={holidayName}
                    style={{
                      display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.5rem',
                      color: 'var(--color-error)', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
                    }}
                  >
                    {holidayName}
                  </span>
                )}
              </div>

              {/* 슬롯 기반 일정 바
                  모든 슬롯 0..maxSlot을 렌더링(빈 슬롯은 스페이서)하여
                  같은 주의 모든 셀에서 동일 슬롯이 동일 높이에 위치하도록 보장 */}
              {maxSlot >= 0 && Array.from({ length: maxSlot + 1 }, (_, slot) => {
                const bar = barBySlot[slot]

                if (!bar) {
                  return <div key={`sp-${slot}`} style={{ height: 16, marginTop: 2 }} />
                }

                const status = calcTodoStatus(bar.todo)
                const color = STATUS_COLOR[status]
                const isSingleDay = !bar.todo.endDate || bar.todo.startDate === bar.todo.endDate
                const leftOpen  = !isSingleDay && !bar.isStart && !bar.isWeekStart
                const rightOpen = !isSingleDay && !bar.isEnd   && !bar.isWeekEnd
                const showLeft  = bar.isStart || bar.isWeekStart || isSingleDay
                const showRight = bar.isEnd   || bar.isWeekEnd  || isSingleDay
                const showTitle = bar.isStart || bar.isWeekStart

                return (
                  <Link
                    key={bar.todo.id}
                    to={`/todos/${bar.todo.id}/edit`}
                    data-testid={`calendar-todo-${bar.todo.id}`}
                    title={bar.todo.title}
                    style={{
                      display: 'block', height: 16, lineHeight: '16px', marginTop: 2,
                      marginLeft: leftOpen  ? -3 : 0,
                      marginRight: rightOpen ? -3 : 0,
                      paddingLeft: showTitle ? 4 : 0, paddingRight: 1,
                      fontFamily: 'var(--font-body)', fontSize: '0.5rem', fontWeight: 500,
                      color: showTitle ? color : 'transparent',
                      backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                      borderTop:    `1.5px solid color-mix(in srgb, ${color} 45%, transparent)`,
                      borderBottom: `1.5px solid color-mix(in srgb, ${color} 45%, transparent)`,
                      borderLeft:  showLeft  ? `2.5px solid ${color}` : 'none',
                      borderRight: showRight ? `1px solid color-mix(in srgb, ${color} 35%, transparent)` : 'none',
                      borderRadius: `${showLeft ? 3 : 0}px ${showRight ? 3 : 0}px ${showRight ? 3 : 0}px ${showLeft ? 3 : 0}px`,
                      overflow: 'hidden', textDecoration: 'none',
                      whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}
                  >
                    {showTitle ? bar.todo.title : ''}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: '1.25rem', fontWeight: 300,
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--color-text-secondary)',
  width: 32, height: 32, display: 'flex', alignItems: 'center',
  justifyContent: 'center', borderRadius: '50%', padding: 0, lineHeight: 1,
}

export default TodoCalendar
