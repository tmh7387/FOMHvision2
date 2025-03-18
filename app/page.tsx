'use client';

import EnhancedOrgChart from '@/components/organization/EnhancedOrgChart';
import EnhancedFleetGallery from '@/components/fleet/EnhancedFleetGallery';
import ProcessFlow from '@/components/processes/ProcessFlow';
import RiskMatrix from '@/components/safety/RiskMatrix';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">HeliVenture Airways</h1>
        <p className="text-xl text-muted-foreground">
          System Description & Safety Management Portal
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4">
          <div className="grid gap-4">
            <div className="p-6 bg-card rounded-lg border">
              <EnhancedOrgChart />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <div className="grid gap-4">
            <div className="p-6 bg-card rounded-lg border">
              <EnhancedFleetGallery />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="processes" className="space-y-4">
          <div className="grid gap-4">
            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-2xl font-bold mb-4">Operational Processes</h2>
              <ProcessFlow />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <div className="grid gap-4">
            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-2xl font-bold mb-4">Safety Risk Management</h2>
              <RiskMatrix />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}