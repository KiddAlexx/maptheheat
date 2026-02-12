// Third party imports
import { ColorRing } from 'react-loader-spinner';

interface LoaderSpinnerProps {
  message: string;
}

function LoaderSpinner({ message }: LoaderSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={message}
      aria-live="polite"
      aria-busy="true"
      className="flex h-full w-full items-center justify-center "
    >
      <ColorRing
        visible={true}
        height="80"
        width="80"
        wrapperStyle={{}}
        wrapperClass="blocks-wrapper"
        colors={['#176D3B', '#59C469', '#f25e1d', '#FF6978', '#FFACA4']}
      />
      <span className="sr-only">{message}</span>
    </div>
  );
}

export default LoaderSpinner;
