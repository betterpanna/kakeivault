/**
 * English (en) translation strings.
 * Must have identical keys to ja-JP.ts.
 */
export const en = {
  // App
  'app.name': 'KakeiVault',
  'app.tagline': 'Personal Finance & Document Vault',

  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.transactions': 'Transactions',
  'nav.scan': 'Scan',
  'nav.scanUpload': 'Scan & Upload',
  'nav.salarySlips': 'Salary Slips',
  'nav.documents': 'Documents',
  'nav.budgets': 'Budgets',
  'nav.settings': 'Settings',

  // Auth
  'auth.login': 'Log In',
  'auth.logout': 'Log Out',
  'auth.register': 'Create Account',
  'auth.email': 'Email address',
  'auth.password': 'Password',
  'auth.forgotPassword': 'Forgot password?',
  'auth.resetPassword': 'Reset password',
  'auth.verifyEmail': 'Verify email',
  'auth.emailVerificationSent': 'Verification email sent. Please check your inbox.',
  'auth.emailVerified': 'Email address verified.',
  'auth.passwordMinLength': 'Password must be at least 8 characters',
  'auth.passwordRequiresUppercase': 'Password must contain an uppercase letter',
  'auth.passwordRequiresDigit': 'Password must contain a digit',
  'auth.invalidCredentials': 'Incorrect email address or password',
  'auth.rateLimited': 'Too many attempts. Please try again later.',

  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.totalIncome': 'Total Income',
  'dashboard.totalExpenses': 'Total Expenses',
  'dashboard.savings': 'Savings',
  'dashboard.remainingBudget': 'Remaining Budget',
  'dashboard.recentTransactions': 'Recent Transactions',
  'dashboard.categorySpending': 'Category Spending',
  'dashboard.noBudgetSet': 'No budget set',
  'dashboard.noTransactions': 'No transactions yet',

  // Transactions
  'transaction.income': 'Income',
  'transaction.expense': 'Expense',
  'transaction.date': 'Date',
  'transaction.amount': 'Amount',
  'transaction.merchant': 'Merchant',
  'transaction.category': 'Category',
  'transaction.paymentMethod': 'Payment method',
  'transaction.notes': 'Notes',
  'transaction.create': 'Add transaction',
  'transaction.edit': 'Edit transaction',
  'transaction.delete': 'Delete transaction',
  'transaction.confirmDelete': 'Delete this transaction?',

  // Payment methods
  'paymentMethod.cash': 'Cash',
  'paymentMethod.credit_card': 'Credit card',
  'paymentMethod.debit_card': 'Debit card',
  'paymentMethod.electronic_money': 'Electronic money',
  'paymentMethod.bank_transfer': 'Bank transfer',
  'paymentMethod.qr_code': 'QR code',
  'paymentMethod.other': 'Other',

  // Categories
  'category.food': 'Food',
  'category.daily_necessities': 'Daily necessities',
  'category.transportation': 'Transportation',
  'category.rent': 'Rent',
  'category.utilities': 'Utilities',
  'category.medical': 'Medical',
  'category.education': 'Education',
  'category.entertainment': 'Entertainment',
  'category.shopping': 'Shopping',
  'category.insurance': 'Insurance',
  'category.tax': 'Tax',
  'category.other': 'Other',

  // Document categories
  'documentCategory.salary_slip': 'Salary Slip',
  'documentCategory.tax': 'Tax Document',
  'documentCategory.insurance': 'Insurance',
  'documentCategory.employment': 'Employment',
  'documentCategory.utility': 'Utility Bill',
  'documentCategory.invoice': 'Invoice',
  'documentCategory.warranty': 'Warranty',
  'documentCategory.other': 'Other',

  // OCR
  'ocr.status.uploaded': 'Uploaded',
  'ocr.status.queued': 'Queued',
  'ocr.status.processing': 'Processing',
  'ocr.status.review_required': 'Review required',
  'ocr.status.confirmed': 'Confirmed',
  'ocr.status.failed': 'Failed',
  'ocr.status.deleted': 'Deleted',
  'ocr.scanning': 'Scanning...',
  'ocr.reviewTitle': 'Review scan results',
  'ocr.lowConfidence': 'Low-confidence fields',
  'ocr.confirmTransaction': 'Confirm transaction',
  'ocr.correctData': 'Correct data',

  // Budget
  'budget.title': 'Budgets',
  'budget.monthly': 'Monthly budget',
  'budget.overall': 'Overall budget',
  'budget.category': 'Category budget',
  'budget.set': 'Set budget',
  'budget.warning.over': '{{category}} budget exceeded ({{percent}}%)',
  'budget.warning.near': '{{category}} budget nearly reached ({{percent}}%)',

  // Documents
  'document.title': 'Document title',
  'document.date': 'Document date',
  'document.tags': 'Tags',
  'document.notes': 'Notes',
  'document.upload': 'Upload document',
  'document.download': 'Download',
  'document.delete': 'Delete',
  'document.confirmDelete': 'Delete this document?',
  'document.retention': 'Retention period',

  // Salary
  'salary.employerName': 'Employer',
  'salary.paymentMonth': 'Payment month',
  'salary.basicSalary': 'Basic salary',
  'salary.overtime': 'Overtime',
  'salary.allowances': 'Allowances',
  'salary.grossSalary': 'Gross salary',
  'salary.incomeTax': 'Income tax',
  'salary.residentTax': 'Resident tax',
  'salary.pension': 'Pension',
  'salary.healthInsurance': 'Health insurance',
  'salary.employmentInsurance': 'Employment insurance',
  'salary.otherDeductions': 'Other deductions',
  'salary.totalDeductions': 'Total deductions',
  'salary.netSalary': 'Net salary',
  'salary.confirm': 'Confirm salary',
  'salary.validation.grossMismatch': 'Gross salary does not match the sum of components',
  'salary.validation.deductionsMismatch': 'Total deductions do not match individual deductions',
  'salary.validation.netMismatch': 'Net salary does not match gross minus total deductions',
  'salary.validation.negativeNet': 'Net salary is negative',

  // Receipt validation
  'receipt.validation.subtotalPlusTaxMismatch': 'Subtotal + tax does not match total',
  'receipt.validation.lineItemSumMismatch': 'Sum of line items does not match total',
  'receipt.validation.negativeTotal': 'Total amount is negative',

  // Settings
  'settings.language': 'Language',
  'settings.language.ja': '日本語',
  'settings.language.en': 'English',
  'settings.privacySettings': 'Privacy settings',
  'settings.exportData': 'Export data',
  'settings.deleteAccount': 'Delete account',
  'settings.deleteAccountConfirm':
    'This will permanently delete your account and all data. This action cannot be undone.',

  // Common
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.confirm': 'Confirm',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.loading': 'Loading...',
  'common.error': 'An error occurred',
  'common.retry': 'Retry',
  'common.noData': 'No data',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.export': 'Export',
  'common.required': 'Required',
  'common.optional': 'Optional',

  // Errors
  'error.network': 'Network error',
  'error.unauthorized': 'Authentication required',
  'error.forbidden': 'Access denied',
  'error.notFound': 'Not found',
  'error.serverError': 'Server error',
  'error.fileTooLarge': 'File is too large (max 20 MB)',
  'error.unsupportedFile': 'Unsupported file type',

  // Offline
  'offline.draft': 'Draft (offline)',
  'offline.uploading': 'Uploading',
  'offline.synced': 'Synced',
  'offline.failed': 'Upload failed',
  'offline.retrying': 'Retrying',
} as const
