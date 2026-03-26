import { useReducer, useCallback } from 'react'
import { ACTION, INITIAL_WIZARD_STATE } from '../../utils/constants'
import { validateStep, validateAll, hasErrors } from '../../utils/validation'
import { createProject } from '../../services/taskomatApi'
import { useTaskomat } from '../../store/TaskomatContext'
import WizardHeader from './WizardHeader'
import WizardFooter from './WizardFooter'
import StepCustomerProject from '../wizard/StepCustomerProject'
import StepBudget from '../wizard/StepBudget'
import StepWorkunits from '../wizard/StepWorkunits'
import StepPreview from '../wizard/StepPreview'
import StepConfirm from '../wizard/StepConfirm'

function wizardReducer(state, action) {
  switch (action.type) {
    case ACTION.NEXT_STEP:
      return { ...state, currentStep: state.currentStep + 1, errors: {} }

    case ACTION.PREV_STEP:
      return { ...state, currentStep: Math.max(0, state.currentStep - 1), errors: {} }

    case ACTION.GO_TO_STEP:
      return { ...state, currentStep: action.step, errors: {} }

    case ACTION.SET_FIELD:
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      }

    case ACTION.SET_ERRORS:
      return { ...state, errors: action.errors }

    case ACTION.CLEAR_ERRORS:
      return { ...state, errors: {} }

    case ACTION.ADD_WORKUNIT:
      return {
        ...state,
        formData: {
          ...state.formData,
          workunits: [
            ...state.formData.workunits,
            { name: '', tasks: [{ name: '', estimatedTime: '' }] },
          ],
        },
      }

    case ACTION.REMOVE_WORKUNIT: {
      const newWu = state.formData.workunits.filter((_, i) => i !== action.wIndex)
      return {
        ...state,
        formData: { ...state.formData, workunits: newWu },
      }
    }

    case ACTION.UPDATE_WORKUNIT_NAME: {
      const workunits = state.formData.workunits.map((wu, i) =>
        i === action.wIndex ? { ...wu, name: action.value } : wu
      )
      return { ...state, formData: { ...state.formData, workunits } }
    }

    case ACTION.ADD_TASK: {
      const workunits = state.formData.workunits.map((wu, i) =>
        i === action.wIndex
          ? { ...wu, tasks: [...wu.tasks, { name: '', estimatedTime: '' }] }
          : wu
      )
      return { ...state, formData: { ...state.formData, workunits } }
    }

    case ACTION.REMOVE_TASK: {
      const workunits = state.formData.workunits.map((wu, i) =>
        i === action.wIndex
          ? { ...wu, tasks: wu.tasks.filter((_, j) => j !== action.tIndex) }
          : wu
      )
      return { ...state, formData: { ...state.formData, workunits } }
    }

    case ACTION.UPDATE_TASK_FIELD: {
      const workunits = state.formData.workunits.map((wu, i) =>
        i === action.wIndex
          ? {
              ...wu,
              tasks: wu.tasks.map((t, j) =>
                j === action.tIndex ? { ...t, [action.field]: action.value } : t
              ),
            }
          : wu
      )
      return { ...state, formData: { ...state.formData, workunits } }
    }

    case ACTION.SUBMIT_START:
      return { ...state, submitting: true, submitResult: null }

    case ACTION.SUBMIT_SUCCESS:
      return { ...state, submitting: false, submitResult: action.result }

    case ACTION.SUBMIT_ERROR:
      return { ...state, submitting: false, submitResult: action.error }

    case ACTION.RESET:
      return { ...INITIAL_WIZARD_STATE }

    default:
      return state
  }
}

export default function ProjectWizard({ onClose }) {
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_WIZARD_STATE)
  const { addProject, updateProject } = useTaskomat()
  const { currentStep, formData, errors, submitting, submitResult } = state

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(currentStep, formData)
    if (hasErrors(stepErrors)) {
      dispatch({ type: ACTION.SET_ERRORS, errors: stepErrors })
      return
    }
    dispatch({ type: ACTION.NEXT_STEP })
  }, [currentStep, formData])

  const handlePrev = useCallback(() => {
    dispatch({ type: ACTION.PREV_STEP })
  }, [])

  const handleSubmit = useCallback(async () => {
    const allErrors = validateAll(formData)
    if (hasErrors(allErrors)) {
      dispatch({ type: ACTION.SET_ERRORS, errors: allErrors })
      return
    }

    dispatch({ type: ACTION.SUBMIT_START })
    dispatch({ type: ACTION.NEXT_STEP })

    try {
      if (formData.existingProjectId) {
        const result = await createProject(formData)
        updateProject({
          id: formData.existingProjectId,
          budgetSale: formData.budgetSale,
          budgetDev: formData.budgetDev,
          newWorkunits: formData.workunits,
        })
        dispatch({ type: ACTION.SUBMIT_SUCCESS, result })
      } else {
        const result = await createProject(formData)
        const project = {
          ...formData,
          id: result.id,
          createdAt: new Date().toISOString(),
        }
        addProject(project)
        dispatch({ type: ACTION.SUBMIT_SUCCESS, result })
      }
    } catch (error) {
      dispatch({ type: ACTION.SUBMIT_ERROR, error })
    }
  }, [formData, addProject, updateProject])

  const handleReset = useCallback(() => {
    dispatch({ type: ACTION.RESET })
  }, [])

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget && !submitting) onClose()
  }, [onClose, submitting])

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepCustomerProject formData={formData} errors={errors} dispatch={dispatch} />
      case 1:
        return <StepBudget formData={formData} errors={errors} dispatch={dispatch} />
      case 2:
        return <StepWorkunits formData={formData} errors={errors} dispatch={dispatch} />
      case 3:
        return <StepPreview formData={formData} />
      case 4:
        return (
          <StepConfirm
            submitting={submitting}
            submitResult={submitResult}
            onClose={onClose}
            onReset={handleReset}
            isUpdate={!!formData.existingProjectId}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="wizard-overlay" onClick={handleOverlayClick}>
      <div className="wizard-modal">
        {!submitting && (
          <button className="wizard-modal-close" onClick={onClose} title="Chiudi">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <div className="wizard">
          <WizardHeader currentStep={currentStep} />
          <div className="wizard-body">{renderStep()}</div>
          <WizardFooter
            currentStep={currentStep}
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitResult={submitResult}
          />
        </div>
      </div>
    </div>
  )
}
