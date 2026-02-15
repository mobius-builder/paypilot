'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Users,
  Calculator,
  Clock,
  Shield,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  Network,
  BarChart3,
  Bot,
  MessageCircle,
  Sparkles,
  ClipboardCheck,
  LayoutGrid,
} from 'lucide-react'
import { PayPilotLogo } from '@/components/logo'
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const notifications = [
  { id: 1, title: 'PTO Request', message: 'Sarah Chen requested 3 days PTO', time: '2 hours ago', unread: true },
  { id: 2, title: 'Payroll Ready', message: 'Feb 2-15 payroll is ready for approval', time: '3 hours ago', unread: true },
  { id: 3, title: 'New Hire', message: 'Mike Johnson completed onboarding', time: '5 hours ago', unread: true },
  { id: 4, title: 'Benefits Update', message: '3 employees enrolled in 401(k)', time: '1 day ago', unread: false },
]

const recentEmployees = [
  { id: 'emp-001', name: 'Sarah Chen', role: 'Senior Engineer', department: 'Engineering' },
  { id: 'emp-002', name: 'Marcus Johnson', role: 'Product Manager', department: 'Product' },
  { id: 'emp-003', name: 'Emily Rodriguez', role: 'HR Manager', department: 'Human Resources' },
  { id: 'emp-004', name: 'David Kim', role: 'Designer', department: 'Design' },
  { id: 'emp-005', name: 'Lisa Park', role: 'Marketing Lead', department: 'Marketing' },
]

const navigation = [
  { name: 'Overview', href: '/overview', icon: LayoutGrid },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Org Chart', href: '/org-chart', icon: Network },
  { name: 'Payroll', href: '/payroll', icon: Calculator },
  { name: 'Time & PTO', href: '/time', icon: Clock },
  { name: 'Benefits', href: '/benefits', icon: Shield },
  { name: 'Compliance', href: '/compliance', icon: ClipboardCheck },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'AI Agents', href: '/agents', icon: Bot },
  { name: 'Messages', href: '/messages', icon: MessageCircle },
  { name: 'Insights', href: '/admin/insights', icon: Sparkles },
  { name: 'AI Assistant', href: '/ai', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
  initials: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          const name = authUser.user_metadata?.full_name ||
                       authUser.user_metadata?.name ||
                       authUser.email?.split('@')[0] ||
                       'User'
          const initials = name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()

          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: name,
            avatarUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
            initials: initials,
          })
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }

    fetchUser()
  }, [])

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSignOut = async () => {
    // Call logout API to clear demo cookies
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Continue even if API fails
    }

    // Clear Supabase session
    const supabase = createClient()
    await supabase.auth.signOut()

    // Clear localStorage demo session
    localStorage.removeItem('paypilot_demo_session')

    // Clear demo cookies manually in case API failed
    document.cookie = 'paypilot_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'paypilot_demo_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-56 bg-card border-r border-border hidden lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center gap-2 px-4 border-b border-border">
            <PayPilotLogo className="w-7 h-7" />
            <span className="text-lg font-semibold text-foreground">
              PayPilot
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Company info */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-semibold">AC</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Acme Technologies</p>
                <p className="text-xs text-muted-foreground">Growth Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0 bg-card">
              <div className="flex h-full flex-col">
                <div className="flex h-14 items-center gap-2 px-4 border-b border-border">
                  <PayPilotLogo className="w-7 h-7" />
                  <span className="text-lg font-semibold text-foreground">
                    PayPilot
                  </span>
                </div>
                <nav className="flex-1 px-2 py-3 space-y-0.5">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <PayPilotLogo className="w-6 h-6" />
          <span className="text-base font-semibold text-foreground">PayPilot</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="w-4 h-4" />
          </Button>
          <Avatar className="w-7 h-7">
            {user?.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            )}
            <AvatarFallback className="bg-secondary text-foreground text-xs">
              {user?.initials || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main content area */}
      <div className="lg:pl-56">
        {/* Desktop header */}
        <header className="hidden lg:flex h-14 items-center justify-between px-6 bg-card border-b border-border">
          <div>
            <h1 className="text-base font-semibold text-foreground">
              {navigation.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <Button
              variant="outline"
              className="hidden md:flex items-center gap-2 text-muted-foreground px-3 h-8 text-sm border-border"
              onClick={() => setCommandOpen(true)}
            >
              <span>Search...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-secondary px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground h-8 w-8">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 border-border" align="end">
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    <span className="text-xs text-primary cursor-pointer hover:underline">Mark all read</span>
                  </div>
                </div>
                <ScrollArea className="h-[240px]">
                  <div className="divide-y divide-border">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 hover:bg-secondary cursor-pointer ${notif.unread ? 'bg-accent/30' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {notif.unread && (
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          )}
                          <div className={notif.unread ? '' : 'ml-3.5'}>
                            <p className="font-medium text-sm text-foreground">{notif.title}</p>
                            <p className="text-xs text-muted-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground/60 mt-0.5">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                  <Avatar className="w-6 h-6">
                    {user?.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    )}
                    <AvatarFallback className="bg-secondary text-foreground text-xs">
                      {user?.initials || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild className="text-sm">
                  <Link href="/settings">
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive text-sm">
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 mt-14 lg:mt-0">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." className="text-sm" />
        <CommandList>
          <CommandEmpty className="text-sm text-muted-foreground">No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigation.map((item) => (
              <CommandItem
                key={item.name}
                onSelect={() => {
                  router.push(item.href)
                  setCommandOpen(false)
                }}
                className="text-sm"
              >
                <item.icon className="mr-2 h-3.5 w-3.5" />
                <span>{item.name}</span>
                {item.name === 'Employees' && <CommandShortcut>⌘E</CommandShortcut>}
                {item.name === 'Payroll' && <CommandShortcut>⌘P</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                router.push('/employees?add=true')
                setCommandOpen(false)
              }}
              className="text-sm"
            >
              <Users className="mr-2 h-3.5 w-3.5" />
              <span>Add New Employee</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push('/payroll/run')
                setCommandOpen(false)
              }}
              className="text-sm"
            >
              <Calculator className="mr-2 h-3.5 w-3.5" />
              <span>Run Payroll</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Recent Employees">
            {recentEmployees.map((emp) => (
              <CommandItem
                key={emp.id}
                onSelect={() => {
                  router.push(`/employees/${emp.id}`)
                  setCommandOpen(false)
                }}
                className="text-sm"
              >
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarFallback className="text-[10px] bg-secondary">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span>{emp.name}</span>
                  <span className="text-xs text-muted-foreground">{emp.role} · {emp.department}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Keyboard shortcuts help dialog */}
      <KeyboardShortcutsDialog />
    </div>
  )
}
