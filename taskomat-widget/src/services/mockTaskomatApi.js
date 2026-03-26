/**
 * Mock API for Taskomat project creation.
 * Simulates latency (~800ms) and error if budget > 100000.
 */
export function createTaskomatProject(payload) {
  return new Promise((resolve, reject) => {
    console.log('[MockAPI] createTaskomatProject called with:', payload)

    setTimeout(() => {
      const budget = Number(payload.budgetSale)

      if (budget > 100000) {
        console.error('[MockAPI] Budget exceeded limit:', budget)
        reject({
          success: false,
          error: 'BUDGET_EXCEEDED',
          message: 'Il budget non può superare €100.000. Contatta il team vendite per progetti enterprise.',
        })
        return
      }

      const id = `project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      console.log('[MockAPI] Project created:', id)

      resolve({
        success: true,
        id,
        message: 'Progetto creato con successo',
      })
    }, 800)
  })
}
