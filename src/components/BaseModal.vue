<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button class="btn btn-icon" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn btn-primary" @click="$emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Save'
  }
})

defineEmits(['close', 'confirm'])
</script>
