export interface ImmichRandomSearchPayload {
  type: 'IMAGE' | 'VIDEO';
  takenAfter: string;
  takenBefore: string;
  isVisible: boolean;
  size: number;
}

export interface ImmichPerson {
  id: string;
  name: string;
  thumbnailPath: string;
}

export interface ImmichAsset {
  id: string;
  createdAt: string;
  ownerId: string;
  libraryId: string | null;
  type: 'IMAGE' | 'VIDEO';
  originalPath: string;
  originalFileName: string;
  originalMimeType: string;
  thumbhash: string | null;
  fileCreatedAt: string;
  fileModifiedAt: string;
  localDateTime: string;
  updatedAt: string;
  isFavorite: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  visibility: 'visible' | 'search' | 'timeline';
  duration: string | null;
  livePhotoVideoId: string | null;
  people: ImmichPerson[];
  checksum: string;
  isOffline: boolean;
  hasMetadata: boolean;
  duplicateId: string | null;
  resized: boolean;
  width: number;
  height: number;
  isEdited: boolean;
}

