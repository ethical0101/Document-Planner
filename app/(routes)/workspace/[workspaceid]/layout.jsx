import WorkspaceShell from "../_components/WorkspaceShell";

export default async function WorkspaceLayout({ children, params }) {
  const { workspaceid } = await params;
  return <WorkspaceShell workspaceId={workspaceid}>{children}</WorkspaceShell>;
}
