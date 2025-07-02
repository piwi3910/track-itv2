export function LoginPage(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to Track-it</h2>
          <p className="mt-2 text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}