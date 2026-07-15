import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { Toast } from './toast'
import styles from './toast.module.css'

describe('Toast Component', () => {
  test('renders the message text correctly', () => {
    const handleClose = vi.fn()
    render(<Toast message="Test success message" type="success" onClose={handleClose} />)
    expect(screen.getByText('Test success message')).toBeInTheDocument()
  })

  test('applies success styling classes when type is success', () => {
    const handleClose = vi.fn()
    render(<Toast message="Success" type="success" onClose={handleClose} />)
    const toastElement = screen.getByText('Success').closest('div')
    expect(toastElement).toHaveClass(styles.toast)
    expect(toastElement).toHaveClass(styles.success)
    expect(toastElement).not.toHaveClass(styles.error)
  })

  test('applies error styling classes when type is error', () => {
    const handleClose = vi.fn()
    render(<Toast message="Error occurred" type="error" onClose={handleClose} />)
    const toastElement = screen.getByText('Error occurred').closest('div')
    expect(toastElement).toHaveClass(styles.toast)
    expect(toastElement).toHaveClass(styles.error)
    expect(toastElement).not.toHaveClass(styles.success)
  })

  test('calls onClose after default 4000ms for success type', () => {
    vi.useFakeTimers()
    const handleClose = vi.fn()
    render(<Toast message="Success" type="success" onClose={handleClose} />)
    
    vi.advanceTimersByTime(3999)
    expect(handleClose).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(1)
    expect(handleClose).toHaveBeenCalledTimes(1)
    
    vi.useRealTimers()
  })

  test('calls onClose after default 4000ms for error type', () => {
    vi.useFakeTimers()
    const handleClose = vi.fn()
    render(<Toast message="Error" type="error" onClose={handleClose} />)
    
    vi.advanceTimersByTime(3999)
    expect(handleClose).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(1)
    expect(handleClose).toHaveBeenCalledTimes(1)
    
    vi.useRealTimers()
  })

  test('calls onClose after custom duration when provided', () => {
    vi.useFakeTimers()
    const handleClose = vi.fn()
    render(<Toast message="Success" type="success" duration={1000} onClose={handleClose} />)
    
    vi.advanceTimersByTime(999)
    expect(handleClose).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(1)
    expect(handleClose).toHaveBeenCalledTimes(1)
    
    vi.useRealTimers()
  })

  test('calls onClose immediately when close button is clicked', async () => {
    const handleClose = vi.fn()
    render(<Toast message="Success" type="success" onClose={handleClose} />)
    
    const closeButton = screen.getByRole('button', { name: /schließen/i })
    expect(handleClose).not.toHaveBeenCalled()
    
    const user = userEvent.setup()
    await user.click(closeButton)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  test('clears the auto-dismiss timer on unmount', () => {
    vi.useFakeTimers()
    const handleClose = vi.fn()
    const { unmount } = render(<Toast message="Success" type="success" onClose={handleClose} />)
    
    unmount()
    
    vi.advanceTimersByTime(4000)
    expect(handleClose).not.toHaveBeenCalled()
    
    vi.useRealTimers()
  })
})
