import type {
  CreateModongInput,
  CreateWantedItemInput,
  ModongState,
  OwnerSummary,
  UpdateWantedItemInput,
  WantedState
} from "@dongmodel/shared";

export type Owner = {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  role: string;
};

export type AuthMode = "login" | "register";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  displayName: string;
  handle: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

// Derives the API host (without /api/v1) for constructing static asset URLs.
export const apiHost = apiBaseUrl.replace(/\/api\/v1\/?$/, "");

async function requestJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string") {
      return body.message;
    }
  } catch {
    // Fall back to status text when the API does not return JSON.
  }

  return response.statusText || "Request failed";
}

export async function getCurrentOwner(): Promise<Owner | null> {
  try {
    const result = await requestJson<{ owner: Owner }>("/auth/me");
    return result.owner;
  } catch {
    return null;
  }
}

export async function authenticateOwner(
  mode: AuthMode,
  payload: LoginPayload | RegisterPayload
): Promise<Owner> {
  const result = await requestJson<{ owner: Owner }>(`/auth/${mode}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return result.owner;
}

export async function logoutOwner(): Promise<void> {
  await requestJson<{ ok: true }>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({})
  });
}

export function getOwnerSummary(): Promise<OwnerSummary> {
  return requestJson<OwnerSummary>("/owner-summary");
}

export async function createModongItem(
  payload: CreateModongInput
): Promise<{ id: string; name: string }> {
  const result = await requestJson<{ item: { id: string; name: string } }>(
    "/modong",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );

  return result.item;
}

export type WantedItem = {
  id: string;
  name: string;
  state: WantedState;
  wantedListId?: string | null;
  wantedNote?: string;
  referencePhoto?: { id: string; url: string } | null;
};

export async function listWantedItems(): Promise<WantedItem[]> {
  const result = await requestJson<{ items: WantedItem[] }>("/wanted");
  return result.items;
}

export async function createWantedItem(
  payload: CreateWantedItemInput
): Promise<WantedItem> {
  const result = await requestJson<{ item: WantedItem }>("/wanted", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return result.item;
}

export async function updateWantedItem(
  id: string,
  payload: UpdateWantedItemInput
): Promise<WantedItem> {
  const result = await requestJson<{ item: WantedItem }>(`/wanted/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  return result.item;
}

export async function deleteWantedItem(id: string): Promise<void> {
  await requestJson<{ ok: true }>(`/wanted/${id}`, { method: "DELETE" });
}

export type PhotoDto = {
  id: string;
  url: string;
  kind: string;
  originalName: string | null;
};

async function uploadFile(path: string, file: File): Promise<PhotoDto> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    credentials: "include",
    body: form
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const result = (await response.json()) as { photo: PhotoDto };
  return result.photo;
}

export function uploadModongMainPhoto(modongId: string, file: File) {
  return uploadFile(`/modong/${modongId}/photos/main`, file);
}

export function uploadModongAdditionalPhoto(modongId: string, file: File) {
  return uploadFile(`/modong/${modongId}/photos/additional`, file);
}

export function uploadWantedReferencePhoto(wantedId: string, file: File) {
  return uploadFile(`/wanted/${wantedId}/photos/reference`, file);
}

export async function deletePhoto(photoId: string): Promise<void> {
  await requestJson<unknown>(`/photos/${photoId}`, { method: "DELETE" });
}

// --- Collectible Kinds (public) ---

export type CollectibleKind = {
  id: string;
  name: string;
  isActive: boolean;
};

export async function listCollectibleKinds(): Promise<CollectibleKind[]> {
  const result = await requestJson<{ items: CollectibleKind[] }>(
    "/admin/collectible-kinds"
  );
  return result.items;
}

export async function createCollectibleKind(name: string): Promise<CollectibleKind> {
  const result = await requestJson<{ item: CollectibleKind }>(
    "/admin/collectible-kinds",
    { method: "POST", body: JSON.stringify({ name }) }
  );
  return result.item;
}

export async function updateCollectibleKind(
  id: string,
  patch: { name?: string; isActive?: boolean }
): Promise<CollectibleKind> {
  const result = await requestJson<{ item: CollectibleKind }>(
    `/admin/collectible-kinds/${id}`,
    { method: "PATCH", body: JSON.stringify(patch) }
  );
  return result.item;
}

export async function deleteCollectibleKind(id: string): Promise<void> {
  await requestJson<unknown>(`/admin/collectible-kinds/${id}`, {
    method: "DELETE"
  });
}

// --- Modong list ---

export type ModongItem = {
  id: string;
  name: string;
  state: ModongState;
  collectibleKind: { id: string; name: string } | null;
  releaseYear: number | null;
  acquisitionYear: number | null;
  releasedAwayYear: number | null;
  acquisitionSource: string | null;
  purchaseAmount: string | null;
  purchaseCurrency: string;
  releaseAmount: string | null;
  releaseCurrency: string;
  storageNote: string | null;
  privateNote: string | null;
  galleryVisible: boolean;
  mainPhoto: { id: string; url: string } | null;
  additionalPhotos: Array<{ id: string; url: string }>;
};

export async function listModong(): Promise<ModongItem[]> {
  const result = await requestJson<{ items: ModongItem[] }>("/modong");
  return result.items;
}

export async function updateModongItem(
  id: string,
  payload: Partial<{
    name: string;
    state: ModongState;
    collectibleKindId: string;
    releaseYear: number | null;
    acquisitionYear: number | null;
    releasedAwayYear: number | null;
    acquisitionSource: string;
    storageNote: string;
    privateNote: string;
    purchaseAmount: number | null;
    purchaseCurrency: string;
    releaseAmount: number | null;
    releaseCurrency: string;
    galleryVisible: boolean;
  }>
): Promise<ModongItem> {
  const result = await requestJson<{ item: ModongItem }>(`/modong/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  return result.item;
}

export async function deleteModongItem(id: string): Promise<void> {
  await requestJson<unknown>(`/modong/${id}`, { method: "DELETE" });
}

// --- Modong Groups ---

export type ModongGroup = {
  id: string;
  name: string;
  note: string | null;
  itemCount: number;
};

export type ModongGroupDetail = ModongGroup & {
  items: Array<{
    modongId: string;
    addedAt: string;
    modong: { id: string; name: string; state: string };
  }>;
};

export async function listModongGroups(): Promise<ModongGroup[]> {
  const result = await requestJson<{ items: ModongGroup[] }>("/modong-groups");
  return result.items;
}

export async function getModongGroup(id: string): Promise<ModongGroupDetail> {
  const result = await requestJson<{ item: ModongGroupDetail }>(`/modong-groups/${id}`);
  return result.item;
}

export async function createModongGroup(name: string, note?: string): Promise<ModongGroup> {
  const result = await requestJson<{ item: ModongGroup }>("/modong-groups", {
    method: "POST",
    body: JSON.stringify({ name, note })
  });
  return result.item;
}

export async function updateModongGroup(id: string, name: string, note?: string | null): Promise<ModongGroup> {
  const result = await requestJson<{ item: ModongGroup }>(`/modong-groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name, note })
  });
  return result.item;
}

export async function deleteModongGroup(id: string): Promise<void> {
  await requestJson<unknown>(`/modong-groups/${id}`, { method: "DELETE" });
}

export async function addModongToGroup(groupId: string, modongId: string): Promise<void> {
  await requestJson<unknown>(`/modong-groups/${groupId}/items`, {
    method: "POST",
    body: JSON.stringify({ modongId })
  });
}

// --- Gallery ---

export type GalleryItem = {
  id: string;
  name: string;
  state: string;
  collectibleKind: string | null;
  releaseYear: number | null;
  acquisitionYear: number | null;
  mainPhotoUrl: string | null;
};

export type GalleryResponse = {
  owner: { displayName: string; handle: string };
  items: GalleryItem[];
};

export async function getOwnerGallery(handle: string): Promise<GalleryResponse> {
  return requestJson<GalleryResponse>(`/owners/${handle}/gallery`);
}

// --- Community feed ---

export type CommunityItem = {
  id: string;
  name: string;
  state: string;
  collectibleKind: { id: string; name: string } | null;
  mainPhotoUrl: string | null;
  ownerHandle: string;
  ownerDisplayName: string;
};

export async function getCommunityFeed(kindId?: string): Promise<CommunityItem[]> {
  const path = kindId
    ? `/community?kindId=${encodeURIComponent(kindId)}`
    : "/community";
  const result = await requestJson<{ items: CommunityItem[] }>(path);
  return result.items;
}

// --- Public share view ---

export type ShareModongPayload = {
  kind: "MODONG";
  modong: {
    name: string;
    state: string;
    releaseYear: number | null;
    acquisitionYear: number | null;
    collectibleKind: string | null;
    mainPhotoUrl: string | null;
    ownerDisplayName: string;
  };
};

export type ShareGroupPayload = {
  kind: "MODONG_GROUP";
  group: {
    name: string;
    ownerDisplayName: string;
    totalCount: number;
    featuredPhotos: string[];
    modong: Array<{
      id: string;
      name: string;
      state: string;
      releaseYear: number | null;
      acquisitionYear: number | null;
      collectibleKind: string | null;
      mainPhotoUrl: string | null;
    }>;
  };
};

export type ShareWantedPayload = {
  kind: "WANTED";
  wanted: {
    name: string;
    state: string;
    referencePhotoUrl: string | null;
    ownerDisplayName: string;
    phrase: string;
  };
};

export type SharePayload = ShareModongPayload | ShareGroupPayload | ShareWantedPayload;

export async function getPublicShare(token: string): Promise<SharePayload> {
  return requestJson<SharePayload>(`/shares/${token}`);
}

// --- Shares ---

export async function createModongShare(modongId: string): Promise<string> {
  const result = await requestJson<{ token: string }>("/shares", {
    method: "POST",
    body: JSON.stringify({ kind: "MODONG", modongId })
  });
  return result.token;
}

export async function createModongGroupShare(
  modongGroupId: string,
  featuredModongIds: string[] = []
): Promise<string> {
  const result = await requestJson<{ token: string }>("/shares", {
    method: "POST",
    body: JSON.stringify({
      kind: "MODONG_GROUP",
      modongGroupId,
      featuredModongIds
    })
  });
  return result.token;
}

export async function createWantedShare(wantedItemId: string): Promise<string> {
  const result = await requestJson<{ token: string }>("/shares", {
    method: "POST",
    body: JSON.stringify({ kind: "WANTED", wantedItemId })
  });
  return result.token;
}

export async function revokeShare(token: string): Promise<void> {
  await requestJson<unknown>(`/shares/${token}`, { method: "DELETE" });
}

// --- Wanted Lists ---

export type WantedList = {
  id: string;
  name: string;
  itemCount: number;
};

export async function listWantedLists(): Promise<WantedList[]> {
  const result = await requestJson<{ items: WantedList[] }>("/wanted-lists");
  return result.items;
}

export async function createWantedList(name: string): Promise<WantedList> {
  const result = await requestJson<{ item: WantedList }>("/wanted-lists", {
    method: "POST",
    body: JSON.stringify({ name })
  });
  return result.item;
}

export async function updateWantedList(id: string, name: string): Promise<WantedList> {
  const result = await requestJson<{ item: WantedList }>(`/wanted-lists/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name })
  });
  return result.item;
}

export async function deleteWantedList(id: string): Promise<void> {
  await requestJson<unknown>(`/wanted-lists/${id}`, { method: "DELETE" });
}

export async function removeModongFromGroup(groupId: string, modongId: string): Promise<void> {
  await requestJson<unknown>(`/modong-groups/${groupId}/items/${modongId}`, {
    method: "DELETE"
  });
}
