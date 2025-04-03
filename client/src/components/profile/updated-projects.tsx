// Let's create a file with just the two collaborator form snippets that need to be updated
// 1. First form at around line 719
<FormLabel>Name</FormLabel>
<FormControl>
  <Input placeholder="Collaborator name" {...field} value={field.value || ''} />
</FormControl>

// Don't forget to update this at 1386
<FormLabel>Name</FormLabel>
<FormControl>
  <Input placeholder="Collaborator name" {...field} value={field.value || ''} />
</FormControl>

// 2. For the Role field at around line 748
<FormLabel>Role</FormLabel>
<FormControl>
  <Input placeholder="Developer, Designer, PM, etc." {...field} value={field.value || ''} />
</FormControl>

// Don't forget to update this at 1414
<FormLabel>Role</FormLabel>
<FormControl>
  <Input placeholder="Developer, Designer, PM, etc." {...field} value={field.value || ''} />
</FormControl>

// 3. Profile Link field that needs to be added after email field at around line 740
<FormField
  control={collaboratorForm.control}
  name="profileLink"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Profile Link</FormLabel>
      <FormControl>
        <Input placeholder="https://linkedin.com/in/username" {...field} value={field.value || ''} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Don't forget to add this at 1406 
<FormField
  control={collaboratorForm.control}
  name="profileLink"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Profile Link</FormLabel>
      <FormControl>
        <Input placeholder="https://linkedin.com/in/username" {...field} value={field.value || ''} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>