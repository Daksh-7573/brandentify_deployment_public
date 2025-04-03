#!/bin/bash

# Create a test image file (1x1 pixel PNG)
echo "Creating test image..."
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFJgJlVg/q/AAAAABJRU5ErkJggg==" | base64 -d > test_image.png

# Upload the image file
echo "Uploading image..."
UPLOAD_RESPONSE=$(curl -s -F "thumbnail=@test_image.png" -F "userId=1" http://localhost:5000/api/projects/upload-thumbnail)
echo "Upload response: $UPLOAD_RESPONSE"

# Extract the thumbnailFile and thumbnailUrl from the response using grep and cut
THUMBNAIL_FILE=$(echo $UPLOAD_RESPONSE | grep -o '"thumbnailFile":"[^"]*"' | cut -d'"' -f4)
THUMBNAIL_URL=$(echo $UPLOAD_RESPONSE | grep -o '"thumbnailUrl":"[^"]*"' | cut -d'"' -f4)

echo "Extracted thumbnailFile: $THUMBNAIL_FILE"
echo "Extracted thumbnailUrl: $THUMBNAIL_URL"

# Create a project with the uploaded image
echo "Creating project..."
PROJECT_DATA='{
  "title": "Test Project",
  "description": "A test project created via curl",
  "category": "Web Development",
  "userId": 1,
  "thumbnailFile": "'$THUMBNAIL_FILE'",
  "thumbnailUrl": "'$THUMBNAIL_URL'",
  "mediaUrls": []
}'

echo "Project data: $PROJECT_DATA"

PROJECT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$PROJECT_DATA" http://localhost:5000/api/projects)
echo "Project creation response: $PROJECT_RESPONSE"

# Extract the project ID from the response
PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -n "$PROJECT_ID" ]; then
  echo "Project created successfully with ID: $PROJECT_ID"
  echo "You can view the project at: http://localhost:5000/api/projects/$PROJECT_ID"
else
  echo "Failed to create project"
fi

# Clean up
rm test_image.png