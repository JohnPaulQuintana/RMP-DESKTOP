<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMonitoringFilterStore } from '@/stores/monitoringFilter'
import { storeToRefs } from 'pinia'

const filterStore = useMonitoringFilterStore()

const {
  startDate: selectedStartDate,
  endDate: selectedEndDate,
  endpoints: selectedEndpoints,
  availableEndpoints
} = storeToRefs(filterStore)

const props = withDefaults(
  defineProps<{
    mode?: 'full' | 'date'
    viewMode?: 'table' | 'line' | 'heatmap'
  }>(),
  {
    mode: 'full',
    viewMode: 'table'
  }
)

/* ==========================================================================
   DATE FILTER DROPDOWN
   ========================================================================== */

type PresetMode = 'daily' | 'weekly'

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const activePreset = ref<PresetMode>('daily')

const today = new Date().toISOString().split('T')[0] ?? ''

/* ==========================================================================
   LOCAL START / END DATE
   ========================================================================== */

const localStartDate = ref(
  selectedStartDate.value || today
)

const localEndDate = ref(
  selectedEndDate.value || today
)

/* ==========================================================================
   DATE VALIDATION ERROR
   ========================================================================== */

const dateError = ref('')

/* ==========================================================================
   DROPDOWN
   ========================================================================== */

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value

  if (isDropdownOpen.value) {
    dateError.value = ''
  }
}

const closeDropdown = (e: MouseEvent) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(e.target as Node)
  ) {
    isDropdownOpen.value = false
    dateError.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

/* ==========================================================================
   QUICK PRESETS
   ========================================================================== */

const setPreset = (mode: PresetMode) => {
  activePreset.value = mode

  /* Clear any previous validation error */
  dateError.value = ''

  const todayDate = new Date()

  if (mode === 'daily') {
    const todayStr =
      todayDate.toISOString().split('T')[0] ?? ''

    localStartDate.value = todayStr
    localEndDate.value = todayStr
  }

  if (mode === 'weekly') {
    /* End Date = Yesterday */
    const yesterday = new Date(todayDate)

    yesterday.setDate(
      todayDate.getDate() - 1
    )

    /* Start Date = 6 days before yesterday */
    const sevenDaysAgo = new Date(yesterday)

    sevenDaysAgo.setDate(
      yesterday.getDate() - 6
    )

    localStartDate.value =
      sevenDaysAgo.toISOString().split('T')[0] ?? ''

    localEndDate.value =
      yesterday.toISOString().split('T')[0] ?? ''
  }
}

/* ==========================================================================
   DATE DISPLAY
   ========================================================================== */

const formatFullDate = (dateStr: string) => {
  if (!dateStr) return ''

  return new Date(dateStr).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }
  )
}

const dateRangeDisplay = computed(() => {
  if (
    !localStartDate.value ||
    !localEndDate.value
  ) {
    return {
      start: 'Select Date Range',
      end: null
    }
  }

  const formattedStart =
    formatFullDate(localStartDate.value)

  const formattedEnd =
    formatFullDate(localEndDate.value)

  /* Same date = display only one date */
  if (
    localStartDate.value ===
    localEndDate.value
  ) {
    return {
      start: formattedStart,
      end: null
    }
  }

  return {
    start: formattedStart,
    end: formattedEnd
  }
})

/* ==========================================================================
   APPLY DATE FILTER
   ========================================================================== */

const applyDateFilter = () => {
  dateError.value = ''

  /*
   * Date validation happens ONLY here.
   *
   * The user is allowed to select/type any start/end
   * combination before pressing Apply Filter.
   */
  if (
    localStartDate.value &&
    localEndDate.value &&
    localStartDate.value > localEndDate.value
  ) {
    dateError.value =
      'Start Date cannot be later than End Date.'

    return
  }

  /*
   * Only update the actual filter store after
   * validation succeeds.
   */
  selectedStartDate.value =
    localStartDate.value

  selectedEndDate.value =
    localEndDate.value

  isDropdownOpen.value = false
}

/* ==========================================================================
   CANCEL DATE FILTER
   ========================================================================== */

const cancelDateFilter = () => {
  /*
   * Restore the local values from the currently
   * applied filter when cancelling.
   */
  localStartDate.value =
    selectedStartDate.value || today

  localEndDate.value =
    selectedEndDate.value || today

  dateError.value = ''

  isDropdownOpen.value = false
}

/* ==========================================================================
   ENDPOINT FILTER
   ========================================================================== */

const search = ref('')

const filteredEndpoints = computed(() => {
  if (!search.value) {
    return availableEndpoints.value
  }

  return availableEndpoints.value.filter(
    endpoint =>
      endpoint
        .toLowerCase()
        .includes(
          search.value.toLowerCase()
        )
  )
})

const clearSelection = () => {
  selectedEndpoints.value = []
}

const selectAll = () => {
  selectedEndpoints.value = [
    ...availableEndpoints.value
  ]
}

/* ==========================================================================
   AUTOMATICALLY SELECT ALL AVAILABLE ENDPOINTS
   ========================================================================== */

watch(
  availableEndpoints,
  (newEndpoints) => {
    if (
      newEndpoints.length &&
      selectedEndpoints.value.length === 0
    ) {
      selectedEndpoints.value = [
        ...newEndpoints
      ]
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div class="filter-panel">
    <p class="menu-label mb-2">
      Analytics Filters
    </p>

    <div class="filter-card">

      <!-- ================================================================
           DATE FILTER DROPDOWN
      ================================================================= -->

      <div
        class="date-picker-wrapper mt-2"
        ref="dropdownRef"
      >
        <label class="filter-label mb-1">
          Date Filter
        </label>

        <!-- Trigger Button -->
        <button
          class="date-range-trigger"
          :class="{ active: isDropdownOpen }"
          @click.stop="toggleDropdown"
        >
          <div class="trigger-left">
            <span class="calendar-icon">
              📅
            </span>

            <!-- Conditional Single or Stacked Display -->
            <div class="range-stacked">
              <span class="date-line">
                {{ dateRangeDisplay.start }}
              </span>

              <span
                v-if="dateRangeDisplay.end"
                class="date-line"
              >
                {{ dateRangeDisplay.end }}
              </span>
            </div>
          </div>

          <span
            class="chevron-icon"
            :class="{ open: isDropdownOpen }"
          >
            ▾
          </span>
        </button>

        <!-- ================================================================
             DROPDOWN POPOVER
        ================================================================= -->

        <div
          v-if="isDropdownOpen"
          class="date-dropdown-popover"
        >

          <!-- ============================================================
               PRESET TABS
          ============================================================= -->

          <div class="preset-tabs mb-3">
            <button
              class="tab-btn"
              :class="{
                active: activePreset === 'daily'
              }"
              @click="setPreset('daily')"
            >
              Daily
            </button>

            <button
              class="tab-btn"
              :class="{
                active: activePreset === 'weekly'
              }"
              @click="setPreset('weekly')"
            >
              Weekly
            </button>
          </div>

          <!-- ============================================================
               START / END DATE INPUTS
          ============================================================= -->

          <div class="range-inputs-vertical mb-3">

            <!-- Start Date -->
            <div class="input-group">
              <span class="input-sublabel">
                Start Date
              </span>

              <input
                type="date"
                v-model="localStartDate"
                class="modern-date-input"
              />
            </div>

            <!-- End Date -->
            <div class="input-group">
              <span class="input-sublabel">
                End Date
              </span>

              <input
                type="date"
                v-model="localEndDate"
                class="modern-date-input"
              />
            </div>

            <!-- Validation Error -->
            <div
              v-if="dateError"
              class="date-error"
            >
              {{ dateError }}
            </div>

          </div>

          <!-- ============================================================
               POPOVER FOOTER
          ============================================================= -->

          <div class="popover-footer">

            <button
              class="cancel-btn"
              @click="cancelDateFilter"
            >
              Cancel
            </button>

            <button
              class="apply-btn"
              @click="applyDateFilter"
            >
              Apply Filter
            </button>

          </div>

        </div>
      </div>

      <!-- ================================================================
           TIME RANGE
      ================================================================= -->

      <!--
      <div
        v-if="props.mode === 'full'"
        class="time-range-wrapper mt-4"
      >
        <label class="filter-label mb-2">
          Time Range
        </label>

        <div class="time-range-grid">
          <div>
            <span class="time-label">
              From
            </span>

            <div class="select is-small is-fullwidth">
              <select v-model="startTime">
                <option
                  v-for="time in availableTimes"
                  :key="time"
                  :value="time"
                >
                  {{ time }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <span class="time-label">
              To
            </span>

            <div class="select is-small is-fullwidth">
              <select v-model="endTime">
                <option
                  v-for="time in availableTimes"
                  :key="time"
                  :value="time"
                >
                  {{ time }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      -->

      <!-- ================================================================
           ENDPOINT HEADER
      ================================================================= -->

      <div
        v-if="
          props.mode === 'full' &&
          props.viewMode !== 'table'
        "
        class="endpoint-header mt-5 mb-3"
      >
        <div>
          <label class="filter-label mb-1">
            Endpoints
          </label>

          <small class="endpoint-count">
            {{ selectedEndpoints.length }}
            of
            {{ availableEndpoints.length }}
            selected
          </small>
        </div>

        <div class="endpoint-actions">
          <button
            class="action-link"
            @click="selectAll"
          >
            All
          </button>

          <button
            class="action-link"
            @click="clearSelection"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- ================================================================
           ENDPOINT LIST
      ================================================================= -->

      <div
  v-if="
    props.mode === 'full' &&
    props.viewMode !== 'table'
  "
  class="endpoint-list"
>
        <label
          v-for="endpoint in filteredEndpoints"
          :key="endpoint"
          class="endpoint-item"
          :class="{
            active:
              selectedEndpoints.includes(endpoint)
          }"
          :title="endpoint"
        >
          <input
            v-model="selectedEndpoints"
            type="checkbox"
            :value="endpoint"
          />

          <span class="endpoint-name">
            {{ endpoint }}
          </span>
        </label>

        <div
          v-if="filteredEndpoints.length === 0"
          class="empty-state"
        >
          No endpoint found
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
  /* ==========================
    FILTER PANEL & CARDS
  ========================== */
  .filter-panel {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #ececec;
  }

  .menu-label {
    margin-bottom: .5rem;
    font-size: .75rem;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #8a8a8a;
  }

  .filter-card {
    padding: 10px;
    background: #fafafa;
    border: 1px solid #ececec;
    border-radius: 8px;
  }

  .filter-label {
    display: block;
    margin-bottom: 8px;
    font-size: .78rem;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: #555;
  }

  /* ==========================
    DYNAMIC SINGLE / MULTI-LINE TRIGGER
  ========================== */
  .date-picker-wrapper {
    position: relative;
    width: 100%;
  }

  .date-range-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-height: 42px;
    padding: 8px 12px;
    background: #ffffff;
    border: 1px solid #dcdfe6;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }

  .date-range-trigger:hover,
  .date-range-trigger.active {
    border-color: #f14668;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(241, 70, 104, 0.1);
  }

  .trigger-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .calendar-icon {
    font-size: 14px;
    flex-shrink: 0;
  }

  .range-stacked {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .date-line {
    font-size: 0.75rem;
    font-weight: 700;
    color: #374151;
    line-height: 1.2;
    text-align: left;
    white-space: nowrap;
  }

  .chevron-icon {
    font-size: 11px;
    color: #9ca3af;
    flex-shrink: 0;
    margin-left: 4px;
  }

  .chevron-icon.open {
    transform: rotate(180deg);
  }

  /* DROPDOWN POPOVER */
  .date-dropdown-popover {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 99;
    padding: 12px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Preset Tabs */
  .preset-tabs {
    display: flex;
    gap: 4px;
    padding: 3px;
    background: #f3f4f6;
    border-radius: 8px;
  }

  .tab-btn {
    flex: 1;
    padding: 5px 0;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #6b7280;
    cursor: pointer;
  }

  .tab-btn:hover {
    color: #111827;
  }

  .tab-btn.active {
    background: #ffffff;
    color: #f14668;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* Vertical Stacked Range Inputs */
  .range-inputs-vertical {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .input-sublabel {
    font-size: 10px;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
  }

  .modern-date-input {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    outline: none;
  }

  .modern-date-input:focus {
    border-color: #f14668;
  }

  /* Popover Footer */
  .popover-footer {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    padding-top: 8px;
    border-top: 1px solid #f3f4f6;
  }

  .cancel-btn {
    padding: 5px 10px;
    background: transparent;
    border: none;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    cursor: pointer;
  }

  .cancel-btn:hover { color: #111827; }

  .apply-btn {
    padding: 6px 14px;
    background: #f14668;
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    cursor: pointer;
  }

  .apply-btn:hover {
    background: #e03557;
  }

  /* ==========================
    TIME RANGE & ENDPOINTS
  ========================== */
  .time-range-wrapper { width: 100%; }
  .time-range-grid { display: flex; gap: 10px; }
  .time-range-grid > div { flex: 1; }
  .time-label { display: block; margin-bottom: 4px; font-size: 11px; font-weight: 600; color: #777; }
  .select.is-fullwidth { width: 100%; }
  .select select {
    width: 100%;
    border-radius: 10px;
    border-color: #dcdfe6;
    font-size: 13px;
    font-weight: 600;
  }
  .select select:focus {
    border-color: #f14668;
    box-shadow: 0 0 0 .125em rgba(241,70,104,.15);
  }

  .endpoint-header { display: flex; justify-content: space-between; align-items: center; }
  .endpoint-count { font-size: .72rem; color: #999; }
  .endpoint-actions { display: flex; gap: .5rem; }
  .action-link {
    background: none; border: none; padding: 0;
    font-size: .72rem; font-weight: 700; color: #f14668; cursor: pointer;
  }
  .action-link:hover { text-decoration: underline; }

  .endpoint-list {
    display: flex; flex-direction: column; gap: 6px;
    max-height: 340px; overflow-y: auto; padding: 10px;
    background: #fff; border: 1px solid #ececec; border-radius: 12px;
  }

  .endpoint-item {
    display: flex; align-items: center; gap: .75rem;
    padding: .7rem .8rem; border: 1px solid transparent; border-radius: 10px;
  }
  .endpoint-item:hover { background: #fff5f7; border-color: #ffd5de; }
  .endpoint-item.active { background: #fff0f3; border-color: #f14668; }
  .endpoint-item input[type="checkbox"] { width: 16px; height: 16px; accent-color: #f14668; cursor: pointer; }

  .endpoint-name {
    flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
    font-size: .82rem; font-weight: 600; color: #444;
  }

  .empty-state { padding: 2rem 1rem; text-align: center; color: #999; font-size: .8rem; }
</style>
