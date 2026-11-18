"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Star, X } from "lucide-react";
import { uploadProductImage } from "@/app/admin/actions";
import { ProductImage } from "@/components/site/ProductImage";

const MAX_IMAGES = 8;
const MAX_SIDE = 1600;

/** Redimensiona e converte para WebP no navegador antes do envio (imagens mais leves = site mais rápido). */
async function compress(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Arquivo não é uma imagem");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  return blob && blob.size < file.size ? blob : file;
}

export function ImageManager({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const room = MAX_IMAGES - value.length;
    const list = Array.from(files).slice(0, room);
    if (list.length < files.length) setError(`Limite de ${MAX_IMAGES} imagens por produto.`);
    setUploading(list.length);
    const uploaded: string[] = [];
    for (const file of list) {
      try {
        if (file.size > 15 * 1024 * 1024) throw new Error(`${file.name}: arquivo muito grande (máx. 15 MB)`);
        const blob = await compress(file);
        const fd = new FormData();
        fd.append("file", new File([blob], file.name, { type: blob.type || file.type }));
        const res = await uploadProductImage(fd);
        if (!res.ok) throw new Error(res.error);
        uploaded.push(res.url);
      } catch (e) {
        setError(e instanceof Error ? `Falha no envio: ${e.message}` : "Falha no envio da imagem");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function addUrl() {
    const v = url.trim();
    if (!v) return;
    try {
      const u = new URL(v);
      if (u.protocol !== "https:") throw new Error();
    } catch {
      setError("Informe um endereço de imagem válido começando com https://");
      return;
    }
    if (value.length >= MAX_IMAGES) return setError(`Limite de ${MAX_IMAGES} imagens por produto.`);
    if (value.includes(v)) return setError("Essa imagem já foi adicionada.");
    setError(null);
    onChange([...value, v]);
    setUrl("");
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((src, i) => (
          <li key={src} className="group relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-ink-200">
            <ProductImage src={src} alt={`Imagem ${i + 1}`} sizes="160px" className="p-2" />
            {i === 0 ? (
              <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                <Star className="h-3 w-3" /> Principal
              </span>
            ) : null}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md bg-white/95 p-1 shadow disabled:opacity-40" aria-label="Mover para a esquerda">
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onChange(value.filter((v) => v !== src))} className="rounded-md bg-red-600 p-1 text-white shadow" aria-label="Remover imagem">
                <X className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="rounded-md bg-white/95 p-1 shadow disabled:opacity-40" aria-label="Mover para a direita">
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
        {value.length < MAX_IMAGES ? (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading > 0}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-200 text-ink-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
            >
              {uploading > 0 ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
              <span className="text-xs font-semibold">{uploading > 0 ? "Enviando…" : "Enviar fotos"}</span>
            </button>
          </li>
        ) : null}
      </ul>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Endereço da imagem</span>
          <Link2 className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-400" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="…ou cole o endereço (https://) de uma imagem"
            className="input pl-9"
          />
        </label>
        <button type="button" onClick={addUrl} className="btn-ghost">Adicionar</button>
      </div>
      <p className="text-xs text-ink-400">A primeira imagem é a principal. As fotos enviadas são otimizadas automaticamente (WebP, até 1600 px).</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
