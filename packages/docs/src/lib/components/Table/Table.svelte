<script lang="ts">
import type { TableData } from "$lib/types.js";
interface Props {
	data: TableData[];
}
let { data }: Props = $props();
</script>

<div class="table-wrap">
	<table class="table caption-bottom">
		<tbody class="hover:[&>tr]:bg-surface-500/5">
			{#each data as row}
				<tr>
					<!-- Property -->
					<td>
						<div class="flex items-center gap-2">
							<code class="code">{row.property}</code>
							<!-- Show red dot if required -->
							{#if row.required}
								<div class="bg-rose-500 aspect-square size-1.5 rounded-full"></div>
							{/if}
						</div>
					</td>
					<td class="space-y-1">
						<!-- Description -->
						<p>{row.description}</p>
						<!-- Meta -->
						<div class="flex items-center gap-2">
							{#if row.type}<p class="meta-type" title="Type">{row.type}</p>{/if}
							{#if row.default}<p class="meta-default" title="Default">{row.default}</p>{/if}
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
