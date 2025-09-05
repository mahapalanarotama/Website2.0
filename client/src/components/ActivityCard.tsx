// Define the Activity type locally if the import is missing
type Activity = {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  imageUrl?: string;
};

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { id } from "date-fns/locale";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  // Format the date in Indonesian format
  const formattedDate = format(
    new Date(activity.date), 
    'd MMMM yyyy', 
    { locale: id }
  );
  
  // Get badge color based on category
  const getBadgeVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ekspedisi':
        return 'default';
      case 'konservasi':
        return 'outline';
      case 'edukasi':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className="h-full flex flex-col bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={activity.imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&h=450'} 
          alt={activity.title} 
          className="w-full h-full object-cover transition hover:scale-105 duration-500"
        />
      </div>
      <CardContent className="flex-grow p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500">{formattedDate}</span>
          <Badge variant={getBadgeVariant(activity.category)}>
            {activity.category}
          </Badge>
        </div>
        <h3 className="font-heading text-lg font-semibold mb-2">{activity.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
      </CardContent>
      <CardFooter className="pt-0 px-5 pb-5">
        <Link to={`/kegiatan/${activity.id}`} className="text-primary font-medium hover:text-secondary transition">
          Selengkapnya →
        </Link>
      </CardFooter>
    </Card>
  );
}
