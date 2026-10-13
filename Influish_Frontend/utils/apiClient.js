/**
 * Resilient Network Client with Timeout & Retry Protection
 * 
 * Designed to handle server spin-up latency (e.g., Render cold starts taking ~30-40s)
 * and prevent infinite loading spinners on mobile devices.
 */

export const fetchWithTimeoutAndRetry = async (
  url,
  options = {},
  {
    timeoutMs = 40000,
    retries = 2,
    delayMs = 1500,
  } = {}
) => {
  let attempt = 0;

  while (attempt <= retries) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const fetchOptions = {
        ...options,
        signal: controller ? controller.signal : undefined,
      };

      const response = await fetch(url, fetchOptions);
      if (timeoutId) clearTimeout(timeoutId);
      return response;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      attempt++;

      const isTimeout = err.name === 'AbortError';
      const isNetworkError = !isTimeout;

      console.warn(
        `⚠️ Network request to [${url}] ${isTimeout ? 'timed out' : 'failed'}: ${err.message}. ` +
        `Attempt ${attempt} of ${retries + 1}.`
      );

      if (attempt > retries) {
        if (isTimeout) {
          throw new Error('Connection timed out. The server is warming up or your connection is slow. Please try again.');
        }
        throw err;
      }

      // Exponential backoff delay before retry
      const backoffDelay = delayMs * Math.pow(1.5, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }
};
