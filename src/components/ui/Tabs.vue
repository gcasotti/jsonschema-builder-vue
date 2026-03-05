<script setup lang="ts">
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";

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
