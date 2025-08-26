'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  IconBell,
  IconChevronRight,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconPhotoUp,
  IconUserCircle
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { signOut, useSession } from 'next-auth/react';
import { useRoleCheck } from '@/lib/authUtils';
import { useRoleBasedNavigation } from '@/hooks/use-role-based-nav';
import axios from 'axios';
import { dispatch } from '@/store/Store';
import { fetchGyms } from '@/store/GymsSlice';
interface Gym {
  id: string;
  name: string;
  // Add other gym properties as needed
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const router = useRouter();
  const { data: session } = useSession();
  const { userRole } = useRoleCheck(session);
  const { filteredNavItems } = useRoleBasedNavigation();
  const [gyms, setGyms] = React.useState<Gym[]>([]);
  const [isLoadingGyms, setIsLoadingGyms] = React.useState(false);
  const [gymError, setGymError] = React.useState<string | null>(null);

  // Function to refetch gyms - can be called from other components
  const refetchGyms = React.useCallback(async () => {
    if (userRole === 'OWNER' && session?.user) {
      setIsLoadingGyms(true);
      setGymError(null);
      try {
        const response = await dispatch(fetchGyms());
        // Check if the action was fulfilled and extract the data
        if (fetchGyms.fulfilled.match(response)) {
          setGyms(response.payload.gyms || []);
        } else {
          throw new Error('Failed to fetch gyms');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch gyms';
        setGymError(errorMessage);
        console.error('Error fetching gyms:', error);
      } finally {
        setIsLoadingGyms(false);
      }
    }
  }, [userRole, session?.user]);

  // Fetch gyms when component mounts and user is an owner
  React.useEffect(() => {
    refetchGyms();
  }, [refetchGyms]);

  // Expose refetch function globally so other components can call it
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refetchGyms = refetchGyms;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).refetchGyms;
      }
    };
  }, [refetchGyms]);

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        {userRole === 'OWNER' && !isLoadingGyms && gyms.length > 0 && (
          <OrgSwitcher
            tenants={gyms}
            defaultTenant={gyms.find(
              (gym) => gym.id === session?.user?.selected_location_id
            )}
            onTenantSwitch={(gymId) => console.log('Switching to gym:', gymId)}
          />
        )}
        {userRole === 'OWNER' && isLoadingGyms && (
          <div className='text-muted-foreground p-4 text-sm'>
            Loading gyms...
          </div>
        )}
        {userRole === 'OWNER' && gymError && (
          <div className='text-destructive p-4 text-sm'>Error: {gymError}</div>
        )}
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              const Icon = item.icon
                ? Icons[item.icon as keyof typeof Icons]
                : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem: any) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center px-1 py-1.5'>
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    {session?.user?.name}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                >
                  <IconLogout className='mr-2 h-4 w-4' />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
