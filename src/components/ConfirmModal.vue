<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button class="btn btn-icon" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ itemName }}</strong>?</p>
          <p v-if="message" style="color: var(--accent-orange); margin-top: 12px;">
            {{ message }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn btn-danger-solid" @click="$emit('confirm')">
            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    itemName: string
    message?: string
  }>(),
  {
    message: ''
  }
)

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>
