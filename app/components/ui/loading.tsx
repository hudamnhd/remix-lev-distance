import React from "react";
interface LoadingSpinnerProps {
  showSpinner?: boolean;
  size?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  showSpinner = true,
  size,
  color,
}) => {
  return (
    <div
      style={{
        transition: "height 0.3s ease-in-out",
      }}
      className={`transition-opacity ${showSpinner ? "opacity-100" : "opacity-0"}`}
    >
      <svg
        className="animate-spin"
        width={size ?? 40}
        height={size ?? 40}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx={12}
          cy={12}
          r={10}
          stroke="currentColor"
          strokeWidth={4}
        />
        <title>Spinner</title>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

type SpinnerProps = {
  size?: number;
  color?: string;
};

export const Spinner: React.FC<SpinnerProps> = ({ size, color }) => {
  return (
    <div
      style={{
        transition: "height 0.3s ease-in-out",
      }}
    >
      <svg
        className="animate-spin motion-reduce:hidden"
        width={size ?? 40}
        height={size ?? 40}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-100"
          cx={12}
          cy={12}
          r={10}
          stroke="#ddd"
          strokeWidth={4}
        />
        <title>Spinner</title>
        <path
          className="opacity-100"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

interface SpinnerFullProps {
  size?: number;
  color?: string;
}

export const SpinnerFull: React.FC<SpinnerFullProps> = ({
  size = 24,
  color,
}) => {
  const spinnerProps = { color, size };
  return (
    <div className="absolute h-full w-full flex items-center justify-center bottom-0 left-1/2 transform -translate-x-1/2  z-20 backdrop-blur-[2px] rounded-xl">
      <Spinner {...spinnerProps} />
      <span className="ml-2 text-sm">Loading...</span>
    </div>
  );
};
