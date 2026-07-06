const loadedThemes = new Set<string>()

export async function loadCustomTheme(monaco: any, themeName: string, themeUrl: string) {
  if (loadedThemes.has(themeName)) {
    monaco.editor.setTheme(themeName)
    return
  }

  try {
    const response = await fetch(themeUrl)
    if (!response.ok) throw new Error('Failed to fetch theme')
    const themeData = await response.json()
    monaco.editor.defineTheme(themeName, themeData)
    loadedThemes.add(themeName)
    monaco.editor.setTheme(themeName)
  } catch (error) {
    console.error(`Error loading theme ${themeName}:`, error)
    monaco.editor.setTheme('testify-dark') // fallback
  }
}
