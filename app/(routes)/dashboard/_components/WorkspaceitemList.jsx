import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useRouter } from "next/navigation";
import React from "react";
import Image from 'next/image';

function WorkspaceItemList({workspaceList}) {
  const router = useRouter();

  const OnClickWorkspaceItem = async (workspaceId) => {
    // Fetch the first document for this workspace
    const q = query(
      collection(db, "workspaceDocuments"),
      where("workspaceId", "==", workspaceId)
    );
    const querySnapshot = await getDocs(q);
    let firstDocId = null;
    querySnapshot.forEach((doc) => {
      if (!firstDocId) firstDocId = doc.data().id;
    });

    if (firstDocId) {
      router.push(`/workspace/${workspaceId}/${firstDocId}`);
    } else {
      // Optionally, handle the case where there are no documents
      router.push(`/workspace/${workspaceId}`);
    }
  };

  return (
    <div className='grid grid-cols-2 gap-6 mt-6 md:grid-cols-3 lg:grid-cols-4'>
      {workspaceList && workspaceList.map((workspace, index) => (
        <div key={index} className='transition-all border shadow-xl cursor-pointer rounded-xl hover:scale-105'
          onClick={() => OnClickWorkspaceItem(workspace.id)}
        >
          <Image src={workspace?.coverImage && workspace?.coverImage.startsWith('/Assets/') ? workspace?.coverImage : `/Assets/coverImages/${workspace?.coverImage}`}
            width={400} height={200} alt='cover'
            className='h-[150px] object-cover rounded-t-xl'
          />
          <div className='p-4 rounded-b-xl'>
            <h2 className='flex gap-2'>{workspace?.emoji} {workspace.workspaceName}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}

export default WorkspaceItemList;
