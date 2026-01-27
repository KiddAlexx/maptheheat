// Third party imports
import { ColorRing } from 'react-loader-spinner';

interface LoaderSpinnerProps {
  message: string;
}

function LoaderSpinner({ message }: LoaderSpinnerProps) {
  return (
    <div
      role="status"
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
        colors={['#2b6027', '#53b84c', '#d46326', '#fd7350', '#f18d74']}
      />
      <span className="sr-only">{message}</span>
    </div>
  );
}

export default LoaderSpinner;
