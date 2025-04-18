import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function PostNotFound() {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-center justify-center text-center">
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Post Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="../">Back to Posts</Link>
        </Button>
      </div>
    </div>
  );
}