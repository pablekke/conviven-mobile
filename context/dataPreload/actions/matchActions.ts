import { chatService } from "../../../features/chat/services";
import { Match } from "../../../features/chat/types";
import { createTimeoutPromise } from "../utils";
import { DataPreloadState } from "../types";
import React from "react";

export const loadMatchesAction = async (
  setState: React.Dispatch<React.SetStateAction<DataPreloadState>>,
  forceRefresh: boolean = false,
  silent: boolean = false,
) => {
  try {
    if (!silent) {
      setState(prev => ({ ...prev, matchesLoading: true, matchesError: null }));
    }

    const timeoutPromise = createTimeoutPromise("Matches timeout", 15000);

    const matches = (await Promise.race([
      chatService.getMatches(forceRefresh),
      timeoutPromise,
    ])) as Match[];

    setState(prev => ({
      ...prev,
      matches,
      matchesLoading: false,
      matchesError: null,
      matchesLastUpdated: Date.now(),
    }));
  } catch (error) {
    console.error("Error precargando matches:", error);
    if (!silent) {
      setState(prev => ({
        ...prev,
        matches: [],
        matchesLoading: false,
        matchesError: error instanceof Error ? error : new Error("Error desconocido"),
        matchesLastUpdated: null,
      }));
    }
  }
};
