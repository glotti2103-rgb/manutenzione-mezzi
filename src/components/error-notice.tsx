type Props = {
  title?: string;
  description?: string;
};

export function ErrorNotice({
  title = "Qualcosa è andato storto",
  description,
}: Props) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
    >
      <p className="font-medium">{title}</p>
      {description && <p className="mt-0.5">{description}</p>}
    </div>
  );
}
