import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";

export default function CareerCapsulePage() {
  return (
    <PageLayout title="Career Capsule">
      <div className="container min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-700">Career Capsule</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            This feature is currently under redevelopment.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}