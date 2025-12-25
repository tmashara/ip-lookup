<script setup lang="ts">
import { ref } from 'vue'
import IPLookupInput from './components/IpLookupInput.vue'

const rows = ref([1])
let nextId = 2

function addRow() {
  rows.value.push(nextId++)
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}
</script>

<template>
  <div class="app-container">
    <div class="modal">
      <div class="modal-header">
        <h1 class="modal-title">IP Lookup</h1>
      </div>

      <div class="modal-content">
        <p class="subtitle">Enter one or more IP addresses and get their country</p>

        <button class="add-button" @click="addRow" type="button" aria-label="Add new IP lookup row">
          <svg
            class="add-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M8 1V15M1 8H15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          Add
        </button>

        <div class="rows-container">
          <IPLookupInput
            v-for="(id, index) in rows"
            :key="id"
            :index="index"
            :handleRemove="removeRow"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 800px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.modal-content {
  padding: 32px;
}

.subtitle {
  margin: 0 0 24px 0;
  font-size: 15px;
  color: #666;
}

.add-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #5eb8f5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
}

.add-button:hover {
  background-color: #4a9fd9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(94, 184, 245, 0.3);
}

.add-button:active {
  transform: translateY(0);
}

.add-icon {
  flex-shrink: 0;
}

.rows-container {
  margin-top: 24px;
}
</style>
