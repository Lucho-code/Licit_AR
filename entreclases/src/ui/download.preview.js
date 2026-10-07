// Vista previa (Artifact): el visor ofrece el archivo con su propia confirmación.
// Devuelve 'saved', 'declined' o null si en esta vista no se pueden guardar archivos.
export async function offerFile(filename, text) {
  const downloads = await globalThis.claude?.use?.('downloads');
  if (!downloads) return null;
  try {
    await downloads.save({ filename, data: text });
    return 'saved';
  } catch (err) {
    return err?.code === 'declined' ? 'declined' : null;
  }
}
