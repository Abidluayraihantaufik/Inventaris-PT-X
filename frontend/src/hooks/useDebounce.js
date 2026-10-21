import { useState, useEffect, useRef } from 'react'

/**
 * Menunda update nilai sampai user berhenti mengetik.
 * Berguna untuk search input agar tidak fire API setiap keystroke.
 *
 * @example
 * const debouncedSearch = useDebounce(searchValue, 400)
 * useEffect(() => { fetchData(debouncedSearch) }, [debouncedSearch])
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
