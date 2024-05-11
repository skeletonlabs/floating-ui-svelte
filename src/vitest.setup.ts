/**
 * Injects additional jest matchers, see: https://testing-library.com/docs/svelte-testing-library/setup#vitest
 */
import '@testing-library/jest-dom/vitest';

/**
 * Injects a global afterEach to cleanup, see: https://testing-library.com/docs/svelte-testing-library/api#cleanup
 */
import { afterEach } from 'vitest';
import { act, cleanup } from '@testing-library/svelte/svelte5';

afterEach(async () => {
	await act();
	cleanup();
});
