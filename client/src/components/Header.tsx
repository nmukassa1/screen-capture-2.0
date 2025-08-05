import NavButton from "./NavButton";

function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1 className="font-bold text-lg">Curatemap</h1>

      <NavButton />
    </header>
  );
}

export default Header;
