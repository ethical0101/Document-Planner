import WorkspaceLanding from "../_components/WorkspaceLanding";

export default async function WorkspacePage({ params }) {
  const { workspaceid } = await params;
  return <WorkspaceLanding workspaceId={workspaceid} />;
}
