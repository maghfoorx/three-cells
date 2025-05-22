import AppLogoIcon from "./AppLogoIcon";

export default function ApplicationLogo() {
  return (
    <>
      <div className="aspect-square rounded-md">
        <AppLogoIcon className="size-8" />
      </div>
      <div className="ml-1 grid flex-1 text-left text-sm">
        <span className="mb-0.5 truncate leading-none font-semibold">
          Three Cells
        </span>
      </div>
    </>
  );
}
