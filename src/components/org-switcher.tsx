'use client';

import { Check, ChevronsUpDown, GalleryVerticalEnd } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useSession } from 'next-auth/react';

interface Gym {
  id: string;
  name: string;
  // Add other gym properties as needed
}

export function OrgSwitcher({
  tenants,
  defaultTenant,
  onTenantSwitch
}: {
  tenants: Gym[];
  defaultTenant: Gym | undefined;
  onTenantSwitch?: (gymId: string) => void;
}) {
  const [selectedTenant, setSelectedTenant] = React.useState<Gym | undefined>(
    defaultTenant || (tenants.length > 0 ? tenants[0] : undefined)
  );
  const { update, data: session } = useSession();

  // Update selected tenant when defaultTenant changes
  React.useEffect(() => {
    if (defaultTenant && defaultTenant.id !== selectedTenant?.id) {
      setSelectedTenant(defaultTenant);
    }
  }, [defaultTenant, selectedTenant?.id]);

  // Set default location when component mounts and no location is selected
  React.useEffect(() => {
    if (tenants.length > 0 && !session?.user?.selected_location_id) {
      const defaultGym = tenants[0];
      handleTenantSwitch(defaultGym);
    }
  }, [tenants, session?.user?.selected_location_id]);

  const handleTenantSwitch = (gym: Gym) => {
    try {
      update({
        ...session,
        user: {
          ...session?.user,
          selected_location_id: gym.id
        }
      });
      setSelectedTenant(gym);
      if (onTenantSwitch) {
        onTenantSwitch(gym.id);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  if (!selectedTenant || tenants.length === 0) {
    return null;
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <GalleryVerticalEnd className='size-4' />
              </div>
              <div className='flex flex-col gap-0.5 leading-none'>
                <span className='font-semibold'>Gym</span>
                <span className=''>{selectedTenant.name}</span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width]'
            align='start'
          >
            {tenants.map((gym) => (
              <DropdownMenuItem
                key={gym.id}
                onSelect={() => handleTenantSwitch(gym)}
              >
                {gym.name}{' '}
                {gym.id === selectedTenant.id && <Check className='ml-auto' />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
