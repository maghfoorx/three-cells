import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

import type { Route } from "./+types/root";
import "./app.css";
import { Toaster } from "./components/ui/sonner";
import PromptClientToRefresh from "./components/PromptClientToRefresh";
import { TooltipProvider } from "./components/ui/tooltip";
import FullscreenSpinner from "./components/FullscreenSpinner";
import AddMetricEntryDialog from "./pages/metrics/AddMetricEntryDialog";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "manifest",
    href: "/manifest.json",
  },
];

export const meta: Route.MetaFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          data-domain="three-cells.com"
          src="https://p.maghfoor.com/js/script.outbound-links.pageview-props.tagged-events.js"
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          media="print"
        />

        {/* Static Meta Tags for SEO and Social */}
        <title>Three Cells - Lifestyle app for motivated people</title>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />

        <link rel="preload" as="image" href="/main-app.webp" />
        <link rel="preload" as="image" href="/meditating.webp" />
        <link
          rel="preload"
          as="video"
          type="video/webm"
          href="/app-demo-video.webm"
        />

        <meta
          name="description"
          content="Discover your best life with just three questions a day."
        />
        <meta
          name="keywords"
          content="Simplex method, productivity, best life, habits, journaling, tasks, metric tracking, weight loss, focused hours"
        />

        {/* Open Graph */}
        <meta property="og:title" content="Three Cells" />
        <meta
          property="og:description"
          content="Three Cells is where you build lasting, journal daily and track metrics you care about. Remove app fatigue and just use one app that has everything you need to build your best life."
        />
        <meta
          property="og:image"
          content="https://three-cells.com/og-image.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="Three Cells" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="three-cells.com" />
        <meta name="twitter:title" content="Three Cells" />
        <meta
          name="twitter:description"
          content="Discover your best life with just three questions a day."
        />
        <meta
          name="twitter:image"
          content="https://three-cells.com/og-image.png"
        />
        <meta name="twitter:image:alt" content="Three Cells" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        <meta name="twitter:creator" content="@maghfoorx" />

        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

const AllDialogs = () => {
  return (
    <>
      <AddMetricEntryDialog />
    </>
  );
};

export default function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <ConvexAuthProvider client={convex}>
        <PromptClientToRefresh />
        <Outlet />
        <AllDialogs />
      </ConvexAuthProvider>
    </TooltipProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function HydrateFallback() {
  return <FullscreenSpinner />;
}
