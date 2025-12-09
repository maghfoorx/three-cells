import { MDXProvider } from "@mdx-js/react";
import Post from "./posts/2026-best-life.mdx";
import type { Route } from "./+types";

// Custom components for MDX styling (if any additional ones are needed globally)
const mdxComponents = {};

export function meta({ }: Route.MetaArgs) {
    return [
        {
            title: "How to make 2026 the best year of your life",
        },
        {
            name: "description",
            content: "Forget resolutions. They don't work. To make 2026 your breakthrough year, you need a system. Here is the exact data-driven framework to build a life you're proud of.",
        },
        {
            property: "og:title",
            content: "How to make 2026 the best year of your life",
        },
        {
            property: "og:description",
            content: "Forget resolutions. They don't work. To make 2026 your breakthrough year, you need a system. Here is the exact data-driven framework to build a life you're proud of.",
        },
        {
            property: "article:published_time",
            content: "2025-12-09",
        },
    ];
}

export default function BestLife2026Page() {
    return (
        <article className="prose max-w-4xl w-full">
            <MDXProvider components={mdxComponents}>
                <Post />
            </MDXProvider>
        </article>
    );
}
