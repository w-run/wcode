<script setup lang="ts">
const model = defineModel<string>({ default: '' })

withDefaults(
  defineProps<{
    type?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    type: 'text',
    placeholder: '',
    disabled: false,
  },
)
</script>

<template>
  <div class="input" :class="{ 'input--disabled': disabled }">
    <span v-if="$slots.prefix" class="input__affix">
      <slot name="prefix" />
    </span>
    <input
      v-model="model"
      class="input__field"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
    />
    <span v-if="$slots.suffix" class="input__affix">
      <slot name="suffix" />
    </span>
  </div>
</template>

<style lang="scss" scoped>
.input {
  display: flex;
  align-items: center;
  gap: $space-2;
  min-height: 2.75rem;
  padding: 0 $space-4;
  border-radius: $radius-md;
  background: $color-surface-2;
  transition: background-color 0.2s ease;

  &:focus-within {
    background: $color-accent-light;
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &__field {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.875rem;
    color: $color-text;

    &::placeholder {
      color: $color-text-muted;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__affix {
    display: inline-flex;
    align-items: center;
    color: $color-text-muted;
  }
}
</style>
