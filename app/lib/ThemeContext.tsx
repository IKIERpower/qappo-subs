'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeContextType {
    isDark: boolean
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('theme')
        const shouldBeDark = saved ? saved === 'dark' : false

        setIsDark(shouldBeDark)

        const html = document.documentElement
        if (shouldBeDark) {
            html.classList.add('dark')
            html.setAttribute('data-theme', 'dark')
        } else {
            html.classList.remove('dark')
            html.setAttribute('data-theme', 'light')
        }
    }, [])

    function toggleTheme() {
        setIsDark(prev => {
            const next = !prev
            const html = document.documentElement

            // Enable transition for smooth color change
            html.classList.add('theme-transition')

            if (next) {
                html.classList.add('dark')
                html.setAttribute('data-theme', 'dark')
            } else {
                html.classList.remove('dark')
                html.setAttribute('data-theme', 'light')
            }

            localStorage.setItem('theme', next ? 'dark' : 'light')

            // Remove transition class after animation completes
            setTimeout(() => html.classList.remove('theme-transition'), 300)

            return next
        })
    }

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}
