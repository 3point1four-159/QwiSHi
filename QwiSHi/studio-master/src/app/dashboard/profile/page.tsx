import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { currentUser } from "@/lib/data";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Profile & Settings</h1>
            <p className="text-muted-foreground">
                Manage your personal information and application preferences.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Personal Information</CardTitle>
                <CardDescription>Update your profile details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={currentUser.name} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="employee@example.com" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Input id="skills" defaultValue={currentUser.skills.join(', ')} />
                     <p className="text-sm text-muted-foreground">Separate skills with a comma.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="availability">General Availability</Label>
                    <Textarea id="availability" defaultValue={currentUser.availability} placeholder="e.g., Weekends, weekday evenings after 5pm" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Notification Settings</CardTitle>
                <CardDescription>Choose how you want to be notified about new shifts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive an email when a new relevant shift is posted.</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                </div>
                 <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="push-notifications" className="font-semibold">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get a push notification on your mobile device.</p>
                    </div>
                    <Switch id="push-notifications" />
                </div>
                 <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="sms-notifications" className="font-semibold">Text Messages (SMS)</Label>
                        <p className="text-sm text-muted-foreground">Receive a text message for urgent shift openings.</p>
                    </div>
                    <Switch id="sms-notifications" defaultChecked />
                </div>
            </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button>Save Changes</Button>
        </div>
    </div>
  )
}
