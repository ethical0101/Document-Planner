import { StickyNote } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import DocumentOptions from "./DocumentOptions";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { toast } from "@/hooks/use-toast";

function DocumentList({ documentList, params }) {
    const router = useRouter();

    const DeleteDocument = async (docId)=>{
        await deleteDoc(doc(db, "workspaceDocuments", docId));
    }
    console.log("DocumentLIst params",params);
    console.log(documentList);
    return (
        <div>
            {documentList.map((doc, index) => {
                return (
                    <div
                        key={index}
                        onClick={() => {
                            // Navigate to the document's workspace and ID
                            router.push('/workspace/' + params?.workspaceid + '/' + doc?.id);
                        }}
                    >
                        <div
                            className={`relative flex justify-between items-center gap-3 p-2 px-3 mt-3 rounded-lg cursor-pointer hover:bg-gray-200
                                ${doc?.id == params?.documentid && 'bg-white'}
                            `}
                        >
                        <div className='flex items-center gap-2'>
                            {/* Render StickyNote icon if no Emoji is present */}
                            {!doc.emoji && <StickyNote className="w-[20px] h-[20px]" />}
                            <h2 className="flex gap-2">
                                {doc?.emoji} {doc.documentName}
                            </h2>
                            <DocumentOptions className="mt-5" doc={doc} deleteDocument={(docId)=>DeleteDocument(docId)}/>
                        </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default DocumentList;
