import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { EditorWorkspace } from "@/components/EditorWorkspace";
import { authOptions } from "@/lib/auth";

export default async function EditorPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  return <EditorWorkspace />;
}
