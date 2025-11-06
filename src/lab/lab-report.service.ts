import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class LabReportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate simple patient report
   */
  async generatePatientReport(patientId: string): Promise<Buffer> {
    // Fetch patient and user data
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: patient.userId || '' },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User data not found');
    }

    // Fetch recent lab results for the patient
    const results = await this.prisma.labResult.findMany({
      where: {
        order: {
          patientId: patientId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return this.createSimpleReportPDF(user, results);
  }

  /**
   * Generate order report
   */
  async generateOrderReport(orderId: string): Promise<Buffer> {
    const order = await this.prisma.labOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Lab order not found');
    }

    const results = await this.prisma.labResult.findMany({
      where: { orderId: orderId },
    });

    return this.createOrderReportPDF(order, results);
  }

  /**
   * Generate department summary report
   */
  async generateDepartmentReport(
    departmentId?: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<Buffer> {
    const whereConditions: any = {};
    
    if (dateFrom) whereConditions.createdAt = { gte: dateFrom };
    if (dateTo) {
      whereConditions.createdAt = whereConditions.createdAt 
        ? { ...whereConditions.createdAt, lte: dateTo }
        : { lte: dateTo };
    }

    const orders = await this.prisma.labOrder.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return this.createDepartmentReportPDF(orders);
  }

  /**
   * Send report as HTTP response
   */
  async sendReportResponse(
    res: Response,
    reportBuffer: Buffer,
    filename: string,
  ): Promise<void> {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(reportBuffer);
  }

  /**
   * Create simple patient report PDF
   */
  private async createSimpleReportPDF(user: any, results: any[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Header
    page.drawText('Laboratory Report', {
      x: 50,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 40;

    // Patient info
    page.drawText(`Patient: ${user.firstName} ${user.lastName}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;

    page.drawText(`Email: ${user.email || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;

    page.drawText(`Phone: ${user.phone || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 40;

    // Results section
    page.drawText('Recent Test Results:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    });

    yPosition -= 30;

    if (results.length === 0) {
      page.drawText('No test results found.', {
        x: 70,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
    } else {
      for (const result of results) {
        if (yPosition < 100) break; // Prevent overflow

        page.drawText(`Test ID: ${result.testId}`, {
          x: 70,
          y: yPosition,
          size: 10,
          font: boldFont,
        });

        yPosition -= 15;

        page.drawText(`Value: ${result.value} ${result.unit || ''}`, {
          x: 90,
          y: yPosition,
          size: 10,
          font: font,
        });

        yPosition -= 15;

        page.drawText(`Status: ${result.status}`, {
          x: 90,
          y: yPosition,
          size: 10,
          font: font,
          color: result.status === 'ABNORMAL' ? rgb(1, 0, 0) : rgb(0, 0.5, 0),
        });

        yPosition -= 25;
      }
    }

    // Footer
    page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: 50,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Create order report PDF
   */
  private async createOrderReportPDF(order: any, results: any[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = 750;

    // Header
    page.drawText('Lab Order Report', {
      x: 50,
      y: yPosition,
      size: 18,
      font: boldFont,
    });

    yPosition -= 40;

    // Order details
    page.drawText(`Order Number: ${order.orderNumber}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;

    page.drawText(`Status: ${order.status}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;

    page.drawText(`Priority: ${order.priority}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 40;

    // Results
    page.drawText('Test Results:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    });

    yPosition -= 30;

    for (const result of results) {
      if (yPosition < 100) break;

      page.drawText(`${result.testId}: ${result.value} ${result.unit || ''}`, {
        x: 70,
        y: yPosition,
        size: 10,
        font: font,
      });

      yPosition -= 15;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Create department report PDF
   */
  private async createDepartmentReportPDF(orders: any[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = 750;

    // Header
    page.drawText('Department Report', {
      x: 50,
      y: yPosition,
      size: 18,
      font: boldFont,
    });

    yPosition -= 40;

    // Stats
    page.drawText(`Total Orders: ${orders.length}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 30;

    // Orders summary
    page.drawText('Recent Orders:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    });

    yPosition -= 30;

    for (const order of orders.slice(0, 15)) {
      if (yPosition < 100) break;

      page.drawText(`${order.orderNumber} - ${order.status} - ${new Date(order.createdAt).toLocaleDateString()}`, {
        x: 70,
        y: yPosition,
        size: 10,
        font: font,
      });

      yPosition -= 15;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}