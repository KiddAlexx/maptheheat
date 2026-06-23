interface ModerationSubmitterProps {
  username?: string | null;
  userId: string | null;
}

function ModerationSubmitter({ username, userId }: ModerationSubmitterProps) {
  return (
    <>
      <span>{username || userId || 'Deleted user'}</span>
      {username && userId ? (
        <span className="mt-0.5 block break-all font-mono text-xs text-app-muted">
          {userId}
        </span>
      ) : null}
    </>
  );
}

export default ModerationSubmitter;
