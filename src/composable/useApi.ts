// composables/useApi.ts
import axios from "axios";

export async function useApi<T>(endpoint: string, params: Record<string, string | number>) {
  try {
    const response = await axios.get<T>(endpoint, {
      params,
    });

    return {
      data: response.data,
      error: null,
    };
  } catch (err) {
    console.error("API error:", err);
    return {
      data: null,
      error: err,
    };
  }
}
