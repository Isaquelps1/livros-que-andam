// Geocoding usando a API Nominatim (OpenStreetMap)
// Converte Cidade + Bairro em coordenadas (lat, lng)

export interface Coordinates {
  lat: number;
  lng: number;
}

export async function geocodeLocation(
  cidade: string,
  bairro: string
): Promise<Coordinates | null> {
  try {
    const query = `${bairro}, ${cidade}, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1&countrycodes=br`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "JornadaDoLivro-SENAI/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding falhou: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      // Tenta buscar apenas pela cidade se o bairro não for encontrado
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cidade + ", Brasil"
      )}&limit=1&countrycodes=br`;

      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          "User-Agent": "JornadaDoLivro-SENAI/1.0",
        },
      });

      const fallbackData = await fallbackResponse.json();

      if (fallbackData.length === 0) return null;

      return {
        lat: parseFloat(fallbackData[0].lat),
        lng: parseFloat(fallbackData[0].lon),
      };
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error("Erro no geocoding:", error);
    return null;
  }
}
