interface ModerationSubmitterProps {
  username?: string | null;
  userId: string;
}

function ModerationSubmitter({ username, userId }: ModerationSubmitterProps) {
  return (
    <>
      <span>{username || userId}</span>
      {username ? (
        <span className="mt-0.5 block break-all font-mono text-xs text-gray-500">
          {userId}
        </span>
      ) : null}
    </>
  );
}

export default ModerationSubmitter;
