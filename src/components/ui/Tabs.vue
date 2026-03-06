<script setup lang="ts">
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";

const model = defineModel<string>();

defineProps<{
  tabs: { value: string; label: string }[];
  class?: string;
}>();
</script>

<template>
  <Tabs v-model:value="model" :class="$props.class">
    <TabList>
      <Tab v-for="tab in tabs" :key="tab.value" :value="tab.value">
        {{ tab.label }}
      </Tab>
    </TabList>
    <TabPanels>
      <slot />
    </TabPanels>
  </Tabs>
</template>
