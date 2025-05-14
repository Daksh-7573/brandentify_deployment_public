import { useState } from "react";
import AdminLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Check, CheckCircle, Edit, Eye, Lock, MoreHorizontal, Plus, Save, Shield, Trash2, User, Users 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types for roles and permissions
interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'content' | 'analytics' | 'settings' | 'system';
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

// Mock data
const permissionsList: Permission[] = [
  // Users permissions
  { id: 'view_users', name: 'View Users', description: 'Can view user profiles and details', category: 'users' },
  { id: 'create_users', name: 'Create Users', description: 'Can create new user accounts', category: 'users' },
  { id: 'edit_users', name: 'Edit Users', description: 'Can edit user profile information', category: 'users' },
  { id: 'delete_users', name: 'Delete Users', description: 'Can delete user accounts', category: 'users' },
  
  // Content permissions
  { id: 'view_content', name: 'View Content', description: 'Can view all content in the system', category: 'content' },
  { id: 'create_content', name: 'Create Content', description: 'Can create new content items', category: 'content' },
  { id: 'edit_content', name: 'Edit Content', description: 'Can edit existing content', category: 'content' },
  { id: 'delete_content', name: 'Delete Content', description: 'Can delete content items', category: 'content' },
  { id: 'approve_content', name: 'Approve Content', description: 'Can approve content for publication', category: 'content' },
  
  // Analytics permissions
  { id: 'view_analytics', name: 'View Analytics', description: 'Can view analytical data', category: 'analytics' },
  { id: 'export_analytics', name: 'Export Analytics', description: 'Can export analytical data', category: 'analytics' },
  
  // Settings permissions
  { id: 'view_settings', name: 'View Settings', description: 'Can view system settings', category: 'settings' },
  { id: 'edit_settings', name: 'Edit Settings', description: 'Can modify system settings', category: 'settings' },
  
  // System permissions
  { id: 'manage_roles', name: 'Manage Roles', description: 'Can manage roles and permissions', category: 'system' },
  { id: 'system_logs', name: 'View System Logs', description: 'Can view system activity logs', category: 'system' },
  { id: 'full_access', name: 'Full Access', description: 'Has complete unrestricted access to all system features', category: 'system' },
];

const rolesList: Role[] = [
  {
    id: 1,
    name: 'Administrator',
    description: 'Complete system access with full permissions',
    permissions: ['full_access'],
    userCount: 3,
    isSystem: true
  },
  {
    id: 2,
    name: 'Content Manager',
    description: 'Can manage all content but has limited system access',
    permissions: ['view_users', 'view_content', 'create_content', 'edit_content', 'delete_content', 'approve_content', 'view_analytics'],
    userCount: 6,
    isSystem: false
  },
  {
    id: 3,
    name: 'Analyst',
    description: 'Can view analytics and export reports',
    permissions: ['view_analytics', 'export_analytics', 'view_content'],
    userCount: 4,
    isSystem: false
  },
  {
    id: 4,
    name: 'User Manager',
    description: 'Can manage user accounts and profiles',
    permissions: ['view_users', 'create_users', 'edit_users', 'delete_users'],
    userCount: 2,
    isSystem: false
  },
  {
    id: 5,
    name: 'Support Staff',
    description: 'Limited access for customer support purposes',
    permissions: ['view_users', 'view_content'],
    userCount: 8,
    isSystem: false
  }
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(rolesList);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: []
  });
  
  // Group permissions by category
  const permissionsByCategory = permissionsList.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
  
  // Handler to create a new role
  const handleCreateRole = () => {
    if (!newRole.name) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the role.",
        variant: "destructive"
      });
      return;
    }
    
    const roleId = Math.max(...roles.map(role => role.id)) + 1;
    const createdRole: Role = {
      id: roleId,
      name: newRole.name,
      description: newRole.description || '',
      permissions: newRole.permissions || [],
      userCount: 0,
      isSystem: false
    };
    
    setRoles([...roles, createdRole]);
    setNewRole({ name: '', description: '', permissions: [] });
    setIsCreating(false);
    
    toast({
      title: "Role Created",
      description: `${createdRole.name} role has been created successfully.`,
      variant: "default"
    });
  };
  
  // Handler to update a role
  const handleUpdateRole = () => {
    if (!currentRole) return;
    
    setRoles(roles.map(role => 
      role.id === currentRole.id ? currentRole : role
    ));
    
    setIsEditing(false);
    
    toast({
      title: "Role Updated",
      description: `${currentRole.name} role has been updated successfully.`,
      variant: "default"
    });
  };
  
  // Handler to delete a role
  const handleDeleteRole = (id: number) => {
    setRoles(roles.filter(role => role.id !== id));
    
    toast({
      title: "Role Deleted",
      description: "The role has been deleted successfully.",
      variant: "default"
    });
  };
  
  // Handler for permission changes in edit mode
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (!currentRole) return;
    
    let updatedPermissions = [...currentRole.permissions];
    
    if (checked) {
      // If selecting "full_access", clear all other permissions
      if (permissionId === 'full_access') {
        updatedPermissions = ['full_access'];
      } else {
        // If already has "full_access", remove it
        updatedPermissions = updatedPermissions.filter(p => p !== 'full_access');
        
        // Add the new permission
        if (!updatedPermissions.includes(permissionId)) {
          updatedPermissions.push(permissionId);
        }
      }
    } else {
      // Remove the permission
      updatedPermissions = updatedPermissions.filter(p => p !== permissionId);
    }
    
    setCurrentRole({
      ...currentRole,
      permissions: updatedPermissions
    });
  };
  
  // Handler for new role permission changes
  const handleNewRolePermissionChange = (permissionId: string, checked: boolean) => {
    let updatedPermissions = [...(newRole.permissions || [])];
    
    if (checked) {
      // If selecting "full_access", clear all other permissions
      if (permissionId === 'full_access') {
        updatedPermissions = ['full_access'];
      } else {
        // If already has "full_access", remove it
        updatedPermissions = updatedPermissions.filter(p => p !== 'full_access');
        
        // Add the new permission
        if (!updatedPermissions.includes(permissionId)) {
          updatedPermissions.push(permissionId);
        }
      }
    } else {
      // Remove the permission
      updatedPermissions = updatedPermissions.filter(p => p !== permissionId);
    }
    
    setNewRole({
      ...newRole,
      permissions: updatedPermissions
    });
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground">Manage user roles and their associated permissions</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                onClick={() => {
                  setIsCreating(true);
                  setNewRole({ name: '', description: '', permissions: [] });
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Role
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>Create New Role</SheetTitle>
                <SheetDescription>
                  Define a new role and assign permissions to it.
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-role-name">Role Name</Label>
                  <Input 
                    id="new-role-name" 
                    placeholder="Enter role name"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-role-description">Description</Label>
                  <Textarea 
                    id="new-role-description" 
                    placeholder="Describe the purpose of this role"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <Label>Permissions</Label>
                  
                  {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-sm font-medium capitalize">{category}</h4>
                      <div className="pl-6 space-y-2">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`new-${permission.id}`}
                              checked={(newRole.permissions || []).includes(permission.id)}
                              onCheckedChange={(checked) => 
                                handleNewRolePermissionChange(permission.id, checked === true)
                              }
                              disabled={
                                permission.id !== 'full_access' && 
                                (newRole.permissions || []).includes('full_access')
                              }
                            />
                            <Label 
                              htmlFor={`new-${permission.id}`}
                              className="flex-1 text-sm"
                            >
                              {permission.name}
                              <p className="text-xs text-muted-foreground font-normal">
                                {permission.description}
                              </p>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <SheetFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateRole}>Create Role</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {role.permissions.includes('full_access') ? 
                          <Shield className="h-4 w-4 text-primary" /> : 
                          <User className="h-4 w-4" />
                        }
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>{role.userCount}</TableCell>
                    <TableCell>
                      {role.isSystem ? 
                        <Badge>System</Badge> : 
                        <Badge variant="outline">Custom</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setCurrentRole(role);
                                setIsEditing(false);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="sm:max-w-xl">
                            <SheetHeader>
                              <SheetTitle>
                                {isEditing ? "Edit Role" : "Role Details"}
                                {role.isSystem && !isEditing && (
                                  <Badge className="ml-2">System Role</Badge>
                                )}
                              </SheetTitle>
                              <SheetDescription>
                                {isEditing 
                                  ? "Modify the role name, description, and permissions." 
                                  : "View the details and permissions for this role."}
                              </SheetDescription>
                            </SheetHeader>
                            
                            {currentRole && (
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="role-name">Role Name</Label>
                                  {isEditing ? (
                                    <Input 
                                      id="role-name" 
                                      value={currentRole.name}
                                      onChange={(e) => setCurrentRole({
                                        ...currentRole,
                                        name: e.target.value
                                      })}
                                      disabled={currentRole.isSystem}
                                    />
                                  ) : (
                                    <div className="p-2 border rounded-md">{currentRole.name}</div>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="role-description">Description</Label>
                                  {isEditing ? (
                                    <Textarea 
                                      id="role-description" 
                                      value={currentRole.description}
                                      onChange={(e) => setCurrentRole({
                                        ...currentRole,
                                        description: e.target.value
                                      })}
                                      disabled={currentRole.isSystem}
                                    />
                                  ) : (
                                    <div className="p-2 border rounded-md min-h-[80px]">
                                      {currentRole.description}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label>Users with this role</Label>
                                    <Badge variant="outline">{currentRole.userCount} users</Badge>
                                  </div>
                                  {currentRole.userCount > 0 && (
                                    <div className="p-2 border rounded-md text-sm text-muted-foreground">
                                      {currentRole.userCount} users have this role assigned
                                    </div>
                                  )}
                                </div>
                                
                                <Separator className="my-4" />
                                
                                <div className="space-y-4">
                                  <Label>Permissions</Label>
                                  
                                  {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                                    <div key={category} className="space-y-2">
                                      <h4 className="text-sm font-medium capitalize">{category}</h4>
                                      <div className="pl-6 space-y-2">
                                        {permissions.map((permission) => (
                                          <div key={permission.id} className="flex items-center space-x-2">
                                            {isEditing ? (
                                              <Checkbox 
                                                id={`edit-${permission.id}`}
                                                checked={currentRole.permissions.includes(permission.id)}
                                                onCheckedChange={(checked) => 
                                                  handlePermissionChange(permission.id, checked === true)
                                                }
                                                disabled={
                                                  currentRole.isSystem || 
                                                  (permission.id !== 'full_access' && 
                                                   currentRole.permissions.includes('full_access'))
                                                }
                                              />
                                            ) : (
                                              <div className="h-4 w-4 flex items-center justify-center">
                                                {currentRole.permissions.includes(permission.id) && (
                                                  <Check className="h-3 w-3 text-primary" />
                                                )}
                                              </div>
                                            )}
                                            <Label 
                                              htmlFor={`edit-${permission.id}`}
                                              className="flex-1 text-sm"
                                            >
                                              {permission.name}
                                              <p className="text-xs text-muted-foreground font-normal">
                                                {permission.description}
                                              </p>
                                            </Label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <SheetFooter>
                              {isEditing ? (
                                <>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setCurrentRole(role);
                                      setIsEditing(false);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={handleUpdateRole}>
                                    Save Changes
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  onClick={() => setIsEditing(true)}
                                  disabled={role.isSystem}
                                >
                                  {role.isSystem ? "System Role (Cannot Edit)" : "Edit Role"}
                                </Button>
                              )}
                            </SheetFooter>
                          </SheetContent>
                        </Sheet>
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          disabled={role.isSystem}
                          onClick={() => {
                            setCurrentRole(role);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={role.isSystem || role.userCount > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {role.userCount > 0 
                                  ? `This role has ${role.userCount} users assigned to it. Remove these assignments before deleting.`
                                  : `This will permanently delete the ${role.name} role.`
                                }
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRole(role.id)}
                                disabled={role.userCount > 0}
                              >
                                {role.userCount > 0 ? "Cannot Delete" : "Delete Role"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="py-4 border-t">
            <div className="text-sm text-muted-foreground">
              {roles.length} roles in total. System roles cannot be edited or deleted.
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Role Assignments
              </CardTitle>
              <CardDescription>Overview of role distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map(role => (
                  <div key={role.id} className="flex justify-between items-center">
                    <span className="text-sm">{role.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{role.userCount}</span>
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ 
                            width: `${(role.userCount / roles.reduce((sum, r) => sum + r.userCount, 0)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-500" />
                Permission Usage
              </CardTitle>
              <CardDescription>Most used permission types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">View Users</span>
                  <Badge variant="outline">4 roles</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">View Content</span>
                  <Badge variant="outline">4 roles</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Full Access</span>
                  <Badge variant="outline">1 role</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">View Analytics</span>
                  <Badge variant="outline">2 roles</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Edit Content</span>
                  <Badge variant="outline">1 role</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Role Management
              </CardTitle>
              <CardDescription>Quick actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage User Assignments
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Audit Permission Usage
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="mr-2 h-4 w-4" />
                  Review Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}