import { MSG } from './constants'

/**
 * Validate step 0: Customer & Project
 */
export function validateCustomerProject(formData) {
  const errors = {}
  if (!formData.customer.trim()) {
    errors.customer = MSG.REQUIRED
  } else if (formData.customer.trim().length < 2) {
    errors.customer = MSG.MIN_LENGTH(2)
  }
  if (!formData.project.trim()) {
    errors.project = MSG.REQUIRED
  } else if (formData.project.trim().length < 2) {
    errors.project = MSG.MIN_LENGTH(2)
  }
  return errors
}

/**
 * Validate step 1: Budget (sale + dev)
 */
export function validateBudget(formData) {
  const errors = {}

  for (const field of ['budgetSale', 'budgetDev']) {
    const raw = formData[field]
    if (raw === '' || raw === null || raw === undefined) {
      errors[field] = MSG.REQUIRED
    } else {
      const num = Number(raw)
      if (isNaN(num)) {
        errors[field] = MSG.MUST_BE_NUMBER
      } else if (num <= 0) {
        errors[field] = MSG.MUST_BE_POSITIVE
      }
    }
  }

  return errors
}

/**
 * Validate step 2: Workunits & Tasks
 */
export function validateWorkunits(formData) {
  const errors = {}
  const { workunits } = formData

  if (!workunits || workunits.length === 0) {
    errors['workunits'] = MSG.AT_LEAST_ONE_WORKUNIT
    return errors
  }

  workunits.forEach((wu, wIdx) => {
    if (!wu.name.trim()) {
      errors[`workunits.${wIdx}.name`] = MSG.WORKUNIT_NAME_REQUIRED
    }
    if (!wu.tasks || wu.tasks.length === 0) {
      errors[`workunits.${wIdx}.tasks`] = MSG.AT_LEAST_ONE_TASK
      return
    }
    wu.tasks.forEach((task, tIdx) => {
      if (!task.name.trim()) {
        errors[`workunits.${wIdx}.tasks.${tIdx}.name`] = MSG.TASK_NAME_REQUIRED
      }
      const hours = task.estimatedTime
      if (hours === '' || hours === null || hours === undefined) {
        errors[`workunits.${wIdx}.tasks.${tIdx}.estimatedTime`] = MSG.TASK_HOURS_REQUIRED
      } else {
        const num = Number(hours)
        if (isNaN(num)) {
          errors[`workunits.${wIdx}.tasks.${tIdx}.estimatedTime`] = MSG.MUST_BE_NUMBER
        } else if (num <= 0) {
          errors[`workunits.${wIdx}.tasks.${tIdx}.estimatedTime`] = MSG.TASK_HOURS_POSITIVE
        }
      }
    })
  })

  return errors
}

/** Step validators map */
const STEP_VALIDATORS = [
  validateCustomerProject,
  validateBudget,
  validateWorkunits,
  () => ({}), // preview — no validation
  () => ({}), // confirm — no validation
]

/**
 * Validate a specific step
 */
export function validateStep(step, formData) {
  const validator = STEP_VALIDATORS[step]
  return validator ? validator(formData) : {}
}

/**
 * Validate entire payload (all steps combined)
 */
export function validateAll(formData) {
  return {
    ...validateCustomerProject(formData),
    ...validateBudget(formData),
    ...validateWorkunits(formData),
  }
}

/**
 * Check if errors object has any errors
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
