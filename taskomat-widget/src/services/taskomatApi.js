/**
 * API abstraction layer.
 * Currently delegates to mock; will be swapped for real endpoints.
 */
import { createTaskomatProject as mockCreate } from './mockTaskomatApi'

export function createProject(payload) {
  return mockCreate(payload)
}
