# Gym Refetch System

This system automatically updates the `OrgSwitcher` component in the sidebar whenever gyms are added, updated, or deleted.

## How It Works

1. **AppSidebar Component**: Fetches gyms and exposes a `refetchGyms` function globally
2. **useGymRefetch Hook**: Provides easy-to-use functions for any component to trigger gym refetching
3. **Automatic Updates**: Components can call refetch functions after API operations to keep the UI in sync

## Usage

### 1. In Your Component

Import and use the `useGymRefetch` hook:

```tsx
import { useGymRefetch } from '@/hooks/use-gym-refetch';

export function YourComponent() {
  const { refetchGyms, refetchGymsDelayed, refetchGymsWithFallback } =
    useGymRefetch();

  const handleAddGym = async (gymData) => {
    try {
      const response = await fetch('/api/gyms/addgym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gymData)
      });

      if (response.ok) {
        // Refetch gyms to update the OrgSwitcher
        refetchGyms();
      }
    } catch (error) {
      console.error('Error adding gym:', error);
    }
  };

  // ... rest of your component
}
```

### 2. Available Functions

- **`refetchGyms()`**: Refetches gyms immediately
- **`refetchGymsDelayed(delayMs)`**: Refetches gyms after a specified delay (default: 1000ms)
- **`refetchGymsWithFallback(delayMs)`**: Refetches immediately and then again after delay

### 3. When to Use Each Function

- **`refetchGyms()`**: Use for immediate updates (e.g., after successful API calls)
- **`refetchGymsDelayed(1000)`**: Use when you want to give the API time to complete (recommended)
- **`refetchGymsWithFallback(1000)`**: Use for critical operations where you want both immediate and delayed updates

## Example Implementation

See `src/components/examples/gym-form-example.tsx` for a complete example of how to use the refetch system.

## API Endpoints

The following API endpoints now include timestamps in their responses to help with cache invalidation:

- `POST /api/gyms/addgym` - Returns timestamp when gym is added
- `POST /api/gyms/updategym` - Returns timestamp when gym is updated

## Important Notes

1. **Component Mounting**: The `AppSidebar` component must be mounted for the refetch functions to work
2. **Error Handling**: The system includes fallbacks and warnings if the refetch function isn't available
3. **Performance**: Use `refetchGymsDelayed()` for better user experience, especially after API operations
4. **Consistency**: The system ensures the OrgSwitcher always shows the most up-to-date gym information

## Troubleshooting

If you see the warning "refetchGyms function not available", make sure:

1. The `AppSidebar` component is mounted in your app
2. You're calling the refetch function from a client-side component
3. The function is being called after the component has fully loaded

## Best Practices

1. **Always refetch after successful API operations** that modify gym data
2. **Use delayed refetching** for better user experience
3. **Handle errors gracefully** - the refetch system won't break your app if it fails
4. **Test the flow** by adding/updating a gym and verifying the OrgSwitcher updates
