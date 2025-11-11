"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HiOutlineHome,
    HiOutlineDocumentText,
    HiOutlineGift,
    HiOutlineUserGroup,
    HiOutlineUser,
    HiOutlineUsers,
    HiOutlineCog
} from "react-icons/hi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useState, useEffect } from "react";
import { HiOutlineWallet } from "react-icons/hi2";

interface SidebarItem {
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: SidebarItem[];
}

// Define sidebar items outside component to avoid dependency issues
const getSidebarItems = (): SidebarItem[] => [
    {
        label: "Tổng quan",
        icon: <HiOutlineHome className="text-[20px]" />,
        href: "/my/wallet/overview"
    },
    {
        label: "Tài sản",
        icon: <HiOutlineWallet className="text-[20px]" />,
        children: [
            {
                label: "Tổng quan",
                icon: null,
                href: "/my/wallet/overview"
            },
            {
                label: "Giao ngay",
                icon: null,
                href: "/my/wallet/spot"
            },
        ]
    },
    {
        label: "Lệnh",
        icon: <HiOutlineDocumentText className="text-[20px]" />,
        children: [
            {
                label: "lịch sử tài sản",
                icon: null,
                href: "/my/wallet/history/overview"
            },
            {
                label: "lệnh spot",
                icon: null,
                href: "/my/orders/exchange"
            },
        ],
        href: "#"
    },
    {
        label: "Trạm phần thưởng",
        icon: <HiOutlineGift className="text-[20px]" />,
        href: "#"
    },
    {
        label: "Giới thiệu",
        icon: <HiOutlineUserGroup className="text-[20px]" />,
        href: "#"
    },
    {
        label: "Tài khoản",
        icon: <HiOutlineUser className="text-[20px]" />,
        href: "#"
    },
    {
        label: "Tài khoản phụ",
        icon: <HiOutlineUsers className="text-[20px]" />,
        href: "#"
    },
    {
        label: "Cài đặt",
        icon: <HiOutlineCog className="text-[20px]" />,
        href: "#"
    }
];

export default function WalletSidebar() {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpand = (key: string) => {
        setExpandedItems(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(key)) {
                newExpanded.delete(key);
            } else {
                newExpanded.add(key);
            }
            return newExpanded;
        });
    };

    const isActive = (href?: string) => {
        if (!href || href === "#") return false;
        return pathname === href;
    };

    // Auto-expand parent items if any child is active
    useEffect(() => {
        const sidebarItems = getSidebarItems();
        const newExpanded = new Set<string>();

        sidebarItems.forEach(item => {
            if (item.children && item.children.length > 0) {
                const itemKey = item.label.toLowerCase().replace(/\s+/g, "");
                const hasActiveChild = item.children.some(child => {
                    const childHref = child.href;
                    return childHref && childHref !== "#" && pathname === childHref;
                });
                if (hasActiveChild) {
                    newExpanded.add(itemKey);
                }
            }
        });

        if (newExpanded.size > 0) {
            setExpandedItems(prev => {
                // Merge with existing expanded items
                const merged = new Set(prev);
                newExpanded.forEach(key => merged.add(key));
                return merged;
            });
        }
    }, [pathname]);

    const sidebarItems = getSidebarItems();

    const renderItem = (item: SidebarItem, level: number = 0, parentKey?: string) => {
        const hasChildren = item.children && item.children.length > 0;
        const itemKey = parentKey ? `${parentKey}-${item.label}` : item.label.toLowerCase().replace(/\s+/g, "");
        const isExpanded = expandedItems.has(itemKey);
        // Chỉ check active cho item hiện tại, không check cho children
        const itemActive = isActive(item.href);

        return (
            <div key={item.label}>
                {hasChildren ? (
                    <>
                        <button
                            onClick={() => toggleExpand(itemKey)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-[16px] dark:text-[#6B7585] text-black dark:hover:text-white transition-colors`}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span>{item.label}</span>
                            </div>
                            {isExpanded ? (
                                <IoIosArrowUp className="text-[16px]" />
                            ) : (
                                <IoIosArrowDown className="text-[16px]" />
                            )}
                        </button>
                        {isExpanded && (
                            <div>
                                {item.children?.map((child) => renderItem(child, level + 1, itemKey))}
                            </div>
                        )}
                    </>
                ) : (
                    <Link
                        href={item.href || "#"}
                        className={`relative flex items-center gap-3 px-4 py-3 text-[16px] transition-colors ${itemActive
                            ? "dark:bg-[#29313D] bg-gray-300 dark:text-white text-black font-medium"
                            : "dark:text-[#6B7585] text-gray-600 dark:hover:text-white hover:text-black"
                            } ${level > 0 ? "pl-12" : ""}`}
                    >
                        {itemActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        )}
                        <span>
                            {item.label}
                        </span>
                    </Link>
                )}
            </div>
        );
    };

    return (
        <div className="w-64 dark:bg-[#181A20] bg-white min-h-screen shrink-0">
            <div className="py-4">
                {sidebarItems.map((item) => renderItem(item, 0))}
            </div>
        </div>
    );
}

