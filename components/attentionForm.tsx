interface AttentionFormProps {
  message?: string;
}

export const AttentionForm = ({ message }: AttentionFormProps) => {
  if (!message) return null;
  return (
    // bg-emerald-500/15
    <div className=" bg-orange-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-orange-500">
      {/* <CheckCircleIcon className="h-4 w-4" /> */}
      <p>{message}</p>
    </div>
  );
};
