import { WEB_URL } from "../config";

const Login = () => {
  const openConnectPage = () => {
    chrome.tabs.create({ url: `${WEB_URL}/extension/connect` });
  };

  return (
    <div className="popup-width relative overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 bottom-8 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground mb-2 text-center text-xs font-medium tracking-[0.2em] uppercase">
          Designspo Extension
        </p>
        <h2 className="text-foreground mb-3 text-center text-2xl font-semibold">
          Welcome back
        </h2>
        <p className="text-muted-foreground text-center text-sm">
          Sign in on the Designspo website to connect this extension to your
          account.
        </p>

        <button
          type="button"
          onClick={openConnectPage}
          className="mt-6 cursor-pointer rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Connect with Designspo
        </button>
      </div>
    </div>
  );
};

export default Login;
