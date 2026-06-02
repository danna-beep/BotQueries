import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Avatar,
  AvatarFallback,
  Typography,
  Button,
} from '@getvaas/viplay-ui'
import { GearIcon, CheckIcon, ExitIcon } from '@radix-ui/react-icons'
import { LanguageIcon } from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import useAuth from '@/auth/useAuth'

const LANGUAGES = [
  { code: 'es', label: 'Español (LATAM)' },
  { code: 'en', label: 'English (US)' },
]

const UserMenu = () => {
  const { t, currentLanguage, onChangeLanguage } = useTranslation()
  const { user, logout } = useAuth()

  const givenName = (user?.given_name as string) ?? ''
  const familyName = (user?.family_name as string) ?? ''
  const userFullName = `${givenName} ${familyName}`.trim() || 'User'
  const userEmail = (user?.email as string) ?? ''
  const userInitials = `${givenName.charAt(0)}${familyName.charAt(0)}`.toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className='flex items-center justify-center w-10 h-10 rounded-lg border border-none bg-card hover:bg-accent transition-colors'
          aria-label={t('navigation.menu')}
        >
          <GearIcon className='h-4 w-4 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-64'>
        {/* User Info */}
        <div className='px-2 py-3 space-y-1'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='text-white text-xs font-semibold'>
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Typography variant='h6' className='text-sm font-semibold'>
                {userFullName}
              </Typography>
              <Typography variant='h6' className='text-xs text-muted-foreground'>
                {userEmail}
              </Typography>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Language Selector */}
        <div className='px-2 py-2'>
          <Typography variant='h6' className='text-sm font-medium mb-2'>
            {t('header.language')}
          </Typography>
          {LANGUAGES.map((language) => {
            const isSelected = currentLanguage === language.code
            return (
              <DropdownMenuItem
                key={language.code}
                onClick={() => onChangeLanguage(language.code)}
                className='flex items-center justify-between cursor-pointer'
              >
                <div className='flex items-center gap-2'>
                  <LanguageIcon className='h-4 w-4' />
                  <span>{language.label}</span>
                </div>
                {isSelected && <CheckIcon className='h-4 w-4' />}
              </DropdownMenuItem>
            )
          })}
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem onClick={logout} className='cursor-pointer flex items-center gap-2'>
          <ExitIcon className='h-4 w-4' />
          <span>{t('header.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
