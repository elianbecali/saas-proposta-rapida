'use client'

export function exportProposalAsPdf(elementId: string, _filename: string) {
  const element = document.getElementById(elementId)
  if (!element) throw new Error('Element not found')
  window.print()
}
