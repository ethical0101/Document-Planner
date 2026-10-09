import DocumentEditorSection from "../../_components/DocumentEditorSection";

export default async function WorkspaceDocumentPage({ params }) {
  const { workspaceid, documentid } = await params;
  return (
    <DocumentEditorSection
      key={documentid}
      workspaceId={workspaceid}
      documentId={documentid}
    />
  );
}
