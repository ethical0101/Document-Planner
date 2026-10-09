import Header from "./_components/Header";
import WorkspaceList from "./_components/WorkspaceList";

export const metadata = { title: "Dashboard" };

export default function Dashboard() {
  return (
    <div>
      <Header />
      <WorkspaceList />
    </div>
  );
}
