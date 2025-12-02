"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  CubeTransparentIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Bolt, Cog, SparkleIcon, TruckIcon, User, Wrench } from "lucide-react";

const products = [
  { name: "Trucks", href: "/browse/trucks", icon: TruckIcon },
  { name: "Equipment", href: "/browse/equipment", icon: Wrench },
  { name: "Units", href: "/browse/units", icon: Cog },
  { name: "Engine", href: "/browse/engine", icon: Bolt },
  {
    name: "Parts & Accessories",
    href: "/browse/parts-accessories",
    icon: CubeTransparentIcon,
  },
];

export default function NavbarDefault() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [disclosureOpen, setDisclosureOpen] = useState(false);
  const disclosureRef = useRef<HTMLDivElement>(null);

  // Detect outside clicks ANYWHERE on the document
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        disclosureOpen &&
        disclosureRef.current &&
        !disclosureRef.current.contains(event.target as Node)
      ) {
        setDisclosureOpen(false);
      }
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setDisclosureOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [disclosureOpen]);

  return (
    <header className="bg-emerald-600 select-none">
      <nav className="mx-auto flex max-w-11/12 items-center justify-between px-6 py-3 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <img
              alt=""
              src="/images/SR5MoreMinimal.png"
              className="h-12 w-auto"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 p-2.5 text-white"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop Nav */}
        <PopoverGroup className="hidden lg:flex flex-row items-center lg:gap-x-12">
          <Link href="/" className="text-sm font-semibold text-white">
            Home
          </Link>
          <Link
            href="/browse/trucks"
            className="text-sm font-semibold text-white"
          >
            Products
          </Link>
          <Link href="/services" className="text-sm font-semibold text-white">
            Services
          </Link>
          {/* <Link
            href="/transactions"
            className="text-sm font-semibold text-white"
          >
            Transactions
          </Link> */}
          {/* <Link href="/feedback" className="text-sm font-semibold text-white">
            Feedback
          </Link> */}
          <Link href="/schedule" className="text-sm font-semibold text-white">
            Schedule
          </Link>
          <Link href="/cart" className="text-sm font-semibold text-white">
            <ShoppingCartIcon className="size-6 " />
          </Link>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Transactions"
                labelIcon={<ArrowTrendingUpIcon />}
                href="/transactions"
              />
              <UserButton.Link
                label="Appointments"
                labelIcon={<CalendarIcon />}
                href="/appointments"
              />
              <UserButton.Link
                label="Feedback"
                labelIcon={<EyeIcon />}
                href="/feedback"
              />
            </UserButton.MenuItems>
          </UserButton>
        </PopoverGroup>
      </nav>

      {/* Mobile Menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-sm bg-emerald-900 p-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <a href="/" className="-m-1.5 p-1.5">
              <img
                alt=""
                src="/images/SR5MoreMinimal.png"
                className="h-8 w-auto"
              />
            </a>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-400"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link 
                  href="/" 
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-emerald-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/browse/trucks"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-emerald-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  href="/services" 
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-emerald-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link 
                  href="/schedule" 
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-emerald-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Schedule
                </Link>
                <Link 
                  href="/transactions" 
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-emerald-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Transactions
                </Link>
                <Link 
                  href="/appointments" 
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-emerald-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Appointments
                </Link>
                <Link 
                  href="/feedback" 
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-emerald-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Feedback
                </Link>
                <Link 
                  href="/cart" 
                  className="-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-emerald-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  Cart
                </Link>
              </div>
              <div className="py-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Account</span>
                  <UserButton />
                </div>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
