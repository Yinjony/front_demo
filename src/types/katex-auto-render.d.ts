// Minimal ambient types for KaTeX's auto-render extension.
// KaTeX ships its own types for the main `katex` module, but the
// `katex/contrib/auto-render` subpath declares none — so we do it here to keep
// `vue-tsc` happy without pulling in the redundant (and potentially conflicting)
// @types/katex package.
declare module 'katex/contrib/auto-render' {
  export interface AutoRenderDelimiter {
    left: string
    right: string
    display?: boolean
  }

  export interface AutoRenderOptions {
    delimiters?: AutoRenderDelimiter[]
    ignoredTags?: string[]
    ignoredClasses?: string[]
    errorColor?: string
    throwOnError?: boolean
    strict?: boolean | string
    trust?: boolean
    macros?: Record<string, unknown>
    [key: string]: unknown
  }

  // KaTeX ships this as a default export (`export { renderMathInElement as default }).
  export default function renderMathInElement(
    element: HTMLElement | Document,
    options?: AutoRenderOptions,
  ): void
}
