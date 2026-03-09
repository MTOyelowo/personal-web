import AboutSectionNav from "@/components/about/about-section-nav";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AboutSectionNav />
      {children}
    </>
  );
}
