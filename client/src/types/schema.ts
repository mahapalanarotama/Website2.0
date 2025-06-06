export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  imageUrl?: string;
  category: string;
  // Add more fields if needed
}
