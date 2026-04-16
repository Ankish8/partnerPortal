import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

// Load the same Google Fonts used in the app
const fontLink = document.createElement('link')
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap'
fontLink.rel = 'stylesheet'
document.head.appendChild(fontLink)

// Apply CSS variables for fonts (matching next/font variable names)
const style = document.createElement('style')
style.textContent = `
  :root {
    --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;
    --font-serif: 'Playfair Display', ui-serif, serif;
    --font-heading: var(--font-serif);
  }
`
document.head.appendChild(style)

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    layout: 'centered',
    docs: {
      toc: true,
    },
  },
};

export default preview;
