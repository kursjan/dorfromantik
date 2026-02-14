import { render, screen } from '@testing-library/react'
import App from './App'
import { describe, it, expect } from 'vitest'

describe('App', () => {
  it('renders dorfromantik heading', () => {
    render(<App />)
    const heading = screen.getByText(/dorfromantik/i)
    expect(heading).toBeInTheDocument()
  })
})
