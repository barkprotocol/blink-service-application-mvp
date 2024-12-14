import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface BlinkState {
  id: string
  text: string
  fontSize: number
  bgColor: string
  textColor: string
  isAnimated: boolean
  memo: string
}

export function useBlink(initialState?: Partial<BlinkState>) {
  const [blink, setBlink] = useState<BlinkState>({
    id: uuidv4(),
    text: '',
    fontSize: 24,
    bgColor: '#eae3de',
    textColor: '#010101',
    isAnimated: false,
    memo: '',
    ...initialState,
  })

  const updateBlink = useCallback((updates: Partial<BlinkState>) => {
    setBlink((prevState) => ({ ...prevState, ...updates }))
  }, [])

  const resetBlink = useCallback(() => {
    setBlink({
      id: uuidv4(),
      text: '',
      fontSize: 24,
      bgColor: '#eae3de',
      textColor: '#010101',
      isAnimated: false,
      memo: '',
    })
  }, [])

  return { blink, updateBlink, resetBlink }
}

