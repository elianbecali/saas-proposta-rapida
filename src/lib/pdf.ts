'use client'

export async function exportProposalAsPdf(elementId: string, filename: string) {
  const { default: jsPDF } = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas')

  const element = document.getElementById(elementId)
  if (!element) throw new Error('Element not found')

  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgHeight = (canvas.height * pageWidth) / canvas.width

  let yOffset = 0
  while (yOffset < imgHeight) {
    pdf.addImage(imgData, 'PNG', 0, -yOffset, pageWidth, imgHeight)
    yOffset += pageHeight
    if (yOffset < imgHeight) pdf.addPage()
  }

  pdf.save(`${filename}.pdf`)
}
