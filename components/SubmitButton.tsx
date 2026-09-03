import React from "react";

interface SubmitButtonProps {
  isLoading: boolean;
  text: string;
  loadingText?: string;
  className?: string;
}
export default function SubmitButton({
  isLoading,
  text,
  loadingText = "Guardando...",
  className = "w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium text-sm rounded-lg py-2.5 px-4",
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
}
