import { LinkButton } from "@/components/ui/Button";
import { Ornament } from "@/components/site/Ornament";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex flex-col items-center">
        <p className="font-serif text-7xl font-semibold text-wine-700">404</p>
        <Ornament className="mt-4" />
        <h1 className="mt-4 font-serif text-3xl text-ink-900">This page could not be found</h1>
        <p className="mt-2 text-ink-500">The invitation link may be wrong or no longer active.</p>
        <LinkButton href="/" className="mt-8">
          Go home
        </LinkButton>
      </div>
    </main>
  );
}
