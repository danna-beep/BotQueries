// src/components/Layout/Layout.tsx
import { Outlet } from 'react-router-dom'
import { useTranslation } from '@/hooks'
import NavigationMenu from '../NavigationMenu'
import type { NavItem } from '../NavigationMenu'

const Layout = () => {
  const { t } = useTranslation()

  const navItems: NavItem[] = [
    { label: t('navigation.home'), href: '/' },
    { label: t('navigation.other'), href: '/other/1' },
  ]

  return (
    <div className='min-h-screen flex flex-col'>
      <NavigationMenu items={navItems} />
      <main className='flex-1'>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
