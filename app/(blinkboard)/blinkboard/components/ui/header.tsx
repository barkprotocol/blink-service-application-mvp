'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, Users, Coins, Settings, LogOut, Search, Moon, Sun, Globe } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WalletButton } from '@/components/ui/wallet-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from 'next-themes'

interface HeaderProps {
  onMenuClick: () => void
  isMobileMenuOpen: boolean
}

export function Header({ onMenuClick, isMobileMenuOpen }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const navItems = [
    { name: 'Blinkboard', href: '/blinkboard' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Governance', href: '/governance' },
    { name: 'About', href: '/about' },
  ]

  const getBreadcrumbs = useCallback(() => {
    const paths = pathname.split('/').filter(Boolean)
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`
      return { name: path.charAt(0).toUpperCase() + path.slice(1), href }
    })
  }, [pathname])

  const breadcrumbs = getBreadcrumbs()

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => !prev)
  }, [])

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="h-6 w-6 text-[#D0BFB4]" />
          </Button>
          <nav className="hidden md:flex items-center justify-center flex-grow">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 px-4 py-2 rounded-md ${
                  pathname === item.href ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isSearchOpen ? (
              <Input
                type="search"
                placeholder="Search..."
                className="w-full sm:w-64"
                onBlur={toggleSearch}
                autoFocus
              />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                aria-label="Open search"
              >
                <Search className="h-5 w-5 text-[#D0BFB4]" />
              </Button>
            )}
            <WalletButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5 text-[#D0BFB4]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>New Blink received</DropdownMenuItem>
                <DropdownMenuItem>Blink sold on marketplace</DropdownMenuItem>
                <DropdownMenuItem>Staking rewards available</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Theme and Language">
                  {theme === 'dark' ? <Moon className="h-5 w-5 text-[#D0BFB4]" /> : <Sun className="h-5 w-5 text-[#D0BFB4]" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Español</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="https://ucarecdn.com/f242e5dc-8813-47b4-af80-6e6dd43945a9/barkicon.png" alt="@bark_protocol" />
                  <AvatarFallback>BP</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4 text-[#D0BFB4]" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Coins className="mr-2 h-4 w-4 text-[#D0BFB4]" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4 text-[#D0BFB4]" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4 text-[#D0BFB4]" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {breadcrumbs.length > 1 && (
          <nav aria-label="Breadcrumb" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <ol className="list-none p-0 inline-flex">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  <Link href={crumb.href} className="hover:text-gray-700 dark:hover:text-gray-200">
                    {crumb.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </header>
  )
}