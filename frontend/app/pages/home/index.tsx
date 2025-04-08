import type { Route } from "./+types/index";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Three Cells" },
    { name: "description", content: "Three Cells description" },
  ];
}

export default function Home() {
  return (
    <main className="flex flex-col gap-2 items-center">
      <h1>Home page</h1>
    </main>
  );
}
