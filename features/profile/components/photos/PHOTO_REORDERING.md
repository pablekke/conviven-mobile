# Photo Reordering Feature

## Current Status

The backend API for photo reordering is fully integrated and ready to use:

- ✅ `order` field added to `ProfilePhoto` type
- ✅ `reorderPhotos()` API service method implemented
- ✅ `reorderPhotos()` hook function available in `useProfilePhotos`
- ✅ Backend endpoint: `PUT /api/profile-photos/reorder`

## How to Use (Future Implementation)

To implement drag-and-drop reordering in the UI, you can use the `reorderPhotos` function:

```typescript
// Example: After user drags photos to reorder
const handleReorder = async (reorderedPhotos: ProfilePhoto[]) => {
  // Include primary photo at position 0
  const allPhotos = primaryPhoto ? [primaryPhoto, ...reorderedPhotos] : reorderedPhotos;

  try {
    await reorderPhotos(allPhotos);
    // Success! Photos are reordered
  } catch (error) {
    // Handle error
  }
};
```

## Recommended Libraries for Drag-to-Reorder UI

For implementing the drag-and-drop UI, consider using:

- `react-native-draggable-flatlist` - Best for list-based reordering
- `react-native-reanimated` + custom gestures - For more control

## API Contract

### Request

```typescript
PUT /api/profile-photos/reorder
{
  "photos": [
    { "photoId": "uuid-1", "order": 0 },
    { "photoId": "uuid-2", "order": 1 },
    { "photoId": "uuid-3", "order": 2 }
  ]
}
```

### Response

- ✅ `204 No Content` - Success
- ❌ `400 Bad Request` - Invalid data or non-consecutive orders

### Validation Rules

1. Orders must be consecutive starting from 0 (0, 1, 2, 3...)
2. All photos must belong to the authenticated user
3. `photoId` must be a valid UUID string

## Current UI Behavior

Currently, photos are displayed in the order returned by the API (sorted by `order` field ASC). Users can:

- ✅ Upload new photos
- ✅ Delete photos
- ✅ Set a photo as primary
- ⏳ Reorder photos (API ready, UI pending)

The drag-and-drop UI for reordering is planned for a future update.
