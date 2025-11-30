import { create } from "zustand";

interface NoteStore {
  noteId: string;
  setNoteId: (noteId: string) => void;
}

const useNoteStore = create<NoteStore>((set, get) => {
  return {
    noteId: "",
    setNoteId: (noteId: string) => set({ noteId }),
  };
});

export default useNoteStore;
