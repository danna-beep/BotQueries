// src/components/Layout/Layout.tsx
import { Outlet } from 'react-router-dom'
import { useTranslation } from '@/hooks'
import NavigationMenu from '../NavigationMenu'
import type { NavItem } from '../NavigationMenu'
import ConnectionProvider from '../ConnectionProvider'

const Layout = () => {
  const { t } = useTranslation()

  const navItems: NavItem[] = [
    { label: t('navigation.workspace'), href: '/' },
    { label: t('navigation.dashboard'), href: '/dashboard' },
    { label: t('navigation.nocode'), href: '/nocode' },
  ]

  return (
    <div className='flex h-screen flex-col overflow-hidden'>
      <NavigationMenu items={navItems} />
      <ConnectionProvider>
        <main className='min-h-0 flex-1 overflow-y-auto'>
          <Outlet />
        </main>
      </ConnectionProvider>
    </div>
  )
}

export default Layout
