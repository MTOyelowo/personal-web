import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-muted-foreground mb-4">Post not found.</p>
      <Link href="/" className="text-sm text-foreground underline">
        Back to Home
      </Link>
    </div>
  );
}
