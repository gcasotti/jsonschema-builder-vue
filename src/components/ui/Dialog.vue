<script setup lang="ts">
import PDialog from "primevue/dialog";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    header?: string;
    modal?: boolean;
    class?: string;
  }>(),
  { modal: true },
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();
</script>

<template>
	<PDialog
		:visible="props.visible"
		:header="props.header"
		:modal="props.modal"
		:closable="true"
		:class="props.class"
		appendTo="body"
		:pt="{ mask: { class: 'jscb' } }"
		@update:visible="emit('update:visible', $event)"
	>
		<template v-if="$slots.header" #header>
			<slot name="header" />
		</template>
		<slot />
		<template v-if="$slots.footer" #footer>
			<slot name="footer" />
		</template>
	</PDialog>
</template>
