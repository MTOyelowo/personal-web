import Header from "@/components/layout/header";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mt-4 lg:mt-8">{children}</main>
    </>
  );
}
