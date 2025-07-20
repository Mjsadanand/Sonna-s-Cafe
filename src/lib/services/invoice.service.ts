import { db } from '@/lib/db';
import { orders, orderItems, menuItems, users, addresses } from '@/lib/db/schema';
import { eq, and, between, sql } from 'drizzle-orm';
import { AppError } from '@/lib/utils';
import { format } from 'date-fns';

export interface InvoiceData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderDate: Date;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentStatus: string;
  gstNumber?: string;
}

export class InvoiceService {
  static async getInvoiceData(orderId: string): Promise<InvoiceData> {
    try {
      // Get order details with customer and address information
      const [orderResult] = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          subtotal: orders.subtotal,
          tax: orders.tax,
          deliveryFee: orders.deliveryFee,
          discount: orders.discount,
          total: orders.total,
          paymentStatus: orders.paymentStatus,
          createdAt: orders.createdAt,
          customer: {
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phone: users.phone
          },
          deliveryAddress: {
            addressLine1: addresses.addressLine1,
            addressLine2: addresses.addressLine2,
            city: addresses.city,
            state: addresses.state,
            postalCode: addresses.postalCode,
            country: addresses.country
          }
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .leftJoin(addresses, eq(orders.deliveryAddressId, addresses.id))
        .where(eq(orders.id, orderId));

      if (!orderResult) {
        throw new AppError('Order not found', 404);
      }

      // Get order items
      const orderItemsResult = await db
        .select({
          name: menuItems.name,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice
        })
        .from(orderItems)
        .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
        .where(eq(orderItems.orderId, orderId));

      return {
        id: orderResult.id,
        orderNumber: orderResult.orderNumber,
        customerName: `${orderResult.customer?.firstName || ''} ${orderResult.customer?.lastName || ''}`.trim() || 'Unknown Customer',
        customerEmail: orderResult.customer?.email || '',
        customerPhone: orderResult.customer?.phone || undefined,
        deliveryAddress: {
          addressLine1: orderResult.deliveryAddress?.addressLine1 || '',
          addressLine2: orderResult.deliveryAddress?.addressLine2 || undefined,
          city: orderResult.deliveryAddress?.city || '',
          state: orderResult.deliveryAddress?.state || '',
          postalCode: orderResult.deliveryAddress?.postalCode || '',
          country: orderResult.deliveryAddress?.country || 'India'
        },
        orderDate: orderResult.createdAt,
        items: orderItemsResult.map(item => ({
          name: item.name || 'Unknown Item',
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        })),
        subtotal: Number(orderResult.subtotal),
        tax: Number(orderResult.tax),
        deliveryFee: Number(orderResult.deliveryFee),
        discount: Number(orderResult.discount),
        total: Number(orderResult.total),
        paymentStatus: orderResult.paymentStatus
      };
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      throw new AppError('Failed to fetch invoice data', 500);
    }
  }

  static async generateInvoiceHTML(orderId: string): Promise<string> {
    try {
      const invoiceData = await this.getInvoiceData(orderId);

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice - ${invoiceData.orderNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #e74c3c;
            }
            .invoice-info {
              text-align: right;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .company-info {
              margin-bottom: 30px;
            }
            .billing-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .info-section {
              width: 48%;
            }
            .info-section h3 {
              margin-bottom: 10px;
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .table-container {
              margin-bottom: 30px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .items-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .items-table td.quantity,
            .items-table td.price {
              text-align: right;
            }
            .totals {
              margin-left: auto;
              width: 300px;
            }
            .totals table {
              width: 100%;
              border-collapse: collapse;
            }
            .totals td {
              padding: 8px 12px;
              border-bottom: 1px solid #ddd;
            }
            .totals .total-row {
              font-weight: bold;
              font-size: 18px;
              background-color: #f5f5f5;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .payment-status {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .payment-completed {
              background-color: #d4edda;
              color: #155724;
            }
            .payment-pending {
              background-color: #fff3cd;
              color: #856404;
            }
            .payment-failed {
              background-color: #f8d7da;
              color: #721c24;
            }
            @media print {
              body { margin: 0; }
              .invoice-container { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="logo">Sonna's Cafe</div>
              <div class="invoice-info">
                <div class="invoice-title">INVOICE</div>
                <div><strong>Invoice #:</strong> ${invoiceData.orderNumber}</div>
                <div><strong>Date:</strong> ${format(invoiceData.orderDate, 'dd/MM/yyyy')}</div>
                <div><strong>Status:</strong> 
                  <span class="payment-status payment-${invoiceData.paymentStatus}">
                    ${invoiceData.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div class="company-info">
              <h3>From:</h3>
              <div><strong>Sonna's Cafe</strong></div>
              <div>123 Food Street</div>
              <div>Foodie District, City 123456</div>
              <div>Phone: +91 98765 43210</div>
              <div>Email: orders@sonnascafe.com</div>
              <div>GST: 29ABCDE1234F1Z5</div>
            </div>

            <div class="billing-info">
              <div class="info-section">
                <h3>Bill To:</h3>
                <div><strong>${invoiceData.customerName}</strong></div>
                <div>${invoiceData.customerEmail}</div>
                ${invoiceData.customerPhone ? `<div>${invoiceData.customerPhone}</div>` : ''}
              </div>
              <div class="info-section">
                <h3>Deliver To:</h3>
                <div>${invoiceData.deliveryAddress.addressLine1}</div>
                ${invoiceData.deliveryAddress.addressLine2 ? `<div>${invoiceData.deliveryAddress.addressLine2}</div>` : ''}
                <div>${invoiceData.deliveryAddress.city}, ${invoiceData.deliveryAddress.state}</div>
                <div>${invoiceData.deliveryAddress.postalCode}</div>
                <div>${invoiceData.deliveryAddress.country}</div>
              </div>
            </div>

            <div class="table-container">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.items.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td class="quantity">${item.quantity}</td>
                      <td class="price">₹${item.unitPrice.toFixed(2)}</td>
                      <td class="price">₹${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="totals">
              <table>
                <tr>
                  <td>Subtotal:</td>
                  <td class="price">₹${invoiceData.subtotal.toFixed(2)}</td>
                </tr>
                ${invoiceData.discount > 0 ? `
                <tr>
                  <td>Discount:</td>
                  <td class="price">-₹${invoiceData.discount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td>Delivery Fee:</td>
                  <td class="price">₹${invoiceData.deliveryFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Tax (GST):</td>
                  <td class="price">₹${invoiceData.tax.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td>Total:</td>
                  <td class="price">₹${invoiceData.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <div class="footer">
              <p><strong>Thank you for your business!</strong></p>
              <p>This is a computer-generated invoice. No signature required.</p>
              <p>For any queries, please contact us at support@sonnascafe.com or +91 98765 43210</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return html;
    } catch (error) {
      console.error('Error generating invoice HTML:', error);
      throw new AppError('Failed to generate invoice HTML', 500);
    }
  }

  static async getInvoiceStatistics(dateRange?: { from: Date; to: Date }) {
    try {
      const fromDate = dateRange?.from || new Date(new Date().getFullYear(), 0, 1); // Start of year
      const toDate = dateRange?.to || new Date();

      // Total invoices and revenue
      const [totalStats] = await db
        .select({
          totalInvoices: sql<number>`COUNT(*)`,
          totalRevenue: sql<number>`SUM(CAST(${orders.total} AS DECIMAL))`,
          paidInvoices: sql<number>`COUNT(CASE WHEN ${orders.paymentStatus} = 'completed' THEN 1 END)`,
          paidRevenue: sql<number>`SUM(CASE WHEN ${orders.paymentStatus} = 'completed' THEN CAST(${orders.total} AS DECIMAL) ELSE 0 END)`,
          pendingInvoices: sql<number>`COUNT(CASE WHEN ${orders.paymentStatus} = 'pending' THEN 1 END)`,
          pendingRevenue: sql<number>`SUM(CASE WHEN ${orders.paymentStatus} = 'pending' THEN CAST(${orders.total} AS DECIMAL) ELSE 0 END)`
        })
        .from(orders)
        .where(between(orders.createdAt, fromDate, toDate));

      // Monthly breakdown
      const monthlyStats = await db
        .select({
          month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
          invoices: sql<number>`COUNT(*)`,
          revenue: sql<number>`SUM(CAST(${orders.total} AS DECIMAL))`,
          avgOrderValue: sql<number>`AVG(CAST(${orders.total} AS DECIMAL))`
        })
        .from(orders)
        .where(between(orders.createdAt, fromDate, toDate))
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`);

      return {
        summary: {
          totalInvoices: Number(totalStats.totalInvoices || 0),
          totalRevenue: Number(totalStats.totalRevenue || 0),
          paidInvoices: Number(totalStats.paidInvoices || 0),
          paidRevenue: Number(totalStats.paidRevenue || 0),
          pendingInvoices: Number(totalStats.pendingInvoices || 0),
          pendingRevenue: Number(totalStats.pendingRevenue || 0),
          averageOrderValue: totalStats.totalInvoices > 0 
            ? Number(totalStats.totalRevenue) / Number(totalStats.totalInvoices) 
            : 0
        },
        monthlyBreakdown: monthlyStats.map(stat => ({
          month: stat.month,
          invoices: Number(stat.invoices || 0),
          revenue: Number(stat.revenue || 0),
          avgOrderValue: Number(stat.avgOrderValue || 0)
        }))
      };
    } catch (error) {
      console.error('Error fetching invoice statistics:', error);
      throw new AppError('Failed to fetch invoice statistics', 500);
    }
  }

  static async getAllInvoices(options: {
    page?: number;
    limit?: number;
    paymentStatus?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: 'createdAt' | 'total' | 'orderNumber';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        paymentStatus,
        search,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const conditions = [];
      
      if (paymentStatus) {
        conditions.push(eq(orders.paymentStatus, paymentStatus as 'pending' | 'completed' | 'failed' | 'refunded'));
      }
      if (dateFrom) conditions.push(sql`${orders.createdAt} >= ${dateFrom}`);
      if (dateTo) conditions.push(sql`${orders.createdAt} <= ${dateTo}`);
      if (search) {
        conditions.push(sql`(
          ${orders.orderNumber} ILIKE ${`%${search}%`} OR
          ${users.email} ILIKE ${`%${search}%`} OR
          CONCAT(${users.firstName}, ' ', ${users.lastName}) ILIKE ${`%${search}%`}
        )`);
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [totalCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(whereCondition);

      // Get invoices
      const sortColumn = sortBy === 'total' ? orders.total : 
                        sortBy === 'orderNumber' ? orders.orderNumber : orders.createdAt;
      const sortDirection = sortOrder === 'asc' ? sql`ASC` : sql`DESC`;

      const invoices = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          customerEmail: users.email,
          total: orders.total,
          paymentStatus: orders.paymentStatus,
          createdAt: orders.createdAt
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(whereCondition)
        .orderBy(sql`${sortColumn} ${sortDirection}`)
        .limit(limit)
        .offset((page - 1) * limit);

      return {
        invoices: invoices.map(invoice => ({
          ...invoice,
          total: Number(invoice.total),
          customerName: invoice.customerName?.trim() || 'Unknown Customer'
        })),
        total: Number(totalCount.count || 0),
        page,
        limit,
        totalPages: Math.ceil(Number(totalCount.count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw new AppError('Failed to fetch invoices', 500);
    }
  }
}
