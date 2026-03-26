import FormField from '../forms/FormField'

export default function StepBudget({ formData, errors, dispatch }) {
  return (
    <div className="step-content">
      <h2 className="step-title">Budget</h2>
      <p className="step-description">
        Definisci il budget di vendita e quello disponibile per lo sviluppo.
      </p>
      <div className="step-fields">
        <FormField
          label="Budget di vendita (EUR)"
          error={errors.budgetSale}
          required
          htmlFor="budgetSale"
        >
          <div className="budget-input-wrap">
            <span className="budget-input-prefix">€</span>
            <input
              id="budgetSale"
              type="number"
              className={`form-input${errors.budgetSale ? ' is-error' : ''}`}
              placeholder="0"
              min="0"
              step="100"
              value={formData.budgetSale}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'budgetSale', value: e.target.value })
              }
            />
          </div>
        </FormField>
        <FormField
          label="Budget sviluppo (EUR)"
          error={errors.budgetDev}
          required
          htmlFor="budgetDev"
        >
          <div className="budget-input-wrap">
            <span className="budget-input-prefix">€</span>
            <input
              id="budgetDev"
              type="number"
              className={`form-input${errors.budgetDev ? ' is-error' : ''}`}
              placeholder="0"
              min="0"
              step="100"
              value={formData.budgetDev}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'budgetDev', value: e.target.value })
              }
            />
          </div>
        </FormField>
      </div>
    </div>
  )
}
