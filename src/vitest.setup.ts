/**
 * Injects additional jest matchers, see: https://testing-library.com/docs/svelte-testing-library/setup#vitest
 */
import '@testing-library/jest-dom/vitest';

/**
 * Injects a global afterEach to cleanup, see: https://testing-library.com/docs/svelte-testing-library/api#cleanup
 * TODO: Fix "import '@testing-library/svelte/vitest';" not working (it should be identical)
 */
import { act, cleanup } from '@testing-library/svelte/svelte5';
import { afterEach } from 'vitest';

afterEach(async () => {
	await act();
	cleanup();
});
