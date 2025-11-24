import { Link } from "react-router";
import AppLogoIcon from "./AppLogoIcon";

export default function LoggedOutHeader() {
  return (
    <header className="my-4 mx-auto w-full text-sm not-has-[nav]:hidden lg:max-w-6xl px-4">
      <nav className="flex items-center justify-between gap-4">
        <Link to={"/"} viewTransition>
          <AppLogoIcon className="h-20 w-20 rounded-md border border-gray-300" />
        </Link>
        <div />
      </nav>
    </header>
  );
}
