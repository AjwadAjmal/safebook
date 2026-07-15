'use client'

import React, { useEffect } from 'react'
import styles from './toast.module.css'

export interface ToastProps {
  message: string
  type: 'success' | 'error'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type, duration, onClose }: ToastProps) {
  const resolvedDuration = duration ?? (type === 'success' ? 4000 : 4000)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, resolvedDuration)
    
    return () => clearTimeout(timer)
  }, [resolvedDuration, onClose])

  const typeClass = type === 'success' ? styles.success : styles.error
  
  return (
    <div className={`${styles.toast} ${typeClass}`}>
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Schließen"
      >
        ✕
      </button>
      <div 
        className={styles.progressBar} 
        style={{ animationDuration: `${resolvedDuration}ms` }}
      />
    </div>
  )
}
