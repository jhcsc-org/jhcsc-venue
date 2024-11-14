import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetIdentity, useShow, useUpdate } from "@refinedev/core";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileData {
    id: number;
    name: string | null;
    phone_number: string | null;
    affiliation: string | null;
    role: 'user' | 'manager' | 'admin';
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export const ProfileShow = () => {
    const { data: userData } = useGetIdentity<User>();
    const { queryResult } = useShow<ProfileData>({
        resource: "profiles",
        id: userData?.id,
        queryOptions: {
            enabled: !!userData,
        }
    });
    const { data, isLoading } = queryResult;

    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Partial<ProfileData> | null>(null);

    const { mutate } = useUpdate({
        resource: "profiles",
        id: userData?.id,
    });

    const record = data?.data;

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setEditedProfile(record ? {
                name: record.name,
                phone_number: record.phone_number,
                affiliation: record.affiliation,
                role: record.role
            } : null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedProfile(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSave = () => {
        if (editedProfile && userData) {
            mutate({
                resource: "profiles",
                id: userData.id,
                values: editedProfile,
            }, {
                onSuccess: () => {
                    toast.success("Profile updated successfully");
                    setIsEditing(false);
                },
                onError: (error) => {
                    toast.error(`Error updating profile: ${error.message}`);
                },
            });
        }
    };

    const renderField = (label: string, name: keyof ProfileData) => (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-sm font-medium text-card-foreground">
                {label}
            </Label>
            {isEditing ? (
                <Input
                    id={name}
                    name={name}
                    value={editedProfile?.[name] as string || ""}
                    onChange={handleInputChange}
                    className="w-full max-w-md"
                    placeholder={`Enter your ${label.toLowerCase()}`}
                />
            ) : (
                <p className="text-sm text-muted-foreground">
                    {record?.[name] || "Not provided"}
                </p>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="space-y-1">
                <div className="flex items-center space-x-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage your personal information
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {userData ? (
                    <div className="space-y-6">
                        {renderField("Name", "name")}
                        {renderField("Phone Number", "phone_number")}
                        {renderField("Affiliation", "affiliation")}
                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                            {isEditing ? (
                                <>
                                    <Button
                                        onClick={handleSave}
                                        className="sm:flex-1"
                                        size="lg"
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        onClick={handleEditToggle}
                                        variant="outline"
                                        className="sm:flex-1"
                                        size="lg"
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={handleEditToggle}
                                    className="w-full"
                                    size="lg"
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                            <div className="w-8 h-8 mx-auto border-b-2 border-gray-900 rounded-full animate-spin" />
                            <p className="mt-2 text-sm text-gray-600">Loading profile...</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
