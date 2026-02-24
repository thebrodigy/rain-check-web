export interface PredictionResponse {
  location: string;
  willRain: boolean;
  chanceOfRain: string;
}

export async function getPrediction(location: string): Promise<PredictionResponse> {
  const res = await fetch(`/api/predictions?location=${encodeURIComponent(location)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return res.json();
}
