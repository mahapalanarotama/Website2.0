import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export async function uploadPosterImage(file: File, posterId: string): Promise<string> {
  const storage = getStorage();
  const imageRef = ref(storage, `posters/${posterId}`);
  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
}

export async function deletePosterImage(posterId: string): Promise<void> {
  const storage = getStorage();
  const imageRef = ref(storage, `posters/${posterId}`);
  await deleteObject(imageRef);
}
