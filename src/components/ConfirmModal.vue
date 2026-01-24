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
          <button class="btn btn-primary" style="background: var(--accent-red);" @click="$emit('confirm')">
            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  itemName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  }
})

defineEmits(['close', 'confirm'])
</script>
