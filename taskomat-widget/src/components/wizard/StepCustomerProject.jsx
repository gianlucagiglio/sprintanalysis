import { useState, useMemo } from 'react'
import FormField from '../forms/FormField'
import { useTaskomat } from '../../store/TaskomatContext'

const NEW_VALUE = '__new__'

export default function StepCustomerProject({ formData, errors, dispatch }) {
  const { projects } = useTaskomat()

  const customers = useMemo(
    () => [...new Set(projects.map((p) => p.customer))],
    [projects]
  )
  const hasExisting = customers.length > 0

  const [isNewCustomer, setIsNewCustomer] = useState(!hasExisting)
  const [isNewProject, setIsNewProject] = useState(true)

  const customerProjects = useMemo(
    () => (isNewCustomer ? [] : projects.filter((p) => p.customer === formData.customer)),
    [projects, formData.customer, isNewCustomer]
  )

  const handleCustomerSelect = (e) => {
    const val = e.target.value
    if (val === NEW_VALUE) {
      setIsNewCustomer(true)
      setIsNewProject(true)
      dispatch({ type: 'SET_FIELD', field: 'existingProjectId', value: null })
      dispatch({ type: 'SET_FIELD', field: 'customer', value: '' })
      dispatch({ type: 'SET_FIELD', field: 'project', value: '' })
      dispatch({ type: 'SET_FIELD', field: 'budgetSale', value: '' })
      dispatch({ type: 'SET_FIELD', field: 'budgetDev', value: '' })
    } else {
      setIsNewCustomer(false)
      setIsNewProject(true)
      dispatch({ type: 'SET_FIELD', field: 'existingProjectId', value: null })
      dispatch({ type: 'SET_FIELD', field: 'customer', value: val })
      dispatch({ type: 'SET_FIELD', field: 'project', value: '' })
      dispatch({ type: 'SET_FIELD', field: 'budgetSale', value: '' })
      dispatch({ type: 'SET_FIELD', field: 'budgetDev', value: '' })
    }
  }

  const handleProjectSelect = (e) => {
    const val = e.target.value
    if (val === NEW_VALUE) {
      setIsNewProject(true)
      dispatch({ type: 'SET_FIELD', field: 'existingProjectId', value: null })
      dispatch({ type: 'SET_FIELD', field: 'project', value: '' })
      dispatch({ type: 'SET_FIELD', field: 'budgetSale', value: '' })
      dispatch({ type: 'SET_FIELD', field: 'budgetDev', value: '' })
    } else {
      setIsNewProject(false)
      dispatch({ type: 'SET_FIELD', field: 'project', value: val })
      const match = projects.find(
        (p) => p.customer === formData.customer && p.project === val
      )
      if (match) {
        dispatch({ type: 'SET_FIELD', field: 'existingProjectId', value: match.id })
        if (match.budgetSale) dispatch({ type: 'SET_FIELD', field: 'budgetSale', value: match.budgetSale })
        if (match.budgetDev) dispatch({ type: 'SET_FIELD', field: 'budgetDev', value: match.budgetDev })
      }
    }
  }

  return (
    <div className="step-content">
      <h2 className="step-title">Cliente e Progetto</h2>
      <p className="step-description">
        Inserisci il nome del cliente e il titolo del progetto che vuoi creare.
      </p>
      <div className="step-fields">
        <FormField
          label="Cliente"
          error={errors.customer}
          required
          htmlFor="customer"
        >
          {hasExisting ? (
            <div className="select-with-new">
              <select
                id="customer"
                className={`form-input form-select${errors.customer ? ' is-error' : ''}`}
                value={isNewCustomer ? NEW_VALUE : formData.customer}
                onChange={handleCustomerSelect}
              >
                <option value="" disabled>Seleziona cliente...</option>
                {customers.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value={NEW_VALUE}>Nuovo cliente...</option>
              </select>
              {isNewCustomer && (
                <input
                  type="text"
                  className={`form-input${errors.customer ? ' is-error' : ''}`}
                  placeholder="Es. Acme Corporation"
                  value={formData.customer}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'customer', value: e.target.value })
                  }
                  autoFocus
                />
              )}
            </div>
          ) : (
            <input
              id="customer"
              type="text"
              className={`form-input${errors.customer ? ' is-error' : ''}`}
              placeholder="Es. Acme Corporation"
              value={formData.customer}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'customer', value: e.target.value })
              }
            />
          )}
        </FormField>
        <FormField
          label="Progetto"
          error={errors.project}
          required
          htmlFor="project"
        >
          {!isNewCustomer && customerProjects.length > 0 ? (
            <div className="select-with-new">
              <select
                id="project"
                className={`form-input form-select${errors.project ? ' is-error' : ''}`}
                value={isNewProject ? NEW_VALUE : formData.project}
                onChange={handleProjectSelect}
              >
                <option value="" disabled>Seleziona progetto...</option>
                {customerProjects.map((p) => (
                  <option key={p.id} value={p.project}>{p.project}</option>
                ))}
                <option value={NEW_VALUE}>Nuovo progetto...</option>
              </select>
              {isNewProject && (
                <input
                  type="text"
                  className={`form-input${errors.project ? ' is-error' : ''}`}
                  placeholder="Es. Redesign sito web"
                  value={formData.project}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'project', value: e.target.value })
                  }
                  autoFocus
                />
              )}
            </div>
          ) : (
            <input
              id="project"
              type="text"
              className={`form-input${errors.project ? ' is-error' : ''}`}
              placeholder="Es. Redesign sito web"
              value={formData.project}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'project', value: e.target.value })
              }
            />
          )}
        </FormField>
      </div>
    </div>
  )
}
