"use client";

import { FC, JSX, useEffect, useRef, useState } from "react";
import Logo from "../ui/logo";
import ThemeToggle from "../ui/theme-toggle";
import { FiSearch, FiMenu, FiX, FiLogOut, FiGrid } from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useScrollDirection } from "@/hooks/common/useScrollDirection";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "Tags", href: "/tags" },
  { name: "About", href: "/about" },
];

const Header: FC = (): JSX.Element => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { isVisible } = useScrollDirection({ threshold: 10, hideDelay: 3000 });

  const isAuth = status === "authenticated";
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  const toggleMenu = () => {
    if (isMobileSearchOpen) setIsMobileSearchOpen(false);
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    document.body.style.overflow = newState ? "hidden" : "auto";
  };

  const toggleSearch = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleMobileSearch = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    // TODO: Implement search functionality
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
        document.body.style.overflow = "auto";
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto"; // Cleanup on unmount
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 flex w-full h-[57px] items-center justify-between px-[25px] font-space-grotesk bg-background border-b border-border transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Left: Logo */}
      <div className="flex items-center">
        <Logo />
      </div>

      {/* Center: Nav links for larger screens */}
      <ul className="hidden lg:flex gap-[31px] items-center justify-center">
        {navLinks.map((item, index) => (
          <li
            key={index}
            className={`text-foreground font-libre ${
              pathname === item.href ? "font-bold" : "font-normal"
            }`}
          >
            <Link href={item.href}>{item.name}</Link>
          </li>
        ))}
      </ul>

      {/* Right: Search - Login - Profile for larger screens, Hamburger for mobile */}
      <div className="flex gap-[21px] items-center">
        {/* Search and Login for desktop */}
        <div className="hidden lg:flex gap-8 items-center">
          <ThemeToggle />
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              className={`w-[363px] bg-background border-2 border-border transition h-[46px] px-6 rounded-[10px] left-0 top-[31px] ${
                isSearchOpen ? "block" : "hidden"
              } `}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button onClick={isSearchOpen ? handleSearch : toggleSearch}>
                <FiSearch size={20} />
              </button>
            </div>
          </div>

          {/* Auth: Login button or Profile dropdown */}
          {isAuth ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "Profile"}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-sm font-medium">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-lg shadow-lg border border-border py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/admin");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <FiGrid size={15} />
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <FiLogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
              className="border-2 border-border w-[135px] h-[46px] rounded-[10px] flex items-center justify-center text-sm font-medium hover:bg-muted transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {/* Hamburger menu and search for smaller screens */}
        <div className="flex lg:hidden gap-[21px] items-center">
          <button onClick={toggleMobileSearch}>
            <FiSearch size={20} className="font-bold" />
          </button>
          <ThemeToggle />
          <button onClick={toggleMenu}>
            {isMenuOpen ? (
              <FiX size={20} className="transition ease-in-out" />
            ) : (
              <FiMenu size={20} className="transition ease-in-out" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-[60px] left-0 w-full bg-background z-50 transition ease-in-out border-b border-border">
          <ul className="flex flex-col items-center gap-4 py-4">
            {navLinks.map((item, index) => (
              <li
                key={index}
                className={`text-foreground font-libre ${
                  pathname === item.href ? "font-bold" : "font-normal"
                }`}
              >
                <Link href={item.href} onClick={toggleMenu}>
                  {item.name}
                </Link>
              </li>
            ))}
            {isAuth ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={toggleMenu}
                    className="text-foreground font-libre font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  className="border-2 border-red-400 dark:border-red-500 text-red-600 dark:text-red-400 w-[135px] h-[46px] rounded-[10px] mt-2 text-sm font-medium"
                  onClick={() => {
                    toggleMenu();
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                className="border-2 border-border w-[135px] h-[46px] rounded-[10px] mt-4 flex items-center justify-center text-sm font-medium"
                onClick={toggleMenu}
              >
                Login
              </Link>
            )}
          </ul>
        </div>
      )}
      {/* Mobile search overlay */}
      {isMobileSearchOpen && (
        <div className="absolute lg:hidden left-0 w-full h-60 pt-10 bg-background z-50 flex items-center justify-center border-b border-border">
          <div className="block relative p-5 w-full">
            <div className="flex justify-end mb-10">
              <button onClick={toggleMobileSearch}>
                <FiX size={20} className="" />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-background outline-none border border-border transition h-10 lg:h-11 px-6 rounded-[5px] left-0 top-[31px] mt-1.5 hover:ring-1 ring-foreground focus:ring-1 focus:ring-foreground block"
              />

              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FiSearch size={20} />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
