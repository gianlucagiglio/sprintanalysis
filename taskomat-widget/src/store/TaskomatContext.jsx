import { createContext, useContext, useReducer, useCallback } from 'react'
import { PAGES } from '../utils/constants'

const TaskomatContext = createContext(null)

const initialState = {
  projects: [],
  currentPage: PAGES.CREATE,
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id
            ? {
                ...p,
                budgetSale: action.payload.budgetSale,
                budgetDev: action.payload.budgetDev,
                workunits: [...p.workunits, ...action.payload.newWorkunits],
              }
            : p
        ),
      }
    case 'NAVIGATE':
      return { ...state, currentPage: action.payload }
    default:
      return state
  }
}

export function TaskomatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addProject = useCallback((project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project })
  }, [])

  const updateProject = useCallback((payload) => {
    dispatch({ type: 'UPDATE_PROJECT', payload })
  }, [])

  const navigateTo = useCallback((page) => {
    dispatch({ type: 'NAVIGATE', payload: page })
  }, [])

  const value = {
    projects: state.projects,
    currentPage: state.currentPage,
    addProject,
    updateProject,
    navigateTo,
  }

  return (
    <TaskomatContext.Provider value={value}>
      {children}
    </TaskomatContext.Provider>
  )
}

export function useTaskomat() {
  const ctx = useContext(TaskomatContext)
  if (!ctx) throw new Error('useTaskomat must be used within TaskomatProvider')
  return ctx
}
