"use client";

import { FC, JSX, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiPlus, FiX, FiImage } from "react-icons/fi";
import { useUpdateDailyWord } from "@/hooks/query/useAdmin";
import ImagePickerModal from "@/components/common/image-picker-modal";
import Spinner from "@/components/ui/spinner";
import toast from "react-hot-toast";
import axios from "axios";

const EditDailyWordPage: FC = (): JSX.Element => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const updateMutation = useUpdateDailyWord();

  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [source, setSource] = useState("");
  const [commentary, setCommentary] = useState("");
  const [backgrounds, setBackgrounds] = useState<
    Array<{ src: string; alt: string }>
  >([]);
  const [newBgUrl, setNewBgUrl] = useState("");
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const fetchDailyWord = async () => {
      try {
        const res = await axios.get(`/api/daily-words/${id}`);
        if (res.data.success) {
          const dw = res.data.data;
          // Format date for input[type=date]
          const d = new Date(dw.date);
          setDate(d.toISOString().split("T")[0]);
          setText(dw.text);
          setAuthor(dw.author || "");
          setSource(dw.source || "");
          setCommentary(dw.commentary || "");
          setBackgrounds(
            dw.backgrounds?.map((bg: { src: string; alt: string }) => ({
              src: bg.src,
              alt: bg.alt,
            })) || [],
          );
        }
      } catch {
        toast.error("Failed to load daily word");
        router.push("/admin/daily-words");
      } finally {
        setLoading(false);
      }
    };
    fetchDailyWord();
  }, [id, router]);

  const addBackground = (src?: string) => {
    const url = src || newBgUrl.trim();
    if (!url) return;
    setBackgrounds((prev) => [...prev, { src: url, alt: "" }]);
    if (!src) setNewBgUrl("");
  };

  const removeBackground = (index: number) => {
    setBackgrounds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !text) {
      toast.error("Date and quote text are required");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        date,
        text,
        author: author || undefined,
        source: source || undefined,
        commentary: commentary || undefined,
        backgrounds: backgrounds,
      });
      toast.success("Daily word updated!");
      router.push("/admin/daily-words");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update daily word";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/daily-words"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <FiArrowLeft size={14} />
          Back to Daily Words
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Daily Word</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Quote Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Quote Text <span className="text-red-500">*</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Author
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Source
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. The Prophet, Letter to a Young Poet"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Commentary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Commentary
          </label>
          <textarea
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            placeholder="Optional commentary"
            rows={4}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          />
        </div>

        {/* Backgrounds */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Background Images
          </label>

          {backgrounds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {backgrounds.map((bg, i) => (
                <div
                  key={i}
                  className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bg.src}
                    alt={bg.alt || `Background ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeBackground(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowGallery(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <FiImage size={16} />
              Browse Gallery
            </button>
            <input
              type="url"
              value={newBgUrl}
              onChange={(e) => setNewBgUrl(e.target.value)}
              placeholder="or paste image URL..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addBackground();
                }
              }}
            />
            <button
              type="button"
              onClick={() => addBackground()}
              disabled={!newBgUrl.trim()}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <FiPlus size={16} />
            </button>
          </div>

          <ImagePickerModal
            visible={showGallery}
            onClose={() => setShowGallery(false)}
            onSelect={(src) => addBackground(src)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <FiSave size={16} />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/admin/daily-words"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditDailyWordPage;
