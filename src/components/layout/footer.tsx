"use client";

import Link from "next/link";

import { useLocalization } from "@/localization";

const links = [
  { href: "/background-remover", labelKey: "footer.backgroundRemover" },
  { href: "/converter", labelKey: "footer.converter" },
  { href: "/ai-generator", labelKey: "footer.aiGenerator" },
] as const;

export function Footer() {
  const { t } = useLocalization();

  return (
    <footer className="border-t border-(--color-app-border) py-12">
      <div className="app-container grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-xl font-semibold">PhotoTools</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-(--color-app-text-secondary)">
            {t("footer.description")}
          </p>
        </div>
        <nav className="grid gap-3 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring w-fit rounded-(--radius-button) text-(--color-app-text-secondary) transition-colors hover:text-(--color-app-text)"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
