import { useRef, useState } from "react";
import { X, Upload, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Dish } from "@/data/menuData";
import { uploadDishPhoto } from "@/hooks/useDishPhotos";
import { useAIPhotoGeneration } from "@/hooks/useAIPhotoGeneration";

interface PhotoUploadModalProps {
  dish: Dish;
  currentPhoto: string;
  onSave: (photoUrl: string, source: "upload" | "ai_generated") => Promise<void>;
  onClose: () => void;
}

export default function PhotoUploadModal({
  dish,
  currentPhoto,
  onSave,
  onClose,
}: PhotoUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(currentPhoto);
  const [pendingSource, setPendingSource] = useState<"upload" | "ai_generated">("upload");
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [styleHint, setStyleHint] = useState("");

  const { generate, generating, error: aiError } = useAIPhotoGeneration();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setPendingSource("upload");
    setSaveError(null);

    setUploading(true);
    try {
      const publicUrl = await uploadDishPhoto(dish.id, file);
      setPreview(publicUrl);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    setSaveError(null);
    try {
      const url = await generate(dish, styleHint || undefined);
      setPreview(url);
      setPendingSource("ai_generated");
    } catch {
      // error already set by hook
    }
  };

  const handleSave = async () => {
    if (!preview || preview === currentPhoto) {
      onClose();
      return;
    }
    setSaveError(null);
    try {
      await onSave(preview, pendingSource);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const isLoading = uploading || generating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-t-3xl bg-[#0f0f18] border border-border/40 p-5 pb-8 space-y-5 animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Фото блюда</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dish name */}
        <p className="text-xs text-muted-foreground -mt-3">{dish.nameEn}</p>

        {/* Preview */}
        <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-secondary/20 border border-border/30">
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Нет фото
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
          {pendingSource === "ai_generated" && !isLoading && preview !== currentPhoto && (
            <span className="absolute top-3 right-3 flex items-center gap-1 bg-primary/90 text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> AI
            </span>
          )}
        </div>

        {/* Upload button */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border/50 bg-secondary/30 text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Загрузить своё фото
          </button>
        </div>

        {/* AI section */}
        <div className="space-y-2">
          <input
            value={styleHint}
            onChange={(e) => setStyleHint(e.target.value)}
            placeholder="Описание стиля заведения (необязательно)"
            className="w-full bg-secondary/20 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary/10 border border-primary/30 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? "Генерирую..." : "Сгенерировать AI фото"}
          </button>
        </div>

        {/* Error */}
        {(saveError ?? aiError) && (
          <div className="flex items-center gap-2 text-destructive text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {saveError ?? aiError}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isLoading || preview === currentPhoto}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <CheckCircle className="w-4 h-4" />
          Сохранить фото
        </button>
      </div>
    </div>
  );
}
