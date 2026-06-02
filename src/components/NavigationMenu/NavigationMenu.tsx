import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '@/hooks'
import { Button } from '@getvaas/viplay-ui'
import { Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons'
import UserMenu from '../UserMenu'

export interface NavItem {
  label: string
  href: string
}

export interface NavigationMenuProps {
  items: NavItem[]
  appName?: string
}

const NavigationMenu = ({ items, appName = 'Vaas' }: NavigationMenuProps) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const location = useLocation()

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <>
      <header className='bg-transparent border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30'>
        <Button
          variant='primary-white'
          onClick={() => setOpen(true)}
          className='bg-transparent border-none pl-0 hover:bg-transparent active:bg-transparent'
          aria-label={t('navigation.openMenu')}
          aria-expanded={open}
          aria-controls='mobile-menu'
        >
          <HamburgerMenuIcon style={{ width: '2rem', height: '2rem' }} className='text-white' />
        </Button>

        <img src='/favicon.png' alt={appName} className='h-8 w-8' />
      </header>

      {/* Overlay */}
      <div
        onClick={close}
        className='fixed inset-0 bg-black/40 transition-opacity duration-300'
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          zIndex: 40,
        }}
        aria-hidden='true'
      />

      {/* Drawer */}
      <div
        id='mobile-menu'
        role='dialog'
        aria-modal='true'
        aria-label={t('navigation.menu')}
        className='fixed top-0 left-0 h-full w-72 bg-card shadow-xl flex flex-col transition-transform duration-300 ease-in-out'
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          zIndex: 50,
        }}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-5 border-b border-border'>
          <span className='font-semibold text-card-foreground'>{t('navigation.menu')}</span>
          <Button
            onClick={close}
            aria-label={t('navigation.closeMenu')}
            variant='secondary'
            size='s'
          >
            <Cross1Icon />
          </Button>
        </div>

        {/* Links */}
        <nav className='flex-1 px-4 py-6 flex flex-col gap-1'>
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={close}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <span className='w-1.5 h-1.5 rounded-full bg-primary shrink-0' />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className='px-6 py-6 border-t border-border flex items-center gap-3'>
          <Button size='s' className='flex-1' onClick={close}>
            {t('navigation.getStarted')}
          </Button>
          <UserMenu />
        </div>
      </div>
    </>
  )
}

export default NavigationMenu
