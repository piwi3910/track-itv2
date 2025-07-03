import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SearchBar } from './search/SearchBar';

export function Layout(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold">Track-it</h1>
              <nav className="flex gap-6">
                <Link to="/dashboard" className="hover:text-primary">
                  Dashboard
                </Link>
                <Link to="/projects" className="hover:text-primary">
                  Projects
                </Link>
                <Link to="/tasks" className="hover:text-primary">
                  Tasks
                </Link>
              </nav>
            </div>
            
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar />
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm px-3 py-1 border border-input rounded-md hover:bg-accent"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}