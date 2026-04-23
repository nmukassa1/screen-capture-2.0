import { useFormContext } from "../context/FormContext";

export function ImagePreview() {
  const { formData } = useFormContext();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {formData.image ? (
        <img
          src={formData.image}
          alt="Captured screenshot"
          className="max-h-[170px] w-full object-cover"
        />
      ) : (
        <div className="text-muted-foreground bg-muted flex h-[170px] w-full items-center justify-center text-sm">
          No Screenshot Available
        </div>
      )}
    </div>
  );
}