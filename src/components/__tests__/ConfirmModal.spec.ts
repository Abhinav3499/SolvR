import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmModal from '../ConfirmModal.vue'

describe('ConfirmModal.vue', () => {
  const mountModal = (props: { itemName: string; message?: string }) => {
    return mount(ConfirmModal, {
      props,
      global: {
        stubs: {
          teleport: true
        }
      }
    })
  }

  it('renders item name and message', () => {
    const wrapper = mountModal({
      itemName: 'Binary Trees',
      message: 'This will delete all questions.'
    })

    expect(wrapper.text()).toContain('Binary Trees')
    expect(wrapper.text()).toContain('This will delete all questions.')
  })

  it('emits confirm when Delete button is clicked', async () => {
    const wrapper = mountModal({ itemName: 'Question 1' })

    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('Delete'))
    expect(deleteBtn).toBeDefined()
    await deleteBtn?.trigger('click')

    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('emits close when Cancel button is clicked', async () => {
    const wrapper = mountModal({ itemName: 'Question 1' })

    const cancelBtn = wrapper.findAll('button').find(b => b.text().includes('Cancel'))
    expect(cancelBtn).toBeDefined()
    await cancelBtn?.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
