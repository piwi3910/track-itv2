export function ProjectsPage(): JSX.Element {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Projects</h2>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          New Project
        </button>
      </div>
      <div className="bg-card rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
      </div>
    </div>
  );
}