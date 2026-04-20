import type { Preview } from "@storybook/nextjs-vite";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import React from "react";
import "../src/app/globals.css";

const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const style = document.createElement("style");
style.textContent = `
  :root {
    --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;
    --font-serif: 'Playfair Display', ui-serif, serif;
    --font-heading: var(--font-serif);
  }
`;
document.head.appendChild(style);

let convexClient: ConvexReactClient | null = null;
function getConvexClient() {
  if (!convexClient) {
    const url =
      process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://stub.convex.cloud";
    convexClient = new ConvexReactClient(url, { unsavedChangesWarning: false });
  }
  return convexClient;
}

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [
    (Story, context) => {
      if (!context.parameters?.convex) return <Story />;
      const client = getConvexClient();
      return (
        <ConvexProvider client={client}>
          <Story />
        </ConvexProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    layout: "centered",
    docs: {
      toc: true,
    },
  },
};

export default preview;
