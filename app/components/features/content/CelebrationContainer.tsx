export function CelebrationContainer({
  celebrations,
}: {
  celebrations: Celebration[];
}) {
  return (
    <div className="mt-4 flex w-full flex-col space-y-2 text-xs opacity-50">
      {celebrations.map((celebration) => (
        <div
          key={celebration.id}
          title={celebration.title}
          className="w-full overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {celebration.title}
        </div>
      ))}
    </div>
  );
}
