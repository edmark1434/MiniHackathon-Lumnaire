import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hello World" },
    { name: "description", content: "A minimal React app" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900">
        Hello World
      </h1>
    </div>
  );
}
