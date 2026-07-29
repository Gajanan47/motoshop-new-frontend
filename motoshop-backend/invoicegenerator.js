const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}L`

const formatDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date)

function generateInvoice(orderData, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 })
    const stream = fs.createWriteStream(outputPath)

    stream.on("finish", () => resolve(outputPath))
    stream.on("error", reject)
    doc.on("error", reject)

    doc.pipe(stream)

    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      items = [],
      total = 0,
      gst = 0,
      gstRate = 18,
      createdAt = new Date()
    } = orderData

    const grandTotal = Number(total || 0) + Number(gst || 0)

    const pageLeft = 40
    const pageRight = 555
    const pageWidth = pageRight - pageLeft
    

    // Outer border framing the whole invoice, like the reference form 
    doc.lineWidth(1).strokeColor("#f97316")
    doc.rect(pageLeft, 35, pageWidth, 760).stroke()

    //Title
    doc.font("Helvetica-Bold").fontSize(22).fillColor("#000000")
    doc.text("INVOICE", pageLeft, 55, { width: pageWidth, align: "center" })

    doc.moveTo(pageLeft, 90).lineTo(pageRight, 90).stroke()

    // FROM / Business block (left) and BILL TO block (right)
    const colTop = 105
    const colWidth = pageWidth / 2

    doc.font("Helvetica-Bold").fontSize(10)
    doc.text("FROM", pageLeft + 12, colTop)
    doc.font("Helvetica").fontSize(10)
    doc.text("MotoShop Pvt. Ltd.", pageLeft + 12, colTop + 16)
    doc.text("123 MG Road, Pune", pageLeft + 12, colTop + 31)
    doc.text("Maharashtra, India", pageLeft + 12, colTop + 46)
    doc.text("Contact: +91-9999999999", pageLeft + 12, colTop + 61)

    doc.font("Helvetica-Bold").fontSize(10)
    doc.text("BILL TO", pageLeft + colWidth + 12, colTop)
    doc.font("Helvetica").fontSize(10)
    doc.text(customerName || "-", pageLeft + colWidth + 12, colTop + 16, { width: colWidth - 24 })
    doc.text(customerEmail || "-", pageLeft + colWidth + 12, colTop + 31, { width: colWidth - 24 })
    doc.text(customerPhone || "-", pageLeft + colWidth + 12, colTop + 46, { width: colWidth - 24 })
    doc.text(deliveryAddress || "-", pageLeft + colWidth + 12, colTop + 61, { width: colWidth - 24 })

    // vertical divider between FROM / BILL TO
    doc.moveTo(pageLeft + colWidth, colTop - 5).lineTo(pageLeft + colWidth, colTop + 95).stroke()
    doc.moveTo(pageLeft, colTop + 95).lineTo(pageRight, colTop + 95).stroke()

    // Invoice #, Date, Due Date strip
    const metaTop = colTop + 110
    const metaColWidth = pageWidth / 3

    function metaBox(x, label, value) {
      doc.font("Helvetica-Bold").fontSize(9)
      doc.text(label, x + 10, metaTop)
      doc.font("Helvetica").fontSize(10)
      doc.text(value, x + 10, metaTop + 14)
    }

    metaBox(pageLeft, "INVOICE #", orderId || "-")
    metaBox(pageLeft + metaColWidth, "DATE", formatDate(new Date(createdAt)))
    metaBox(pageLeft + metaColWidth * 2, "STATUS", "Confirmed")

    doc.moveTo(pageLeft + metaColWidth, metaTop - 8).lineTo(pageLeft + metaColWidth, metaTop + 32).stroke()
    doc.moveTo(pageLeft + metaColWidth * 2, metaTop - 8).lineTo(pageLeft + metaColWidth * 2, metaTop + 32).stroke()
    doc.moveTo(pageLeft, metaTop + 32).lineTo(pageRight, metaTop + 32).stroke()

    // Items table 
    const tableTop = metaTop + 50
    const cols = [
      { label: "#", x: pageLeft, width: 25, align: "left" },
      { label: "DESCRIPTION", x: pageLeft + 25, width: 195, align: "left" },
      { label: "QTY", x: pageLeft + 220, width: 45, align: "right" },
      { label: "PRICE", x: pageLeft + 265, width: 75, align: "right" },
      { label: "TAX %", x: pageLeft + 340, width: 50, align: "right" },
      { label: "AMOUNT", x: pageLeft + 390, width: 125, align: "right" }
    ]

    function drawTableHeader(y) {
      doc.font("Helvetica-Bold").fontSize(9)
      cols.forEach((col) => {
        doc.text(col.label, col.x + 6, y, { width: col.width - 10, align: col.align })
      })
      doc.moveTo(pageLeft, y + 16).lineTo(pageRight, y + 16).stroke()
    }

    function drawColumnDividers(yTop, yBottom) {
      let x = pageLeft
      cols.forEach((col) => {
        x += col.width
        if (x < pageRight) {
          doc.moveTo(x, yTop).lineTo(x, yBottom).stroke()
        }
      })
    }

    drawTableHeader(tableTop)

    let y = tableTop + 22
    let pageTableTop = tableTop
    const rowHeight = 26
    const rate = Number(gstRate) || 18

    items.forEach((item, index) => {
      if (y > 700) {
        // close out this page's table box before starting a new page
        doc.moveTo(pageLeft, y).lineTo(pageRight, y).stroke()
        drawColumnDividers(pageTableTop, y)
        doc.rect(pageLeft, pageTableTop - 5, pageWidth, y - pageTableTop + 5).stroke()
        doc.rect(pageLeft, y - 6, pageWidth, 24).fill("#f97316")
        doc.fillColor("#ffffff")

        doc.addPage()
        y = 60
        drawTableHeader(y)
        pageTableTop = y
        y += 22
      }

      const qty = Number(item.qty || 1)
      const price = Number(item.price || 0)
      const amount = qty * price
      const itemName = [item.name, item.company].filter(Boolean).join(" - ")

      doc.font("Helvetica").fontSize(9)
      doc.text(String(index + 1), cols[0].x + 6, y, { width: cols[0].width - 10 })
      doc.text(itemName || "Product", cols[1].x + 6, y, { width: cols[1].width - 10 })
      doc.text(String(qty), cols[2].x + 6, y, { width: cols[2].width - 10, align: "right" })
      doc.text(formatCurrency(price), cols[3].x + 6, y, { width: cols[3].width - 10, align: "right" })
      doc.text(`${rate}%`, cols[4].x + 6, y, { width: cols[4].width - 10, align: "right" })
      doc.text(formatCurrency(amount), cols[5].x + 6, y, { width: cols[5].width - 10, align: "right" })

      y += rowHeight
    })

    const tableBottom = y + 4
    doc.moveTo(pageLeft, tableBottom).lineTo(pageRight, tableBottom).stroke()
    drawColumnDividers(pageTableTop, tableBottom)
    // outer box around this page's portion of the table
    doc.rect(pageLeft, pageTableTop - 5, pageWidth, tableBottom - pageTableTop + 5).stroke()

    // if totals would overflow the page, start a fresh page for them
    if (tableBottom + 110 > 740) {
      doc.addPage()
      y = 60
    } else {
      y = tableBottom
    }

    // Totals block 
    const totalsTop = y + 20
    const totalsLabelX = pageLeft + 340
    const totalsValueX = pageLeft + 390
    const totalsValueWidth = pageRight - totalsValueX

    doc.font("Helvetica").fontSize(10)
    doc.text("Subtotal", totalsLabelX, totalsTop, { width: 60 })
    doc.text(formatCurrency(total), totalsValueX, totalsTop, { width: totalsValueWidth, align: "right" })

    doc.text(`GST (${rate}%)`, totalsLabelX, totalsTop + 18, { width: 60 })
    doc.text(formatCurrency(gst), totalsValueX, totalsTop + 18, { width: totalsValueWidth, align: "right" })

    doc.moveTo(totalsLabelX, totalsTop + 38).lineTo(pageRight, totalsTop + 38).stroke()

    doc.font("Helvetica-Bold").fontSize(12)
    doc.text("TOTAL", totalsLabelX, totalsTop + 46, { width: 60 })
    doc.text(formatCurrency(grandTotal), totalsValueX, totalsTop + 46, { width: totalsValueWidth, align: "right" })

    // Terms & Conditions 
    const termsTop = totalsTop + 80
    doc.font("Helvetica-Bold").fontSize(9)
    doc.text("Terms & Conditions", pageLeft + 10, termsTop)
    doc.font("Helvetica").fontSize(8).fillColor("#444444")
    doc.text(
      "Goods once sold will not be taken back. Please contact support@motoshop.com for any concerns regarding this order.",
      pageLeft + 10,
      termsTop + 14,
      { width: pageWidth - 20 }
    )

    doc.fillColor("#000000").font("Helvetica").fontSize(9)
    doc.text("Thank you for shopping with MotoShop.", pageLeft, 770, { width: pageWidth, align: "center" })

    doc.end()
  })
}

module.exports = { generateInvoice }