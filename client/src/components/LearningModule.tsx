// Jika tidak ada ekspor LearningModule, gunakan any agar tidak error
type LearningModuleType = any;
// Ganti dengan tipe yang benar jika tidak ada ekspor LearningModule
// import type { LearningModuleType } from '../types/schema';
import { Card, CardContent } from "@/components/ui/card";
import {
  Map,
  Tent,
  Cross,
  Compass,
  Mountain,
  Leaf,
  Droplets,
  Wind
} from "lucide-react";

interface LearningModuleProps {
  module: LearningModuleType;
}

export function LearningModule({ module }: LearningModuleProps) {
  // Map icon string to Lucide icon component
  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'map':
      case 'map-marked-alt':
        return <Map className="h-5 w-5" />;
      case 'campground':
      case 'tent':
        return <Tent className="h-5 w-5" />;
      case 'first-aid':
      case 'medkit':
        return <Cross className="h-5 w-5" />;
      case 'compass':
        return <Compass className="h-5 w-5" />;
      case 'mountain':
        return <Mountain className="h-5 w-5" />;
      case 'leaf':
        return <Leaf className="h-5 w-5" />;
      case 'water':
      case 'droplets':
        return <Droplets className="h-5 w-5" />;
      case 'wind':
        return <Wind className="h-5 w-5" />;
      default:
        return <Compass className="h-5 w-5" />;
    }
  };

  return (
    <Card className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition h-full">
      <CardContent className="p-0">
        <div className="flex items-center mb-4">
          <span className="bg-primary/10 text-primary p-3 rounded-full mr-4">
            {getIcon(module.icon)}
          </span>
          <h3 className="font-heading text-lg font-semibold">{module.title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{module.description}</p>
        <a
          href={module.link}
          className="inline-flex items-center text-primary hover:text-secondary transition"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="mr-2">Pelajari</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </CardContent>
    </Card>
  );
}