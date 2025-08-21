import { PermissionGuard, SuperAdminOnly, OwnerOrHigher, MemberOrHigher, ConditionalRender } from "@/components/permission-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PermissionsDemoPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Permissions Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates the permission system in action
        </p>
      </div>

      {/* Role-based Components */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Components</CardTitle>
          <CardDescription>
            These components only render content for users with specific roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SuperAdminOnly>
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                🔐 Super Admin Only
              </h3>
              <p className="text-red-700 dark:text-red-300">
                This content is only visible to super administrators.
              </p>
            </div>
          </SuperAdminOnly>

          <OwnerOrHigher>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                👑 Owner or Higher
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                This content is visible to owners and super administrators.
              </p>
            </div>
          </OwnerOrHigher>

          <MemberOrHigher>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                👤 Member or Higher
              </h3>
              <p className="text-green-700 dark:text-green-300">
                This content is visible to all authenticated users.
              </p>
            </div>
          </MemberOrHigher>
        </CardContent>
      </Card>

      {/* Conditional Rendering */}
      <Card>
        <CardHeader>
          <CardTitle>Conditional Rendering</CardTitle>
          <CardDescription>
            Show different content based on user role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConditionalRender
            superAdmin={
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                  🚀 Super Admin View
                </h3>
                <p className="text-purple-700 dark:text-purple-300">
                  Full system access with all features enabled.
                </p>
              </div>
            }
            owner={
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                  🏢 Owner View
                </h3>
                <p className="text-orange-700 dark:text-orange-300">
                  Business management with most permissions.
                </p>
              </div>
            }
            member={
              <div className="p-4 bg-teal-50 dark:bg-teal-950 rounded-lg border border-teal-200 dark:border-teal-800">
                <h3 className="font-semibold text-teal-800 dark:text-teal-200">
                  👥 Member View
                </h3>
                <p className="text-teal-700 dark:text-teal-300">
                  Basic access with limited features.
                </p>
              </div>
            }
            default={
              <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  ❓ Default View
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This should not be visible to authenticated users.
                </p>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Custom Permission Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Permission Checks</CardTitle>
          <CardDescription>
            Using PermissionGuard with specific requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PermissionGuard requiredPath="/products">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-200">
                📦 Product Access
              </h3>
              <p className="text-indigo-700 dark:text-indigo-300">
                You have access to the products section.
              </p>
            </div>
          </PermissionGuard>

          <PermissionGuard requiredRole="OWNER">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                🎯 Owner Role Required
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                This content requires owner role or higher.
              </p>
            </div>
          </PermissionGuard>

          <PermissionGuard requiredRoles={["SUPERADMIN", "OWNER"]}>
            <div className="p-4 bg-pink-50 dark:bg-pink-950 rounded-lg border border-pink-200 dark:border-pink-800">
              <h3 className="font-semibold text-pink-800 dark:text-pink-200">
                🔑 Admin Access
              </h3>
              <p className="text-pink-700 dark:text-pink-300">
                This content requires admin-level access.
              </p>
            </div>
          </PermissionGuard>
        </CardContent>
      </Card>

      {/* Permission Information */}
      <Card>
        <CardHeader>
          <CardTitle>Permission System Information</CardTitle>
          <CardDescription>
            How the permission system works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl mb-2">🔒</div>
              <h4 className="font-semibold">Middleware Protection</h4>
              <p className="text-sm text-muted-foreground">
                Routes are protected at the request level
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-semibold">Role-Based Access</h4>
              <p className="text-sm text-muted-foreground">
                Three user roles with different permissions
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold">Component-Level Control</h4>
              <p className="text-sm text-muted-foreground">
                Fine-grained permission checking in components
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-semibold">Available Roles:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="destructive">SUPERADMIN</Badge>
              <Badge variant="default">OWNER</Badge>
              <Badge variant="secondary">MEMBER</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
