"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";

import type { VendorMenuItemInput } from "@/lib/core/server";
import type { MenuItem } from "@/lib/types/menu";

type MenuForm = {
  itemName: string;
  category: string;
  description: string;
  price: string;
  location: string;
  images: string[];
};

const EMPTY_FORM: MenuForm = {
  itemName: "",
  category: "",
  description: "",
  price: "",
  location: "",
  images: [],
};

function formFromItem(item?: MenuItem): MenuForm {
  if (!item) return { ...EMPTY_FORM };
  return {
    itemName: item.itemName ?? item.name ?? "",
    category: item.category,
    description: item.description,
    price: String(item.price),
    location: item.location ?? "",
    images: item.images ?? (item.image ? [item.image] : []),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function VendorMenuItemForm({
  item,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  item?: MenuItem;
  submitLabel: string;
  onSubmit: (input: VendorMenuItemInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<MenuForm>(() => formFromItem(item));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  async function uploadImages(files: File[]) {
    if (files.length === 0) return;

    setIsUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const body = new FormData();
        body.set("image", file);
        const response = await fetch("/api/images/upload", {
          method: "POST",
          body,
        });
        const payload: unknown = await response.json();
        if (!response.ok) {
          const message =
            isRecord(payload) && typeof payload.error === "string"
              ? payload.error
              : `Image upload failed (${response.status}).`;
          throw new Error(message);
        }
        if (!isRecord(payload) || typeof payload.url !== "string") {
          throw new Error("Image upload returned an invalid response.");
        }
        uploadedUrls.push(payload.url);
      }

      setForm((current) => ({
        ...current,
        images: [...current.images, ...uploadedUrls],
      }));
      toast.success(
        uploadedUrls.length === 1
          ? "Image uploaded."
          : `${uploadedUrls.length} images uploaded.`,
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not upload images.",
      );
    } finally {
      setIsUploadingImages(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a valid price greater than zero.");
      return;
    }
    if (form.images.length === 0) {
      toast.error("Upload at least one menu item image.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        itemName: form.itemName.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price,
        location: form.location.trim(),
        images: form.images,
      });
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not save menu item.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-[#111315] p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-white/70">
          Item name
          <input
            required
            value={form.itemName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                itemName: event.target.value,
              }))
            }
            className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 text-white outline-none focus:border-emerald-500"
          />
        </label>
        <label className="text-sm text-white/70">
          Category
          <input
            required
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 text-white outline-none focus:border-emerald-500"
          />
        </label>
        <label className="text-sm text-white/70">
          Price
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                price: event.target.value,
              }))
            }
            className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 text-white outline-none focus:border-emerald-500"
          />
        </label>
        <label className="text-sm text-white/70">
          Location
          <input
            required
            value={form.location}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                location: event.target.value,
              }))
            }
            className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 text-white outline-none focus:border-emerald-500"
          />
        </label>
        <label className="text-sm text-white/70 sm:col-span-2">
          Description
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </label>
        <div className="sm:col-span-2">
          <label className="text-sm text-white/70">
            Menu images (ImgBB)
            <span className="mt-2 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-[#090a0b] px-3 py-3 text-sm text-white/60 transition hover:border-emerald-400/50 hover:text-white">
              {isUploadingImages ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={17}
                />
              ) : (
                <ImagePlus aria-hidden="true" size={17} />
              )}
              {isUploadingImages ? "Uploading..." : "Choose images"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                disabled={isUploadingImages}
                onChange={(event) => {
                  const files = Array.from(event.currentTarget.files ?? []);
                  event.currentTarget.value = "";
                  void uploadImages(files);
                }}
                className="sr-only"
              />
            </span>
          </label>
          {form.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {form.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative size-20 overflow-hidden rounded-lg border border-white/10"
                >
                  <Image
                    src={image}
                    alt={`Menu item image ${index + 1}`}
                    fill
                    sizes="80px"
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        images: current.images.filter(
                          (_, imageIndex) => imageIndex !== index,
                        ),
                      }))
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/75 p-1 text-white hover:bg-red-600"
                  >
                    <X aria-hidden="true" size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/5"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving || isUploadingImages}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving && (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={16}
            />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
