// src/App.tsx
import React, { useState } from "react";
import { JournalEntryPage } from "./JournalEntry";
import { TheaterPage } from "./TheaterPage";

function App() {
  const [mode, setMode] = useState<"journal" | "theater">("journal");
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);

  return (
    <>
      {mode === "journal" && (
        <JournalEntryPage
          onDreamCreated={(id) => {
            setCurrentDreamId(id);
            setMode("theater");
          }}
        />
      )}

      {mode === "theater" && currentDreamId && (
        <TheaterPage dreamId={currentDreamId} onExit={() => setMode("journal")} />
      )}
      
    </>
  );
}

export default App;
