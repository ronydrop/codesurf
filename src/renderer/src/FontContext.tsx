import React, { createContext, useContext } from 'react'
import type { FontSettings, FontToken } from '../../shared/types'
import { DEFAULT_FONTS } from '../../shared/types'

// ── Legacy compat exports ───────────────────────────────────────────────────
export const SANS_DEFAULT = DEFAULT_FONTS.sans.family
export const MONO_DEFAULT = DEFAULT_FONTS.mono.family

// ── Simple interface for components that just need sans/mono ─────────────────
export interface AppFonts {
  sans: string
  mono: string
  size: number
  monoSize: number
}

// ── Full token context ──────────────────────────────────────────────────────
const FontTokenContext = createContext<FontSettings>(DEFAULT_FONTS)
export const FontTokenProvider = FontTokenContext.Provider

/** Access any granular font token: fonts.terminal, fonts.chatToolbar, etc. */
export function useFontTokens(): FontSettings { return useContext(FontTokenContext) }

/** Convert a FontToken to a React.CSSProperties object */
export function tokenToStyle(token: FontToken): React.CSSProperties {
  return {
    fontFamily: token.family,
    fontSize: token.size,
    lineHeight: token.lineHeight,
    fontWeight: token.weight,
    letterSpacing: token.letterSpacing,
  }
}

// ── Legacy simple context (backward compat) ─────────────────────────────────
const FontContext = createContext<AppFonts>({
  sans: SANS_DEFAULT,
  mono: MONO_DEFAULT,
  size: 13,
  monoSize: 13,
})

export const FontProvider = FontContext.Provider
export function useAppFonts(): AppFonts { return useContext(FontContext) }
