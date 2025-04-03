import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function ThumbnailFormField({ control }: { control: any }) {
  return (
    <FormField
      control={control}
      name="thumbnailUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Thumbnail URL</FormLabel>
          <FormControl>
            <Input placeholder="https://example.com/thumbnail.jpg" {...field} value={field.value || ''} />
          </FormControl>
          <FormDescription>
            URL to the main image that represents this project
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}