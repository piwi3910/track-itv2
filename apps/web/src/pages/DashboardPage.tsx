export function DashboardPage(): JSX.Element {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Overdue</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
}