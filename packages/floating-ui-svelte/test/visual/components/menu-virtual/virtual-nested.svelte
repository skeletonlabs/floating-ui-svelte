<script lang="ts">
	import { box } from "../../../../src/internal/box.svelte.js";
	import MenuItem from "./menu-item.svelte";
	import Menu from "./menu.svelte";

	const ref = box<HTMLElement | null>(null);
</script>

<div data-testid="value">
	{ref.current?.getAttribute("data-testid")}
</div>

<Menu label="Edit" virtualItemRef={ref}>
	<MenuItem label="Undo" />
	<MenuItem label="Redo" />
	<Menu label="Copy as" data-testid="copy" virtualItemRef={ref}>
		<MenuItem label="Text" />
		<MenuItem label="Video" />
		<Menu label="Image" virtualItemRef={ref}>
			<MenuItem label=".png" />
			<MenuItem label=".jpg" />
			<MenuItem label=".svg" />
			<MenuItem label=".gif" />
		</Menu>
		<MenuItem label="Audio" />
	</Menu>
	<Menu label="Share" virtualItemRef={ref}>
		<MenuItem label="Mail" />
		<MenuItem label="Instagram" />
	</Menu>
</Menu>
