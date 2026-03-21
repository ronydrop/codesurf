import type { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import type { AppSettings } from '../shared/types'

const OPAQUE_WINDOW_BACKGROUND = '#111111'
const TRANSPARENT_WINDOW_BACKGROUND = '#00000000'

function isTranslucentEnabled(settings?: Partial<AppSettings> | null): boolean {
  return Boolean(settings?.translucentBackground)
}

export function getWindowAppearanceOptions(settings?: Partial<AppSettings> | null): Pick<BrowserWindowConstructorOptions, 'transparent' | 'backgroundColor' | 'vibrancy' | 'visualEffectState'> {
  const translucent = isTranslucentEnabled(settings)
  const isMac = process.platform === 'darwin'
  return {
    // Keep the host window transparency-capable so the setting can apply live
    // without recreating the BrowserWindow.
    transparent: true,
    backgroundColor: translucent ? TRANSPARENT_WINDOW_BACKGROUND : OPAQUE_WINDOW_BACKGROUND,
    vibrancy: translucent && isMac ? 'under-window' : undefined,
    visualEffectState: translucent && isMac ? 'active' : undefined,
  }
}

export function applyWindowAppearance(win: BrowserWindow, settings?: Partial<AppSettings> | null): void {
  const translucent = isTranslucentEnabled(settings)
  win.setBackgroundColor(translucent ? TRANSPARENT_WINDOW_BACKGROUND : OPAQUE_WINDOW_BACKGROUND)

  if (process.platform === 'darwin') {
    win.setVibrancy(translucent ? 'under-window' : null)
  }
}
