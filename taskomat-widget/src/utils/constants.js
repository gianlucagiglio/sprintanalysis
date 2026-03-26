/** Step definitions */
export const STEPS = [
  { id: 0, label: 'Cliente e Progetto', shortLabel: 'Cliente' },
  { id: 1, label: 'Budget', shortLabel: 'Budget' },
  { id: 2, label: 'Workunit e Task', shortLabel: 'Workunit' },
  { id: 3, label: 'Riepilogo', shortLabel: 'Riepilogo' },
  { id: 4, label: 'Conferma', shortLabel: 'Conferma' },
]

export const TOTAL_STEPS = STEPS.length

/** Wizard action types */
export const ACTION = {
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  GO_TO_STEP: 'GO_TO_STEP',
  SET_FIELD: 'SET_FIELD',
  SET_ERRORS: 'SET_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  ADD_WORKUNIT: 'ADD_WORKUNIT',
  REMOVE_WORKUNIT: 'REMOVE_WORKUNIT',
  UPDATE_WORKUNIT_NAME: 'UPDATE_WORKUNIT_NAME',
  ADD_TASK: 'ADD_TASK',
  REMOVE_TASK: 'REMOVE_TASK',
  UPDATE_TASK_FIELD: 'UPDATE_TASK_FIELD',
  SUBMIT_START: 'SUBMIT_START',
  SUBMIT_SUCCESS: 'SUBMIT_SUCCESS',
  SUBMIT_ERROR: 'SUBMIT_ERROR',
  RESET: 'RESET',
}

/** Pages */
export const PAGES = {
  CREATE: 'create',
  LIST: 'list',
}

/** Validation messages in Italian */
export const MSG = {
  REQUIRED: 'Campo obbligatorio',
  MIN_LENGTH: (n) => `Minimo ${n} caratteri`,
  MUST_BE_NUMBER: 'Deve essere un numero',
  MUST_BE_POSITIVE: 'Deve essere maggiore di 0',
  MAX_BUDGET: 'Il budget non può superare €100.000',
  WORKUNIT_NAME_REQUIRED: 'Nome workunit obbligatorio',
  TASK_NAME_REQUIRED: 'Nome task obbligatorio',
  TASK_HOURS_REQUIRED: 'Ore stimate obbligatorie',
  TASK_HOURS_POSITIVE: 'Le ore devono essere maggiori di 0',
  AT_LEAST_ONE_WORKUNIT: 'Almeno una workunit richiesta',
  AT_LEAST_ONE_TASK: 'Ogni workunit deve avere almeno un task',
}

/** Initial form state */
export const INITIAL_FORM_DATA = {
  existingProjectId: null,
  customer: '',
  project: '',
  budgetSale: '',
  budgetDev: '',
  workunits: [
    {
      name: '',
      tasks: [{ name: '', estimatedTime: '' }],
    },
  ],
}

/** Initial wizard state */
export const INITIAL_WIZARD_STATE = {
  currentStep: 0,
  formData: INITIAL_FORM_DATA,
  errors: {},
  submitting: false,
  submitResult: null,
}
