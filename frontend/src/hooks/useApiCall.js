import { useState, useCallback } from 'react'
import { getErrorMessage } from '../utils/helpers'

/**
 * Hook untuk mengelola state loading, error, dan sukses pada API call.
 *
 * @example
 * const { loading, error, success, execute, reset } = useApiCall()
 * await execute(() => productAPI.create(data))
 */
export function useApiCall() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [success, setSuccess] = useState(null)

  const reset = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const execute = useCallback(async (fn, successMessage = null) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await fn()
      if (successMessage) setSuccess(successMessage)
      return result
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, success, execute, reset, setError, setSuccess }
}
