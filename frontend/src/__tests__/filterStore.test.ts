import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { useFilterStore } from '../store/filterStore'

describe('filterStore', () => {
  beforeEach(() => {
    useFilterStore.getState().reset()
  })

  it('초기 상태에서 status와 categoryId가 null이다', () => {
    const state = useFilterStore.getState()
    expect(state.status).toBeNull()
    expect(state.categoryId).toBeNull()
  })

  it('setStatus() 호출 시 status가 업데이트된다', () => {
    act(() => {
      useFilterStore.getState().setStatus('in_progress')
    })
    expect(useFilterStore.getState().status).toBe('in_progress')
  })

  it('setStatus(null) 호출 시 status가 null이 된다', () => {
    act(() => {
      useFilterStore.getState().setStatus('completed')
    })
    act(() => {
      useFilterStore.getState().setStatus(null)
    })
    expect(useFilterStore.getState().status).toBeNull()
  })

  it('setCategoryId() 호출 시 categoryId가 업데이트된다', () => {
    act(() => {
      useFilterStore.getState().setCategoryId('uuid-cat-1')
    })
    expect(useFilterStore.getState().categoryId).toBe('uuid-cat-1')
  })

  it('setCategoryId(null) 호출 시 categoryId가 null이 된다', () => {
    act(() => {
      useFilterStore.getState().setCategoryId('uuid-cat-1')
    })
    act(() => {
      useFilterStore.getState().setCategoryId(null)
    })
    expect(useFilterStore.getState().categoryId).toBeNull()
  })

  it('reset() 호출 시 모든 필터가 null로 초기화된다', () => {
    act(() => {
      useFilterStore.getState().setStatus('overdue')
      useFilterStore.getState().setCategoryId('uuid-cat-2')
    })
    act(() => {
      useFilterStore.getState().reset()
    })
    const state = useFilterStore.getState()
    expect(state.status).toBeNull()
    expect(state.categoryId).toBeNull()
  })

  it('모든 TodoStatus 값을 설정할 수 있다', () => {
    const statuses = ['pending', 'in_progress', 'overdue', 'completed'] as const
    for (const s of statuses) {
      act(() => {
        useFilterStore.getState().setStatus(s)
      })
      expect(useFilterStore.getState().status).toBe(s)
    }
  })

  it('서버 데이터(Todo, Category 목록)는 filterStore에 저장되지 않는다', () => {
    const state = useFilterStore.getState()
    const allowedKeys = ['status', 'categoryId', 'assigneeId', 'viewMode', 'setStatus', 'setCategoryId', 'setAssigneeId', 'setViewMode', 'reset']
    const stateKeys = Object.keys(state)
    const unexpectedKeys = stateKeys.filter(k => !allowedKeys.includes(k))
    expect(unexpectedKeys).toHaveLength(0)
  })

  it('초기 assigneeId가 null이다', () => {
    expect(useFilterStore.getState().assigneeId).toBeNull()
  })

  it('setAssigneeId() 호출 시 assigneeId가 업데이트된다', () => {
    act(() => {
      useFilterStore.getState().setAssigneeId('assignee-1')
    })
    expect(useFilterStore.getState().assigneeId).toBe('assignee-1')
  })

  it('reset() 호출 시 assigneeId가 null로 초기화된다', () => {
    act(() => {
      useFilterStore.getState().setAssigneeId('assignee-1')
    })
    act(() => {
      useFilterStore.getState().reset()
    })
    expect(useFilterStore.getState().assigneeId).toBeNull()
  })

  it('초기 viewMode가 "list"다', () => {
    expect(useFilterStore.getState().viewMode).toBe('list')
  })

  it('setViewMode("calendar") 호출 시 viewMode가 변경된다', () => {
    act(() => {
      useFilterStore.getState().setViewMode('calendar')
    })
    expect(useFilterStore.getState().viewMode).toBe('calendar')
  })

  it('reset() 호출 시 viewMode가 "list"로 초기화된다', () => {
    act(() => {
      useFilterStore.getState().setViewMode('calendar')
    })
    act(() => {
      useFilterStore.getState().reset()
    })
    expect(useFilterStore.getState().viewMode).toBe('list')
  })
})
