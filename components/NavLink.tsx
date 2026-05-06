"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NavLinkProps extends Omit<LinkProps, "href"> {
    href: string;
    className?: string;
    activeClassName?: string;
    end?: boolean;
    children?: ReactNode;
}

const normalizePath = (path: string) => {
    const cleaned = path.replace(/\/+$/, "");
    return cleaned.length ? cleaned : "/";
};

export function NavLink({
    href,
    className,
    activeClassName,
    end,
    children,
    ...props
}: NavLinkProps) {
    const pathname = usePathname();
    const current = normalizePath(pathname ?? "/");
    const target = normalizePath(href);
    const isActive = end ? current === target : current === target || current.startsWith(`${target}/`);

    return (
        <Link
            href={href}
            className={cn(className, isActive && activeClassName)}
            aria-current={isActive ? "page" : undefined}
            {...props}
        >
            {children}
        </Link>
    );
}
