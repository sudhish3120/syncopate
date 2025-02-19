const API_BASE_URL = "http://localhost:8000/api";

export async function fetchHomeMessage() {
    try {
      const res = await fetch(`${API_BASE_URL}/`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("API Fetch Error:", error);
      return null;
    }
  }
