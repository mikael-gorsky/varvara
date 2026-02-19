import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

interface ImportProgress {
  status: 'idle' | 'parsing' | 'uploading' | 'complete' | 'error';
  message: string;
  customers?: number;
  transactions?: number;
  customerGroups?: Record<string, number>;
  productCategories?: Record<string, number>;
}

// Valid customer groups (case-insensitive matching)
const VALID_CUSTOMER_GROUPS = [
  'конечные заказчики',
  'крупный опт -торговые сети',
  'маркетплейсы',
  'мелкий опт',
  'тендеры',
];

function isValidCustomerGroup(str: string): string | undefined {
  const normalized = str.toLowerCase().trim();
  return VALID_CUSTOMER_GROUPS.find(group => normalized === group || normalized.startsWith(group));
}

function getProductCategory(productName: string): string {
  if (!productName || typeof productName !== 'string') return 'zzz';

  const trimmed = productName.trim();
  const cyrillicLetters = trimmed.match(/[а-яё]/gi);

  if (!cyrillicLetters || cyrillicLetters.length === 0) return 'zzz';

  const prefix = cyrillicLetters.slice(0, 3).join('').toLowerCase();
  return prefix.padEnd(3, 'z');
}

const ImportSalesModule: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<ImportProgress>({ status: 'idle', message: '' });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProgress({ status: 'idle', message: `Selected: ${file.name}` });
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setProgress({ status: 'error', message: 'Please select a file first' });
      return;
    }

    setProgress({ status: 'parsing', message: 'Reading Excel file...' });

    try {
      // Read file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', codepage: 65001 });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as any[][];

      setProgress({ status: 'parsing', message: `Parsing ${data.length} rows...` });

      // Parse data
      let currentPeriod: string | null = null;
      let currentCustomerGroup: string | null = null;
      let currentCustomer: string | null = null;
      let currentCustomerINN: string | null = null;

      const customers = new Map<string, { name: string; inn: string; category: string }>();
      const transactions: any[] = [];

      for (let i = 10; i < data.length; i++) {
        const row = data[i];
        const cellA = row[0];

        if (!cellA || cellA === 'Итого') continue;

        const cellAStr = String(cellA).trim();

        const quantity = row[5] ? parseFloat(row[5]) : 0;
        const sales_rub = row[6] ? parseFloat(row[6]) : 0;
        const cogs_rub = row[7] ? parseFloat(row[7]) : 0;
        const additional_expenses_rub = row[8] ? parseFloat(row[8]) : 0;

        if (quantity === 0 && sales_rub === 0 && cogs_rub === 0 && additional_expenses_rub === 0) {
          continue;
        }

        // Check if period row
        if (cellAStr.match(/^\d{2}\.\d{2}\.\d{4}/)) {
          const dateMatch = cellAStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
          if (dateMatch) {
            const [_, day, month, year] = dateMatch;
            currentPeriod = `${year}-${month}-01`;
          }
          continue;
        }

        // Check if customer group row
        const matchedGroup = isValidCustomerGroup(cellAStr);
        if (matchedGroup) {
          currentCustomerGroup = matchedGroup;
          continue;
        }

        // Check if customer row
        const innMatch = cellAStr.match(/,\s*(\d+)$/);
        if (innMatch) {
          const inn = innMatch[1];
          const customerName = cellAStr.replace(/,\s*\d+$/, '').trim();

          currentCustomer = customerName;
          currentCustomerINN = inn;

          if (!customers.has(customerName)) {
            customers.set(customerName, {
              name: customerName,
              inn: inn,
              category: currentCustomerGroup || 'Неизвестно',
            });
          }

          continue;
        }

        // Product row
        if (currentCustomer && currentPeriod) {
          const productName = cellAStr;
          const productCategory = getProductCategory(productName);

          transactions.push({
            period_date: currentPeriod,
            customer_name: currentCustomer,
            customer_inn: currentCustomerINN,
            customer_category: currentCustomerGroup || 'Неизвестно',
            product_name: productName,
            product_category: productCategory,
            quantity,
            revenue_rub: sales_rub,
            cogs_rub,
            additional_expenses_rub: additional_expenses_rub || 0,
          });
        }
      }

      // Calculate stats
      const customerGroups: Record<string, number> = {};
      const productCategories: Record<string, number> = {};

      transactions.forEach(t => {
        customerGroups[t.customer_category] = (customerGroups[t.customer_category] || 0) + 1;
        productCategories[t.product_category] = (productCategories[t.product_category] || 0) + 1;
      });

      setProgress({
        status: 'uploading',
        message: 'Uploading to database...',
        customers: customers.size,
        transactions: transactions.length,
        customerGroups,
        productCategories,
      });

      // Insert customers
      const customerRecords = Array.from(customers.values());
      const { data: insertedCustomers, error: customerError } = await supabase
        .from('customers')
        .upsert(customerRecords, { onConflict: 'name', ignoreDuplicates: false })
        .select();

      if (customerError) throw customerError;

      // Create customer ID map
      const customerIdMap = new Map<string, string>();
      insertedCustomers?.forEach((c: any) => {
        customerIdMap.set(c.name, c.id);
      });

      // Prepare transaction records
      const transactionRecords = transactions.map(t => ({
        period_date: t.period_date,
        customer_id: customerIdMap.get(t.customer_name),
        customer_category: t.customer_category,
        product_name: t.product_name,
        product_category: t.product_category,
        quantity: t.quantity || 0,
        revenue_rub: t.revenue_rub || 0,
        cogs_rub: t.cogs_rub || 0,
        additional_expenses_rub: t.additional_expenses_rub || 0,
      }));

      // Insert transactions in batches
      const BATCH_SIZE = 1000;
      for (let i = 0; i < transactionRecords.length; i += BATCH_SIZE) {
        const batch = transactionRecords.slice(i, i + BATCH_SIZE);
        const { error: txError } = await supabase
          .from('margin_analytics_data')
          .insert(batch);

        if (txError) throw txError;

        setProgress({
          status: 'uploading',
          message: `Uploaded ${Math.min(i + BATCH_SIZE, transactionRecords.length)} / ${transactionRecords.length} transactions...`,
          customers: customers.size,
          transactions: transactions.length,
          customerGroups,
          productCategories,
        });
      }

      setProgress({
        status: 'complete',
        message: 'Import complete!',
        customers: customers.size,
        transactions: transactions.length,
        customerGroups,
        productCategories,
      });

    } catch (error: any) {
      setProgress({
        status: 'error',
        message: `Import failed: ${error.message}`,
      });
    }
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Page Title */}
      <div className="mb-8">
        <h2
          className="text-page-title-mobile md:text-page-title-desktop uppercase mb-2"
          style={{ color: 'var(--accent)' }}
        >
          IMPORT SALES-MARGIN REPORT
        </h2>
        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
          Import 1C sales analysis Excel files
        </p>
      </div>

      {/* File Selection */}
      <div className="mb-6 p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-label uppercase mb-4" style={{ color: 'var(--text-secondary)' }}>
          SELECT FILE
        </p>

        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileSelect}
          className="mb-4 text-body"
          style={{ color: 'var(--text-primary)' }}
        />

        {selectedFile && (
          <div className="mb-4">
            <p className="text-body-sm" style={{ color: 'var(--text-tertiary)' }}>
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!selectedFile || progress.status === 'parsing' || progress.status === 'uploading'}
          className="px-6 py-3 text-body uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: '#E91E63', color: 'white' }}
        >
          {progress.status === 'parsing' || progress.status === 'uploading' ? 'IMPORTING...' : 'IMPORT'}
        </button>
      </div>

      {/* Progress */}
      {progress.status !== 'idle' && (
        <div
          className="p-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderLeft: `2px solid ${
              progress.status === 'error' ? 'var(--status-error)' :
              progress.status === 'complete' ? '#E91E63' :
              'var(--text-tertiary)'
            }`
          }}
        >
          <p
            className="text-body mb-4"
            style={{
              color: progress.status === 'error' ? 'var(--status-error)' : 'var(--text-primary)'
            }}
          >
            {progress.message}
          </p>

          {progress.customers !== undefined && (
            <div className="space-y-4">
              <div>
                <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  SUMMARY
                </p>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  Customers: {progress.customers} | Transactions: {progress.transactions}
                </p>
              </div>

              {progress.customerGroups && (
                <div>
                  <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    CUSTOMER GROUPS
                  </p>
                  {Object.entries(progress.customerGroups).map(([group, count]) => (
                    <p key={group} className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      {group}: {count} transactions
                    </p>
                  ))}
                </div>
              )}

              {progress.productCategories && (
                <div>
                  <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    TOP PRODUCT CATEGORIES
                  </p>
                  {Object.entries(progress.productCategories)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([cat, count]) => (
                      <p key={cat} className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        {cat}: {count} transactions
                      </p>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportSalesModule;
