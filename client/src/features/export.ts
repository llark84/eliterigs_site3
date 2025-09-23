import { PCComponent, BuildCompatibility } from '@shared/schema';

// HTML sanitization helper to prevent XSS
function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export interface BuildExportData {
  buildName: string;
  components: { [category: string]: PCComponent };
  accessories?: { [id: string]: any };
  totalPrice: number;
  componentPrice?: number;
  accessoryPrice?: number;
  compatibility: BuildCompatibility | null;
  exportDate: string;
  metadata: {
    builderVersion: string;
    componentCount: number;
    accessoryCount: number;
    isComplete: boolean;
    compatibilityScore: number;
  };
  links: {
    [componentId: string]: {
      amazon?: string;
      newegg?: string;
      bestbuy?: string;
      microcenter?: string;
    };
  };
}

/**
 * Export build data as JSON
 */
export function exportBuildAsJSON(
  selectedComponents: { [category: string]: PCComponent },
  totalPrice: number,
  compatibility: BuildCompatibility | null,
  buildName?: string,
  selectedAccessories?: { [id: string]: any },
  componentPrice?: number,
  accessoryPrice?: number
): string {
  const requiredCategories = ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'PSU', 'Case'];
  const componentCount = Object.keys(selectedComponents).length;
  const accessoryCount = selectedAccessories ? Object.keys(selectedAccessories).length : 0;
  const missingCategories = requiredCategories.filter((cat) => !selectedComponents[cat]);
  const isComplete = missingCategories.length === 0;

  // Calculate compatibility score
  let compatibilityScore = 100;
  if (compatibility) {
    compatibilityScore = Math.max(
      0,
      100 - compatibility.hardFails.length * 15 - compatibility.softWarns.length * 5
    );
  }

  // Generate mock vendor links for components
  const links: BuildExportData['links'] = {};
  Object.values(selectedComponents).forEach((component) => {
    const cleanName = encodeURIComponent(component.name.replace(/[^\w\s-]/gi, ''));
    links[component.id] = {
      amazon: `https://amazon.com/s?k=${cleanName}`,
      newegg: `https://newegg.com/p/pl?d=${cleanName}`,
      bestbuy: `https://bestbuy.com/site/searchpage.jsp?st=${cleanName}`,
      microcenter: `https://microcenter.com/search/search_results.aspx?N=&cat=&Ntt=${cleanName}`,
    };
  });

  const exportData: BuildExportData = {
    buildName: buildName || `PC Build - ${new Date().toLocaleDateString()}`,
    components: selectedComponents,
    accessories: selectedAccessories,
    totalPrice,
    componentPrice,
    accessoryPrice,
    compatibility,
    exportDate: new Date().toISOString(),
    metadata: {
      builderVersion: '2.0',
      componentCount,
      accessoryCount,
      isComplete,
      compatibilityScore,
    },
    links,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download JSON export file
 */
export function downloadJSONExport(
  selectedComponents: { [category: string]: PCComponent },
  totalPrice: number,
  compatibility: BuildCompatibility | null,
  buildName?: string,
  selectedAccessories?: { [id: string]: any },
  componentPrice?: number,
  accessoryPrice?: number
) {
  const jsonData = exportBuildAsJSON(
    selectedComponents,
    totalPrice,
    compatibility,
    buildName,
    selectedAccessories,
    componentPrice,
    accessoryPrice
  );
  const fileName = `${buildName || 'PC-Build'}-${new Date().toISOString().split('T')[0]}.json`;

  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate print-friendly HTML
 */
export function generatePrintHTML(
  selectedComponents: { [category: string]: PCComponent },
  totalPrice: number,
  compatibility: BuildCompatibility | null,
  buildName?: string,
  pricingData?: {
    totalLowestPrice: number;
    vendorBreakdown: { [vendor: string]: { total: number; components: number } };
    generatedAt: string;
  },
  selectedAccessories?: { [id: string]: any },
  componentPrice?: number,
  accessoryPrice?: number
): string {
  const requiredCategories = ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'PSU', 'Case'];
  const componentCount = Object.keys(selectedComponents).length;
  const accessoryCount = selectedAccessories ? Object.keys(selectedAccessories).length : 0;
  const missingCategories = requiredCategories.filter((cat) => !selectedComponents[cat]);
  const isComplete = missingCategories.length === 0;

  // Calculate compatibility score
  let compatibilityScore = 100;
  if (compatibility) {
    compatibilityScore = Math.max(
      0,
      100 - compatibility.hardFails.length * 15 - compatibility.softWarns.length * 5
    );
  }

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;
  const printDate = new Date().toLocaleDateString();

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHTML(buildName || 'PC Build')} - EliteRigs</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .build-title {
          font-size: 2.5em;
          margin: 0 0 10px 0;
          color: #1e40af;
        }
        .build-meta {
          color: #666;
          font-size: 1.1em;
        }
        .section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 15px;
          color: #1e40af;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
        }
        .components-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .components-table th,
        .components-table td {
          border: 1px solid #d1d5db;
          padding: 12px;
          text-align: left;
        }
        .components-table th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        .components-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .price-summary {
          background-color: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        .compatibility-status {
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }
        .compatibility-success {
          background-color: #ecfdf5;
          border-left: 4px solid #10b981;
        }
        .compatibility-warning {
          background-color: #fffbeb;
          border-left: 4px solid #f59e0b;
        }
        .compatibility-error {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
        }
        .compatibility-issues {
          margin-top: 10px;
        }
        .compatibility-issues ul {
          margin: 5px 0;
          padding-left: 20px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #666;
          font-size: 0.9em;
        }
        .vendor-breakdown {
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }
        .vendor-breakdown h4 {
          margin-top: 0;
          color: #1e40af;
        }
        @media print {
          body {
            padding: 0;
          }
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="build-title">${escapeHTML(buildName || 'PC Build Configuration')}</h1>
        <div class="build-meta">
          Generated on ${printDate} • EliteRigs PC Builder v2.0
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Build Summary</h2>
        <div class="price-summary">
          <strong>Total Build Cost:</strong> ${formatPrice(totalPrice)}<br>
          ${componentCount > 0 ? `<strong>Components (${componentCount}):</strong> ${formatPrice(componentPrice || 0)}<br>` : ''}
          ${accessoryCount > 0 ? `<strong>Accessories (${accessoryCount}):</strong> ${formatPrice(accessoryPrice || 0)}<br>` : ''}
          <strong>Status:</strong> ${isComplete ? 'Complete Build' : `Missing ${missingCategories.length} component(s)`}<br>
          <strong>Compatibility Score:</strong> ${compatibilityScore}/100
        </div>
        ${
          pricingData
            ? `
          <div class="vendor-breakdown">
            <h4>Best Price Available: ${formatPrice(pricingData.totalLowestPrice)}</h4>
            <p>Potential savings: ${formatPrice(totalPrice - pricingData.totalLowestPrice)}</p>
            <p><small>Prices last updated: ${new Date(pricingData.generatedAt).toLocaleString()}</small></p>
          </div>
        `
            : ''
        }
      </div>

      <div class="section">
        <h2 class="section-title">Component List</h2>
        <table class="components-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Specifications</th>
              <th>Price</th>
              <th>Spec Source</th>
              <th>Verified At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
  `;

  // Add component rows
  Object.entries(selectedComponents).forEach(([category, component]) => {
    // Format provenance information
    const formatSpecUrl = (url: string | null) => {
      if (!url) return 'N/A';
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        return `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(domain)}</a>`;
      } catch {
        return escapeHTML(url);
      }
    };

    const formatVerifiedAt = (date: string | null) => {
      if (!date) return 'Never';
      try {
        return new Date(date).toLocaleDateString();
      } catch {
        return 'Invalid date';
      }
    };

    const formatStatus = (component: any) => {
      if (!component.specUrl) return 'No Source';
      if (!component.verifiedAt) return 'Unknown';
      if (component.lastStatus === 'changed') return 'Changed';

      const verifiedDate = new Date(component.verifiedAt);
      const daysSinceVerified = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceVerified >= 14) return 'Stale';
      return 'Fresh';
    };

    html += `
      <tr>
        <td><strong>${escapeHTML(category)}</strong></td>
        <td>${escapeHTML(component.brand)}</td>
        <td>${escapeHTML(component.name)}</td>
        <td>${escapeHTML(component.spec || 'N/A')}</td>
        <td>${formatPrice(component.price)}</td>
        <td>${formatSpecUrl(component.specUrl)}</td>
        <td>${formatVerifiedAt(component.verifiedAt)}</td>
        <td>${escapeHTML(formatStatus(component))}</td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>
  `;

  // Accessories section
  if (selectedAccessories && accessoryCount > 0) {
    html += `
      <div class="section">
        <h2 class="section-title">Selected Accessories</h2>
        <table class="components-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
    `;

    Object.entries(selectedAccessories).forEach(([id, accessory]) => {
      html += `
        <tr>
          <td><strong>${escapeHTML(accessory.name)}</strong></td>
          <td>${escapeHTML(accessory.category || 'Accessory')}</td>
          <td>${escapeHTML(accessory.description || 'N/A')}</td>
          <td>${formatPrice(accessory.lowestPrice || accessory.price || 0)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  // Missing components section
  if (!isComplete) {
    html += `
      <div class="section">
        <h2 class="section-title">Missing Components</h2>
        <p>The following components are recommended to complete your build:</p>
        <ul>
          ${missingCategories.map((cat) => `<li>${escapeHTML(cat)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // Compatibility section
  if (compatibility) {
    const statusClass =
      compatibility.hardFails.length > 0
        ? 'compatibility-error'
        : compatibility.softWarns.length > 0
          ? 'compatibility-warning'
          : 'compatibility-success';
    const statusText =
      compatibility.hardFails.length > 0
        ? 'Issues Found'
        : compatibility.softWarns.length > 0
          ? 'Warnings'
          : 'Compatible';

    html += `
      <div class="section">
        <h2 class="section-title">Compatibility Check</h2>
        <div class="compatibility-status ${statusClass}">
          <strong>Status:</strong> ${statusText} (Score: ${compatibilityScore}/100)
          
          ${
            compatibility.hardFails.length > 0
              ? `
            <div class="compatibility-issues">
              <strong>Critical Issues:</strong>
              <ul>
                ${compatibility.hardFails.map((issue) => `<li>${escapeHTML(typeof issue === 'string' ? issue : issue.details || '')}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }
          
          ${
            compatibility.softWarns.length > 0
              ? `
            <div class="compatibility-issues">
              <strong>Warnings:</strong>
              <ul>
                ${compatibility.softWarns.map((warning: any) => `<li>${escapeHTML(warning.issue)}: ${escapeHTML(warning.details)}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }
          
        </div>
      </div>
    `;
  }

  html += `
      <div class="footer">
        <p>Generated by EliteRigs PC Builder • For personal use only</p>
        <p>Prices and availability subject to change • Always verify compatibility before purchasing</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Open print-friendly view in new window
 */
export function openPrintView(
  selectedComponents: { [category: string]: PCComponent },
  totalPrice: number,
  compatibility: BuildCompatibility | null,
  buildName?: string,
  pricingData?: {
    totalLowestPrice: number;
    vendorBreakdown: { [vendor: string]: { total: number; components: number } };
    generatedAt: string;
  },
  selectedAccessories?: { [id: string]: any },
  componentPrice?: number,
  accessoryPrice?: number
) {
  const printHTML = generatePrintHTML(
    selectedComponents,
    totalPrice,
    compatibility,
    buildName,
    pricingData,
    selectedAccessories,
    componentPrice,
    accessoryPrice
  );

  const printWindow = window.open('', '_blank', 'width=800,height=600,noopener,noreferrer');
  if (printWindow) {
    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Auto-trigger print dialog after content loads
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    });
  } else {
    // Fallback for popup blockers
    alert(
      'Please allow popups to open the print view, or try downloading the JSON export instead.'
    );
  }
}

/**
 * Import build data from JSON
 */
export function importBuildFromJSON(jsonData: string): {
  selectedComponents: { [category: string]: PCComponent };
  totalPrice: number;
  compatibility: BuildCompatibility | null;
  buildName: string;
  metadata?: any;
} | null {
  try {
    const data: BuildExportData = JSON.parse(jsonData);

    // Validate required fields
    if (!data.components || !data.totalPrice || typeof data.totalPrice !== 'number') {
      throw new Error('Invalid build data format');
    }

    return {
      selectedComponents: data.components,
      totalPrice: data.totalPrice,
      compatibility: data.compatibility,
      buildName: data.buildName,
      metadata: data.metadata,
    };
  } catch (error) {
    console.error('Failed to import build data:', error);
    return null;
  }
}
