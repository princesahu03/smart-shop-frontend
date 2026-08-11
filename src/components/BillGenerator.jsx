import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateBill = ({
  transaction,
  shopInfo,
  customerName = 'Walk-in Customer'
}) => {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width

    // Colors
    const primary = [30, 58, 95]
    const accent = [245, 158, 11]

    // ── HEADER ──
    doc.setFillColor(...primary)
    doc.rect(0, 0, pageWidth, 42, 'F')

    // Shop Name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(
      shopInfo?.shopName || 'Smart Shop',
      pageWidth / 2, 16,
      { align: 'center' }
    )

    // Subtitle
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'Smart Shop Management System',
      pageWidth / 2, 25,
      { align: 'center' }
    )

    // Contact
    doc.setFontSize(8)
    const contact = [
      shopInfo?.phone && `📞 ${shopInfo.phone}`,
      shopInfo?.email && `✉ ${shopInfo.email}`
    ].filter(Boolean).join('   |   ')

    if (contact) {
      doc.text(contact, pageWidth / 2, 34,
        { align: 'center' }
      )
    }

    // ── BILL INFO ──
    doc.setFillColor(240, 244, 248)
    doc.rect(14, 48, pageWidth - 28, 30, 'F')

    doc.setTextColor(30, 58, 95)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')

    // Left
    doc.text('Bill No:', 18, 58)
    doc.text('Date:', 18, 66)
    doc.text('Time:', 18, 74)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text(
      `#${transaction?._id?.slice(-8)
        .toUpperCase() || 'N/A'}`,
      45, 58
    )
    doc.text(
      new Date(transaction?.createdAt || new Date())
        .toLocaleDateString('en-IN'),
      45, 66
    )
    doc.text(
      new Date(transaction?.createdAt || new Date())
        .toLocaleTimeString('en-IN'),
      45, 74
    )

    // Right
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 58, 95)
    doc.text('Customer:', pageWidth - 85, 58)
    doc.text('Payment:', pageWidth - 85, 66)
    doc.text('Status:', pageWidth - 85, 74)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text(
      customerName.slice(0, 20),
      pageWidth - 50, 58
    )
    doc.text(
      (transaction?.paymentMethod || 'CASH')
        .toUpperCase(),
      pageWidth - 50, 66
    )

    // Status
    const isPaid = !transaction?.remainingAmount ||
      transaction?.remainingAmount === 0
    doc.setTextColor(
      isPaid ? 16 : 239,
      isPaid ? 185 : 68,
      isPaid ? 129 : 68
    )
    doc.setFont('helvetica', 'bold')
    doc.text(
      isPaid ? 'PAID' : 'UDHAR',
      pageWidth - 50, 74
    )

    // ── PRODUCTS TABLE ──
    const tableRows = (transaction?.products || [])
      .map((item, i) => [
        i + 1,
        item.product?.name ||
          item.name || 'Item',
        `Rs.${item.price || 0}`,
        item.quantity || 0,
        `Rs.${item.total || 0}`
      ])

    autoTable(doc, {
      startY: 84,
      head: [['#', 'Product',
        'Price', 'Qty', 'Amount']],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [40, 40, 40]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 75 },
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: {
          halign: 'right',
          fontStyle: 'bold'
        }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    })

    const finalY = doc.lastAutoTable.finalY + 8

    // ── SUMMARY ──
    const boxHeight = transaction?.remainingAmount > 0
      ? 36 : 24

    doc.setFillColor(248, 250, 252)
    doc.rect(
      pageWidth - 82, finalY,
      68, boxHeight, 'F'
    )

    // Total
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 58, 95)
    doc.text('Subtotal:',
      pageWidth - 78, finalY + 9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text(
      `Rs.${transaction?.totalAmount || 0}`,
      pageWidth - 16, finalY + 9,
      { align: 'right' }
    )

    if (transaction?.remainingAmount > 0) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 58, 95)
      doc.text('Paid:',
        pageWidth - 78, finalY + 18)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(16, 185, 129)
      doc.text(
        `Rs.${transaction?.paidAmount || 0}`,
        pageWidth - 16, finalY + 18,
        { align: 'right' }
      )

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(239, 68, 68)
      doc.text('Udhar:',
        pageWidth - 78, finalY + 27)
      doc.text(
        `Rs.${transaction?.remainingAmount}`,
        pageWidth - 16, finalY + 27,
        { align: 'right' }
      )
    }

    // ── TOTAL BAR ──
    const totalY = finalY + boxHeight + 4

    doc.setFillColor(...primary)
    doc.rect(14, totalY, pageWidth - 28, 14, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL', 20, totalY + 9.5)
    doc.text(
      `Rs.${transaction?.totalAmount || 0}`,
      pageWidth - 18, totalY + 9.5,
      { align: 'right' }
    )

    // ── NOTES ──
    if (transaction?.notes) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 116, 139)
      doc.text(
        `Note: ${transaction.notes}`,
        14, totalY + 22
      )
    }

    // ── FOOTER ──
    const footerY =
      doc.internal.pageSize.height - 18

    doc.setDrawColor(226, 232, 240)
    doc.line(14, footerY - 4,
      pageWidth - 14, footerY - 4)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text(
      'Thank you for shopping with us!',
      pageWidth / 2, footerY,
      { align: 'center' }
    )
    doc.text(
      'Powered by Smart Shop Management System',
      pageWidth / 2, footerY + 6,
      { align: 'center' }
    )

    // ── SAVE ──
    const fileName = `Bill-${
      transaction?._id?.slice(-8)
        .toUpperCase() || 'receipt'
    }-${new Date()
      .toLocaleDateString('en-IN')
      .replace(/\//g, '-')}.pdf`

    doc.save(fileName)
    return true

  } catch (error) {
    console.error('PDF Error:', error)
    throw error
  }
}

export default generateBill