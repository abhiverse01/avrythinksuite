'use client';

import { Settings, LogOut, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/utils';
import { useRouter } from 'next/navigation';

/**
 * User avatar with online presence indicator and dropdown menu.
 */
export function UserAvatar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();

  const initials = user?.full_name
    ? getInitials(user.full_name)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const displayName = user?.full_name ?? user?.email ?? 'User';
  const displayEmail = user?.email ?? '';

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full"
          aria-label="User menu"
        >
          <Avatar className="size-8">
            {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={displayName} />}
            <AvatarFallback className="bg-[var(--color-accent-muted)] text-[var(--color-accent)] text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Online presence dot */}
          <span
            className="absolute bottom-0 right-0 size-2 rounded-full border-2 border-[#FF3333] bg-[var(--color-success)]"
            aria-label="Online"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {displayName}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)] truncate">
              {displayEmail}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => router.push('/home')}
            className="cursor-pointer"
          >
            <User size={16} strokeWidth={1.5} />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => router.push('/settings')}
            className="cursor-pointer"
          >
            <Settings size={16} strokeWidth={1.5} />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={handleSignOut}
          variant="destructive"
          className="cursor-pointer"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
