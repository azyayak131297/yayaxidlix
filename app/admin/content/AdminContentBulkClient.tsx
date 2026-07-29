"use client"

import { useEffect } from "react"

export default function AdminContentBulkClient() {
  useEffect(() => {
    const form = document.querySelector('form[action="/api/admin/content/bulk"]') as HTMLFormElement | null
    if (!form) return

    const selectAllCheckbox = document.getElementById('select-all') as HTMLInputElement | null
    const checkboxes = form.querySelectorAll('input[name="ids"]') as NodeListOf<HTMLInputElement>

    const updateSelectAll = () => {
      if (!selectAllCheckbox) return
      const allChecked = Array.from(checkboxes).every((cb) => cb.checked)
      selectAllCheckbox.checked = allChecked
      selectAllCheckbox.indeterminate = !allChecked && Array.from(checkboxes).some((cb) => cb.checked)
    }

    const handleSubmit = (e: SubmitEvent) => {
      const selected = Array.from(checkboxes).filter((cb) => cb.checked)
      if (selected.length === 0) {
        e.preventDefault()
        alert("Pilih minimal satu konten untuk dihapus.")
        return
      }
      const confirmed = window.confirm(`Yakin ingin menghapus ${selected.length} konten yang dipilih? Aksi ini tidak bisa dibatalkan.`)
      if (!confirmed) {
        e.preventDefault()
      }
    }

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', () => {
        checkboxes.forEach((cb) => {
          cb.checked = selectAllCheckbox.checked
        })
      })
    }

    checkboxes.forEach((cb) => {
      cb.addEventListener('change', updateSelectAll)
    })

    form.addEventListener('submit', handleSubmit)

    return () => {
      if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener('change', () => {})
      }
      checkboxes.forEach((cb) => {
        cb.removeEventListener('change', updateSelectAll)
      })
      form.removeEventListener('submit', handleSubmit)
    }
  }, [])

  return null
}