import { toPng } from "html-to-image";

// @ts-ignore
import jsPDF from "jspdf";

export const exportToPDF = async (
  elementId: string,
  fileName: string,
  title: string
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id ${elementId} not found`);
      return;
    }

    // Capture the element as image
    const imgData = await toPng(element, {
      quality: 0.95,
      pixelRatio: 2,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const img = new Image();
    img.src = imgData;

    img.onload = () => {
      const imgHeight = (img.height * imgWidth) / img.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add title
      pdf.setFontSize(16);
      pdf.text(title, 15, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, 25);

      // Add images
      position = 35;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight() - 35;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`${fileName}-${new Date().getTime()}.pdf`);
    };
  } catch (error) {
    console.error("PDF export failed:", error);
    throw error;
  }
};

export const exportDataToPDF = async (
  data: any[],
  columns: { label: string; key: string }[],
  fileName: string,
  title: string
) => {
  try {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    pdf.setFontSize(16);
    pdf.text(title, 15, 15);
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, 25);

    // Create table data
    const tableData = data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value).substring(0, 30);
      })
    );

    const columnHeaders = columns.map((col) => col.label);

    // Using basic table rendering
    let yPosition = 35;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const columnWidth = (pdf.internal.pageSize.getWidth() - 30) / columns.length;

    // Draw headers
    pdf.setFont(undefined, "bold");
    pdf.setFillColor(76, 29, 149);
    pdf.setTextColor(255, 255, 255);

    columnHeaders.forEach((header, idx) => {
      pdf.rect(15 + idx * columnWidth, yPosition, columnWidth, 10, "F");
      pdf.text(header, 15 + idx * columnWidth + 2, yPosition + 7, {
        maxWidth: columnWidth - 4,
      });
    });

    // Draw rows
    pdf.setFont(undefined, "normal");
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;

    tableData.forEach((row, rowIdx) => {
      const rowHeight = 8;

      if (yPosition + rowHeight > pageHeight - 10) {
        pdf.addPage();
        yPosition = 15;
      }

      if (rowIdx % 2 === 0) {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(
          15,
          yPosition,
          pdf.internal.pageSize.getWidth() - 30,
          rowHeight,
          "F"
        );
      }

      row.forEach((cell, colIdx) => {
        pdf.text(cell, 15 + colIdx * columnWidth + 2, yPosition + 6, {
          maxWidth: columnWidth - 4,
        });
      });

      yPosition += rowHeight;
    });

    pdf.save(`${fileName}-${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw error;
  }
};
