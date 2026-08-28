<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useFlagFields, usedAddFlag } from '../composables/useControlPanel'
  import type { RiskFlag, RegisterRiskRulePayload} from '../types/controlPanel.type'

  const props = defineProps<{
    modelValue: boolean
    flag: string | null
    flags: string[]
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    add: [payload: RegisterRiskRulePayload]
  }>()


  const formData = ref({
    name: '',
    code: '',
    flag: '',

    conditions: [
      {
        id: Date.now(),
        type: 'filter',
        field: '',
        operator: '==',
        value: 'true',
        value_field: ''
      }
    ]
  })

  // =========================
  // Modal State
  // =========================

  const isOpen = computed({
    get: () => props.modelValue,

    set: value => {
      emit('update:modelValue', value)
    }
  })

  // =========================
  // Selected Flag
  // =========================

  const selectedFlag = computed<RiskFlag | ''>(() => {
    const baseFlag = props.flags?.[0]

    return (baseFlag as RiskFlag) || ''
  })

  // =========================
  // Flag Fields API
  // =========================

  const {
    data: flagFieldsResponse,
    isLoading: isLoadingFields,
    isError: isFlagFieldsError
  } = useFlagFields(selectedFlag)



  const flagFields = computed(() => {
    return flagFieldsResponse.value?.fields ?? []
  })

  const conditionTypes = computed(() => {
    return flagFieldsResponse.value?.condition_types ?? []
  })


  const { addFlag, isAdding } = usedAddFlag()

  // =========================
  // Generate System Code
  // =========================

  const generateSystemCode = ( name: string): string => {
    const flagsCode = props.flags
      .join('_')
      .toUpperCase()
      .replace(/[^A-Z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')

    const ruleNameCode = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

    if (!ruleNameCode) {
      return flagsCode
        ? `EXTENDED_${flagsCode}`
        : 'EXTENDED'
    }

    if (!flagsCode) {
      return `EXTENDED_${ruleNameCode}`
    }

    return `EXTENDED_${flagsCode}_${ruleNameCode}`
  }


  watch([
      () => formData.value.name,
      () => props.flags
    ],
    ([newName]) => {

      formData.value.code =
        generateSystemCode(
          newName
        )
    },
    {
      deep: true,
      immediate: true
    }
  )



  watch(
    () => props.flag,
    newFlag => {
      formData.value.flag =
        newFlag ?? ''
    },
    {
      immediate: true
    }
  )

  // =========================
  // Set Default Condition
  // =========================

  watch(
    flagFieldsResponse,
    response => {

      if (!response) {
        return
      }

      const firstField = response.fields?.[0]
      const firstConditionType = response.condition_types?.[0]
      const firstCondition = formData.value.conditions[0]

      if (!firstCondition) {
        return
      }

      if (firstField) {
        firstCondition.field = firstField.name
        firstCondition.operator = firstField.operators?.[0] ?? '=='
        firstCondition.value_field = ''
      }

      if (firstConditionType) {
        firstCondition.type = firstConditionType
      }
    }
  )


  const getOperatorsForField = (fieldName: string): string[] => {

    return (
      flagFields.value.find(field => field.name === fieldName)?.operators ?? []
    )
  }

  const getSampleValueForField = (fieldName: string): string => {
    const field = flagFields.value.find(field => field.name === fieldName)
    return field?.sample_value != null
      ? String(field.sample_value)
      : ''
  }

  const getInputTypeForField = (fieldName: string): 'text' | 'number' | 'date' => {
    const field = flagFields.value.find(field => field.name === fieldName)

    if (!field?.type) {
      return 'text'
    }

    switch (field.type.toLowerCase()) {
      case 'number':
      case 'integer':
      case 'float':
        return 'number'

      case 'date':
        return 'date'

      case 'string':
      case 'text':
      default:
        return 'text'
    }
  }


  const handleValueFieldInput = (
    event: Event,
    condition: {
      field: string
      value_field: string
    }
  ) => {
    const input = event.target as HTMLInputElement

    condition.value_field = input.value
  }

  // =========================
  // Watch Field Changes
  // =========================

  watch(
    () =>
      formData.value.conditions.map(
        condition => condition.field
      ),

    fields => {

      fields.forEach(
        (fieldName, index) => {
          const condition = formData.value.conditions[index]

          if (!condition) {
            return
          }

          const field = flagFields.value.find(field =>field.name === fieldName)

          if (field) {
            condition.operator = field.operators?.[0] ?? '=='
            condition.value_field = ''
          }
        }
      )
    }
  )

  // =========================
  // Add Condition
  // =========================

  const addCondition = () => {
    const firstField =flagFields.value[0]
    const firstConditionType = conditionTypes.value[0]

    formData.value.conditions.push({
      id: Date.now(),
      type: firstConditionType ?? 'filter',
      field:  firstField?.name ?? '',
      operator: firstField?.operators?.[0] ?? '==',
      value: 'true',
      value_field: ''
    })
  }

  // =========================
  // Remove Condition
  // =========================

  const removeCondition = (index: number) => {
    if (formData.value.conditions.length <= 1) {
      return
    }

    formData.value.conditions.splice(index, 1)
  }

  // =========================
  // Reset Form
  // =========================

  const resetForm = () => {
    formData.value = {
      name: '',
      code: generateSystemCode(''),
      flag: props.flag ?? '',

      conditions: [
        {
          id: Date.now(),
          type: 'filter',
          field: '',
          operator: '==',
          value: 'true',
          value_field: ''
        }
      ]
    }
  }

  // =========================
  // Close Modal
  // =========================

  const close = () => {
    isOpen.value = false
    resetForm()
  }

  // =========================
  // Submit
  // =========================

  const handleAdd = async () => {
    if (!formData.value.name.trim() || !props.flag || props.flags.length === 0) {
      console.warn(
        '[Add Flag] Validation failed:',
        {
          name: formData.value.name,
          flag: props.flag,
          flags: props.flags
        }
      )

      return
    }

    const systemCode = generateSystemCode(formData.value.name)

    const payload: RegisterRiskRulePayload = {
      name: formData.value.name.trim(),
      code: systemCode,
      flag: props.flag,
      flags: props.flags,
      conditions: formData.value.conditions.map(
        condition => ({
          type: condition.type,
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
          value_field: condition.value_field
        })
      )
    }

    try {
      await addFlag(payload)
      emit('add', payload)
      close()
    } catch (error) {
      console.error(
        '[Add Flag] Failed to register rule:',
        error
      )
    }
  }
</script>

<template>
  <div class="modal" :class="{ 'is-active': isOpen }">
    <div class="modal-background custom-backdrop" @click="close"></div>
    <div class="modal-card custom-modal-card">
      <header class="modal-card-head custom-header">
        <p class="modal-card-title is-size-5 has-text-weight-bold">
          Create New Flag Rule
        </p>

        <button class="delete custom-close" aria-label="close" @click="close" ></button>

      </header>


      <section class="modal-card-body custom-body" >

        <div class="columns is-multiline mb-4" >
          <div class="column is-6 pb-0" >
            <div class="field">
              <label class="label is-size-7 text-muted">
                Rule Name
              </label>

              <div class="control">
                <input
                  v-model="formData.name"
                  class="input custom-input"
                  type="text"
                  placeholder="e.g. Test Flag"
                />
              </div>
            </div>
          </div>

          <div class="column is-6 pb-0">
            <div class="field">
              <label class="label is-size-7 text-muted">
                Flags
              </label>

              <div class="control">
                <input :value="props.flags?.[0] ?? ''"
                  class="input custom-input is-disabled-input"
                  type="text"
                  disabled
                />
              </div>
            </div>
          </div>

          <div class="column is-6 pt-3">
            <div class="field">
              <label class="label is-size-7 text-muted">
                System Code
              </label>

              <div class="control">
                <input v-model="formData.code"
                  class="input custom-input is-disabled-input"
                  type="text"
                  disabled
                />
              </div>
            </div>
          </div>


          <div class="column is-6 pt-3">
            <div class="field">
              <label class="label is-size-7 text-muted">
                System Flag
              </label>

              <div class="control">
                <input v-model="formData.flag"
                  class="input custom-input is-disabled-input"
                  type="text"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>


        <template v-if="props.flag">
          <hr class="divider" />

          <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">

            <h3 class="section-title mb-0" >
              Rule Conditions
            </h3>

            <button class="modern-btn btn-outline-teal"
              :disabled="isLoadingFields || flagFields.length === 0"
              @click="addCondition"
            >

              <span class="icon is-small mr-1">
                +
              </span>
              Add Condition
            </button>
          </div>

          <!-- Loading -->
          <div v-if="isLoadingFields" class="has-text-centered py-5">
            <p class="has-text-grey">
              Loading flag fields...
            </p>
          </div>


          <div v-else-if="isFlagFieldsError" class="has-text-centered py-5">
            <p class="has-text-danger">
              Failed to load fields for this flag.
            </p>
          </div>

          <div v-else-if="flagFields.length === 0" class="has-text-centered py-5">
            <p class="has-text-grey">
              No fields available for this flag.
            </p>
          </div>

          <div v-else class="conditions-wrapper">
            <div v-for="(condition,index) in formData.conditions" :key="condition.id" class="condition-row p-4 mb-3">
              <div class="columns is-mobile is-multiline is-vcentered custom-columns mb-2">
                <div class="column is-3-desktop is-6-mobile">
                  <label class="label is-size-7 text-muted mb-1">
                    Type
                  </label>

                  <div class="select is-fullwidth custom-select">
                    <select v-model="condition.type">
                      <option v-for="type in conditionTypes" :key="type" :value="type">
                        {{ type }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Field -->
                <div class="column is-4-desktop is-6-mobile">
                  <label class="label is-size-7 text-muted mb-1">
                    Field
                  </label>
                  <div class="select is-fullwidth custom-select">
                    <select v-model="condition.field">
                      <option value="" disabled>
                        Select a field...
                      </option>
                      <option v-for="field in flagFields" :key="field.name" :value="field.name">
                        {{ field.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Operator -->
                <div class="column is-2-desktop is-5-mobile">

                  <label class="label is-size-7 text-muted mb-1">
                    Operator
                  </label>

                  <div class="select is-fullwidth custom-select">

                    <select v-model="condition.operator" :disabled=" !condition.field ">
                      <option value="" disabled >
                        Select...
                      </option>

                      <option v-for="operator in getOperatorsForField(condition.field)"
                        :key="operator"
                        :value="operator"
                      >
                        {{ operator }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Value -->
                <div class="column is-2-desktop is-5-mobile">
                  <label class="label is-size-7 text-muted mb-1" >
                    Value
                  </label>
                  <div class="select is-fullwidth custom-select">
                    <select v-model="condition.value">
                      <option value="true" >
                        True
                      </option>

                      <option value="false">
                        False
                      </option>
                    </select>
                  </div>
                </div>

                <div class="column is-1-desktop is-2-mobile is-flex is-justify-content-flex-end is-align-self-end">
                  <button class="modern-btn btn-danger-icon"
                    :disabled=" formData.conditions.length === 1"
                    title="Remove Condition"
                    @click=" removeCondition(index) "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M18 6L6 18"/>
                      <path d="M6 6L18 18"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="columns is-mobile custom-columns mt-1">
                <div class="column is-12">

                  <label class="label is-size-7 text-muted mb-1">
                    Value Field

                    <span
                      v-if="getSampleValueForField(condition.field)"
                      class="has-text-grey-light ml-1"
                    >
                      (Sample: {{ getSampleValueForField(condition.field) }})
                    </span>
                  </label>

                  <input
                    v-model="condition.value_field"
                    class="input custom-input"
                    :type="getInputTypeForField(condition.field)"
                    :placeholder="'Enter value...'"
                    @input="handleValueFieldInput($event, condition)"
                  />

                </div>
              </div>
            </div>
          </div>
        </template>
      </section>

      <footer class="modal-card-foot custom-footer">

        <button class="modern-btn btn-secondary" :disabled="isAdding" @click="close">
          Cancel
        </button>

        <button class="modern-btn btn-primary"
          :disabled="
            !formData.name.trim() ||
            !props.flag ||
            isLoadingFields ||
            isAdding ||
            flagFields.length === 0
          "
          @click="handleAdd"
        >

          {{
            isAdding
              ? 'Saving...'
              : 'Save Configuration'
          }}

        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
  .text-muted {
    color: #64748b !important;
  }

  .section-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
  }

  .divider {
    margin: 1.5rem 0;
    background-color: #e2e8f0;
    height: 1px;
    border: none;
  }

  .custom-backdrop {
    background-color: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
  }

  .custom-modal-card {
    max-width: 850px;
    width: 95%;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .custom-header {
    background: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    padding: 1.25rem 1.75rem;
  }

  .custom-body {
    padding: 1.75rem;
    background-color: #f8fafc;
  }

  .custom-footer {
    background: #ffffff;
    border-top: 1px solid #f1f5f9;
    padding: 1.25rem 1.75rem;
    gap: 0.75rem;
    display: flex;
    justify-content: flex-end;
  }

  .modern-btn {
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    height: 38px;
  }

  .modern-btn:active:not(:disabled) {
    transform: scale(0.96);
  }

  .btn-primary {
    background: linear-gradient(
      135deg,
      #14b8a6 0%,
      #0d9488 100%
    );

    color: white;
    padding: 0 1.5rem;

    box-shadow:
      0 4px 12px
      rgba(20, 184, 166, 0.25);
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      #0d9488 0%,
      #0f766e 100%
    );

    box-shadow:
      0 6px 16px
      rgba(20, 184, 166, 0.35);

    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    background: #cbd5e1;
    color: #94a3b8;
    box-shadow: none;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #ffffff;
    color: #475569;
    border: 1px solid #cbd5e1;
    padding: 0 1.25rem;
  }

  .btn-secondary:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    color: #1e293b;
  }

  .btn-outline-teal {
    background: rgba(20, 184, 166, 0.08);
    color: #0d9488;
    border: 1px solid rgba(20, 184, 166, 0.2);
    padding: 0 1rem;
    height: 34px;
  }

  .btn-outline-teal:hover {
    background: #14b8a6;
    color: #ffffff;
    border-color: #14b8a6;

    box-shadow:
      0 4px 10px
      rgba(20, 184, 166, 0.2);
  }

  .btn-danger-icon {
    background: #fff1f2;
    color: #e11d48;
    border: 1px solid #fecdd3;
    width: 36px;
    height: 36px;
    padding: 0;
  }

  .btn-danger-icon:hover:not(:disabled) {
    background: #e11d48;
    color: #ffffff;
    border-color: #e11d48;

    box-shadow:
      0 4px 10px
      rgba(225, 29, 72, 0.25);

    transform: translateY(-1px);
  }

  .btn-danger-icon:disabled {
    opacity: 0.5;
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #cbd5e1;
    cursor: not-allowed;
  }

  .custom-input,
  .custom-select select {
    height: 38px;
    border-radius: 8px !important;
    border: 1px solid #cbd5e1 !important;

    box-shadow:
      0 1px 2px
      rgba(0, 0, 0, 0.02) !important;

    background-color: #ffffff;
    transition: all 0.2s ease;
    font-size: 0.875rem;
  }

  .custom-input:focus:not(:disabled),

  .custom-select select:focus {
    border-color: #14b8a6 !important;

    box-shadow:
      0 0 0 3px
      rgba(20, 184, 166, 0.15) !important;

    outline: none;
  }

  .is-disabled-input {
    background-color: #f1f5f9 !important;
    color: #94a3b8 !important;
    border-color: #e2e8f0 !important;
    cursor: not-allowed;
    box-shadow: none !important;
  }

  .conditions-wrapper {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 8px;
  }

  .condition-row {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background-color: #ffffff;

    box-shadow:
      0 2px 4px
      rgba(0, 0, 0, 0.02);

    transition:
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  .condition-row:hover {
    box-shadow:
      0 4px 12px
      rgba(0, 0, 0, 0.05);

    border-color: #cbd5e1;
  }

  .custom-columns {
    margin-bottom: 0 !important;
  }

  .custom-columns .column {
    padding-bottom: 0.25rem;
    padding-top: 0.25rem;
  }

  /* Custom Scrollbar */

  .conditions-wrapper::-webkit-scrollbar {
    width: 6px;
  }

  .conditions-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }

  .conditions-wrapper::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }

  .conditions-wrapper::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .custom-close {
    background-color: transparent;
    transition: background-color 0.2s ease;
  }

  .custom-close::before,
  .custom-close::after {
    background-color: #94a3b8;
  }

  .custom-close:hover {
    background-color: #f1f5f9;
  }

  .custom-close:hover::before,
  .custom-close:hover::after {
    background-color: #475569;
  }

</style>
