<script setup lang="ts">
import { CirclePlus, HelpCircle, Info } from "lucide-vue-next";
import { ref, useId } from "vue";
import Badge from "../../components/ui/Badge.vue";
import Button from "../../components/ui/Button.vue";
import Dialog from "../../components/ui/Dialog.vue";
import InputField from "../../components/ui/InputField.vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { useSchemaStore } from "../../hooks/useSchemaStore.ts";
import type { SchemaType } from "../../types/jsonSchema.ts";
import SchemaTypeSelector from "./SchemaTypeSelector.vue";

const props = withDefaults(
  defineProps<{
    path: string[];
    variant?: "primary" | "secondary";
  }>(),
  { variant: "primary" },
);

const store = useSchemaStore();

const dialogOpen = ref(false);
const fieldName = ref("");
const fieldType = ref<SchemaType>("string");
const fieldDesc = ref("");
const fieldRequired = ref(false);
const additionalProperties = ref(true);

const fieldNameId = useId();
const fieldDescId = useId();
const fieldRequiredId = useId();
const fieldTypeId = useId();
const additionalPropertiesId = useId();

const t = useTranslation();

const handleSubmit = (e: Event) => {
  e.preventDefault();
  if (!fieldName.value.trim()) return;

  store.addProperty(props.path, {
    name: fieldName.value,
    type: fieldType.value,
    description: fieldDesc.value,
    required: fieldRequired.value,
    additionalProperties:
      fieldType.value === "object" ? additionalProperties.value : undefined,
  });

  fieldName.value = "";
  fieldType.value = "string";
  fieldDesc.value = "";
  fieldRequired.value = false;
  dialogOpen.value = false;
  additionalProperties.value = true;
};
</script>

<template>
  <Button
    type="button"
    @click="dialogOpen = true"
    :variant="variant === 'primary' ? 'default' : 'outline'"
    size="sm"
    class="flex items-center gap-1.5 group"
  >
    <CirclePlus :size="16" class="group-hover:scale-110 transition-transform" />
    <span>{{ t.fieldAddNewButton }}</span>
  </Button>

  <Dialog
    :visible="dialogOpen"
    @update:visible="dialogOpen = $event"
    class="md:max-w-[1200px] max-h-[85vh] w-[95vw] p-4 sm:p-6 jscb"
  >
    <template #header>
      <div class="mb-4">
        <div class="text-xl flex flex-wrap items-center gap-2">
          {{ t.fieldAddNewLabel }}
          <Badge variant="secondary" class="text-xs">{{ t.fieldAddNewBadge }}</Badge>
        </div>
        <p class="text-sm text-muted-foreground mt-1">{{ t.fieldAddNewDescription }}</p>
      </div>
    </template>

    <form @submit="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-4 min-w-[280px]">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <label :for="fieldNameId" class="text-sm font-medium">{{ t.fieldNameLabel }}</label>
              <Info class="h-4 w-4 text-muted-foreground shrink-0" v-tooltip="t.fieldNameTooltip" />
            </div>
            <InputField
              :id="fieldNameId"
              v-model="fieldName"
              :placeholder="t.fieldNamePlaceholder"
              class="font-mono text-sm w-full"
              :required="true"
            />
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <label :for="fieldDescId" class="text-sm font-medium">{{ t.fieldDescription }}</label>
              <Info class="h-4 w-4 text-muted-foreground shrink-0" v-tooltip="t.fieldDescriptionTooltip" />
            </div>
            <InputField
              :id="fieldDescId"
              v-model="fieldDesc"
              :placeholder="t.fieldDescriptionPlaceholder"
              class="text-sm w-full"
            />
          </div>

          <div class="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
            <input
              type="checkbox"
              :id="fieldRequiredId"
              v-model="fieldRequired"
              class="rounded border-gray-300 shrink-0"
            />
            <label :for="fieldRequiredId" class="text-sm">{{ t.fieldRequiredLabel }}</label>
          </div>

          <div v-if="fieldType === 'object'" class="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
            <input
              type="checkbox"
              :id="additionalPropertiesId"
              v-model="additionalProperties"
              class="rounded border-gray-300 shrink-0"
            />
            <label :for="additionalPropertiesId" class="text-sm">{{ t.additionalPropertiesAllow }}</label>
            <Info class="h-4 w-4 text-muted-foreground shrink-0" v-tooltip="t.additionalPropertiesTooltip" />
          </div>
        </div>

        <div class="space-y-4 min-w-[280px]">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <label :for="fieldTypeId" class="text-sm font-medium">{{ t.fieldType }}</label>
              <HelpCircle class="h-4 w-4 text-muted-foreground shrink-0" v-tooltip="t.fieldTypeTooltipString" />
            </div>
            <SchemaTypeSelector :id="fieldTypeId" v-model="fieldType" />
          </div>

          <div class="rounded-lg border bg-muted/50 p-3 hidden md:block">
            <p class="text-xs font-medium mb-2">{{ t.fieldTypeExample }}</p>
            <code class="text-sm bg-background/80 p-2 rounded block overflow-x-auto">
              <template v-if="fieldType === 'string'">"example"</template>
              <template v-else-if="fieldType === 'number'">42</template>
              <template v-else-if="fieldType === 'boolean'">true</template>
              <template v-else-if="fieldType === 'object'">{ "key": "value" }</template>
              <template v-else-if="fieldType === 'array'">["item1", "item2"]</template>
            </code>
          </div>
        </div>
      </div>

      <div class="mt-6 gap-2 flex-wrap flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="button" variant="outline" size="sm" @click="dialogOpen = false">
          {{ t.fieldAddNewCancel }}
        </Button>
        <Button type="submit" size="sm">{{ t.fieldAddNewConfirm }}</Button>
      </div>
    </form>
  </Dialog>
</template>
