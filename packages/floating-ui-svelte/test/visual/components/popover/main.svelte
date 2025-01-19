<script lang="ts">
	import Button from "../button.svelte";
	import Popover from "./popover.svelte";
	import { Checkbox } from "bits-ui";
	import Check from "lucide-svelte/icons/check";

	let modal = $state(true);
</script>

<h1 class="text-5xl font-bold mb-8">Popover</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<Popover {modal} bubbles={true}>
		{#snippet children(ref, props)}
			<Button bind:ref={ref.current} {...props}>My button</Button>
		{/snippet}
		{#snippet content({ labelId, descriptionId, close })}
			<h2 id={labelId} class="text-2xl font-bold mb-2">Title</h2>
			<p id={descriptionId} class="mb-2">Description</p>
			<Popover {modal} bubbles={true}>
				{#snippet content({ labelId, descriptionId, close })}
					<h2 id={labelId} class="text-2xl font-bold mb-2">Title</h2>
					<p id={descriptionId} class="mb-2">Description</p>
					<Popover {modal} bubbles={false}>
						{#snippet children(ref, props)}
							<Button bind:ref={ref.current} {...props}
								>My button</Button>
						{/snippet}
						{#snippet content({ labelId, descriptionId, close })}
							<h2 id={labelId} class="text-2xl font-bold mb-2">
								Title
							</h2>
							<p id={descriptionId} class="mb-2">Description</p>
							<button onclick={close} class="font-bold">
								Close
							</button>
						{/snippet}
					</Popover>
					<button onclick={close} class="font-bold"> Close </button>
				{/snippet}
				{#snippet children(ref, props)}
					<Button bind:ref={ref.current} {...props}>My button</Button>
				{/snippet}
			</Popover>

			<button onclick={close} class="font-bold"> Close </button>
		{/snippet}
	</Popover>
</div>

<label class="flex items-center">
	<Checkbox.Root
		class="bg-slate-900 text-white rounded w-5 h-5 mr-2 grid place-items-center shadow"
		checked={modal}
		onCheckedChange={(value) => (modal = value)}>
		{#snippet children({ checked })}
			{#if checked}
				<Check class="size-5" />
			{/if}
		{/snippet}
	</Checkbox.Root>
	Modal focus management
</label>
