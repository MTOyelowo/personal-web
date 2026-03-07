import Header from "@/components/layout/header";
import ScrollingSecondaryNav from "@/components/layout/scrolling-secondary-nav";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <ScrollingSecondaryNav />
      <main className="mt-4 lg:mt-8">{children}</main>
    </>
  );
}
