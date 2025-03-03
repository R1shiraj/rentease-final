// src/app/provider/profile/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "./profile-form";
import BusinessInfoForm from "./business-info-form";
import { getProviderProfile } from "@/app/actions/provider";

export default async function ProfilePage() {
  const provider = await getProviderProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your provider profile information and business details
        </p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="business">Business Information</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm provider={provider} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="business" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessInfoForm provider={provider} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
