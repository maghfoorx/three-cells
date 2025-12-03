import { MDXProvider } from "@mdx-js/react";
import TestMDX from "./posts/habit.mdx";
import Footer from "~/components/Footer";
import LoggedOutHeader from "~/components/LoggedOutHeader";
import type { MetaFunction } from "react-router";
import type { Route } from "./+types";

// Custom components for MDX styling (if any additional ones are needed globally)
const mdxComponents = {};

export function meta({ }: Route.MetaArgs) {
    return [
        {
            title: "Mastering Habit Tracking: The 3-Step System to Consistency",
        },
        {
            name: "description",
            content:
                "Stop struggling with complex Notion dashboards. Learn why simplicity is the key to habit tracking and how a 3-step system can help you build discipline that lasts.",
        },
    ];
};

export default function TestBlogPostPage() {
    return (
        <>
            <main className="max-w-4xl flex flex-col gap-4 items-center mx-auto px-4">
                <LoggedOutHeader />
                <article className="prose max-w-4xl w-full">
                    <MDXProvider components={mdxComponents}>
                        <TestMDX />
                    </MDXProvider>
                </article>
            </main>
            <div className="mt-8">
                <Footer />
            </div>
        </>
    );
}
