import TeamChatRoom from "@/components/TeamChatRoom";
export default async function TeamChatPage({ params }) {
  const { teamId } = await params;
  return <TeamChatRoom postId={teamId}/>;
}
