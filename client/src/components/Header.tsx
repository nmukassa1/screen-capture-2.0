import NavButton from "./NavButton";

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Designspo
        </p>
        <h1 className="text-foreground text-lg font-semibold">Quick Capture</h1>
      </div>

      <NavButton />
    </header>
  );
}

export default Header;
