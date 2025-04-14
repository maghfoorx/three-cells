import { Link } from "react-router";
import AppLogoIcon from "./AppLogoIcon";

export default function LoggedOutHeader() {
  return (
    <header className="my-4 mx-auto w-full text-sm not-has-[nav]:hidden lg:max-w-6xl px-4">
      <nav className="flex items-center justify-between gap-4">
        <Link to={"/"}>
          <AppLogoIcon className="h-10 w-10 rounded-md" />
        </Link>
        <div />
      </nav>
    </header>
  );
}
