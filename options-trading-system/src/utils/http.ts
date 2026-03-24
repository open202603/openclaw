export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'options-trading-system/0.1',
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json() as Promise<T>;
}
