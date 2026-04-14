import clsx from 'clsx';

type BackgroundBlobsProps = {
  className?: string;
};

function BackgroundBlobs({ className }: BackgroundBlobsProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        'pointer-events-none absolute inset-0 overflow-hidden ',
        className
      )}
    >
      <div className="absolute -left-14 -top-20 h-72 w-72 rounded-full bg-primary-300/25 blur-3xl md:h-96 md:w-96" />
      <div className="absolute right-[-80px] top-[22%] h-64 w-64 rounded-full bg-danger-300/20 blur-3xl md:h-80 md:w-80" />
      <div className="absolute bottom-[-120px] left-[18%] h-72 w-72 rounded-full bg-primary-200/20 blur-3xl md:h-[26rem] md:w-[26rem]" />
      <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,rgb(15_23_42)_1px,transparent_0)] [background-size:22px_22px]" />
    </div>
  );
}

export default BackgroundBlobs;
