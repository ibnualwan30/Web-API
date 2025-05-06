const ViewTransition = {
  // Metode untuk melakukan transisi halaman dengan View Transition API
  transit(updateCallback) {
    // Periksa apakah browser mendukung View Transition API
    if (!document.startViewTransition) {
      // Fallback jika tidak didukung
      updateCallback();
      return;
    }

    // Gunakan View Transition API
    document.startViewTransition(() => {
      updateCallback();
    });
  }
};

export default ViewTransition;